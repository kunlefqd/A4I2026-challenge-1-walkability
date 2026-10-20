#!/usr/bin/env python3
import asyncio
import json
import os
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from urllib.parse import urlparse

from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parent.parent
for env_path in [PROJECT_ROOT / '.env', PROJECT_ROOT / 'frontend' / '.env.local']:
    if env_path.exists():
        load_dotenv(env_path)
load_dotenv()

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from google.adk.runners import InMemoryRunner
from google.genai import types

from agent.agent import root_agent


def _has_model_credentials() -> bool:
    return bool(
        os.environ.get('GOOGLE_API_KEY')
        or (
            os.environ.get('GOOGLE_CLOUD_PROJECT')
            and os.environ.get('GOOGLE_CLOUD_LOCATION')
        )
    )


async def _call_adk_agent(prompt: str) -> str:
    runner = InMemoryRunner(agent=root_agent, app_name='chicago-heat-planner-app')
    runner.auto_create_session = True
    final_text = ''
    session_id = f'chicago-agent-{abs(hash(prompt)) % 1000000}'

    async for event in runner.run_async(
        user_id='frontend-user',
        session_id=session_id,
        new_message=types.UserContent(parts=[types.Part(text=prompt)]),
    ):
        if event.is_final_response():
            content = getattr(event, 'content', None)
            parts = getattr(content, 'parts', None) or []
            for part in parts:
                text = getattr(part, 'text', None)
                if text:
                    final_text += text

    return final_text.strip() if final_text else 'The ADK agent responded without text output.'


def _fallback_cards_from_rows(live_risk_rows):
    rows = live_risk_rows[:3] if isinstance(live_risk_rows, list) else []
    cards = []
    for idx, row in enumerate(rows, start=1):
        risk = float(row.get('combined_priority_score', 0.5) or 0.5)
        hazard = float(row.get('normalized_heat_hazard', 0.5) or 0.5)
        cards.append({
            'id': f'agent-fallback-{idx}',
            'rank': idx,
            'tractId': row.get('geo_id', f'fallback-{idx}'),
            'tractName': f"Chicago tract {row.get('geo_id', idx)}",
            'locationDetails': 'Priority tract from a4i_climate.tract_heat_risk',
            'bqmlHeatOffset': f"+{(hazard * 11):.1f}°F",
            'riskScore': round(risk * 10, 1),
            'gapDistance': f"{(idx + 0.9):.1f} miles to closest cooling center",
            'demographics': {
                'zeroVehicle': f"{float(row.get('no_vehicle_rate', 30) or 30):.1f}%",
                'seniors': f"{float(row.get('over_65_rate', 15) or 15):.1f}%",
                'poverty': f"{float(row.get('poverty_rate', 25) or 25):.1f}%",
                'canopyCover': f"{max(5.0, 12.0 - idx):.1f}%"
            },
            'projectedImpact': 'Prioritize cool-zone coverage and transit-based resilience measures.',
            'recommendedType': 'Cooling depot and transit shade package',
            'estCost': '$875,000',
            'fundingOption': 'Climate equity grant pool'
        })
    return cards


def _fallback_response(query: str, selected_tract=None, live_risk_rows=None):
    q = (query or '').lower()
    selected_label = selected_tract.get('name') if isinstance(selected_tract, dict) else None
    cards = _fallback_cards_from_rows(live_risk_rows)

    if 'cooling center' in q or 'place 3' in q or 'new cooling' in q:
        content = (
            '### 🎯 Cooling Center Prioritization\n\n'
            'The highest-priority tracts are the ones with the highest combined heat hazard and social vulnerability scores. '
            'The next placement should focus on corridors with transit dependence, low canopy, and limited cooling access.\n\n'
            '- Prioritize tracts with the highest combined priority score and no-car households.\n'
            '- Stage mobile hydration and shade at the top-ranked stops before expanding permanent centers.\n'
            '- Keep a transit-first deployment so residents without vehicles can access cooling quickly.'
        )
        return {'content': content, 'structuredType': 'recommendation_cards', 'cards': cards or None, 'source': 'fallback'}

    if selected_label:
        content = (
            f'### 🔎 ADK fallback analysis for {selected_label}\n\n'
            'This tract should be treated as a priority heat action site if it combines elevated heat hazard with high social vulnerability. '
            'The operational plan should emphasize cooling access, shaded transit stops, and targeted outreach to seniors and households without vehicles.\n\n'
            '- Check nearby cooling centers and transit shelters.\n'
            '- Deploy hydration support during peak afternoon heat.\n'
            '- Prioritize tree canopy and cool-surface retrofits where asphalt load is highest.'
        )
        return {'content': content, 'structuredType': 'diagnostic_breakdown', 'tract': selected_tract, 'source': 'fallback'}

    content = (
        '### 🧭 Chicago heat planning summary\n\n'
        'The agent is operating in Chicago heat resilience mode. The city should prioritize tracts with the strongest combined hazard + vulnerability signals, '
        'particularly where no-car households, poverty, and age vulnerability overlap with high heat exposure.\n\n'
        '- Deploy cooling relief at transit-heavy hot corridors first.\n'
        '- Protect high-risk seniors and no-car households with short-trip cooling access.\n'
        '- Pair relief with shade, cool pavement, and public communication during the peak afternoon window.'
    )
    return {'content': content, 'structuredType': 'agent_response', 'cards': cards or None, 'source': 'fallback'}


async def _generate_response(query: str, selected_tract=None, live_risk_rows=None):
    if _has_model_credentials():
        try:
            response_text = await _call_adk_agent(query)
            return {
                'content': response_text,
                'structuredType': 'agent_response',
                'source': 'google-adk',
                'tract': selected_tract,
                'cards': _fallback_cards_from_rows(live_risk_rows) if live_risk_rows else None,
            }
        except Exception as exc:  # pragma: no cover - safety path when ADK fails
            return {
                **_fallback_response(query, selected_tract, live_risk_rows),
                'source': f'fallback-after-adk-error:{type(exc).__name__}'
            }

    return _fallback_response(query, selected_tract, live_risk_rows)


class AgentRequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == '/health':
            payload = {'status': 'ok', 'agent': 'chicago-heat-planner', 'credentials': _has_model_credentials()}
            body = json.dumps(payload).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        self.send_response(404)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps({'error': 'not found'}).encode())

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path != '/api/agent/chat':
            self.send_response(404)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'not found'}).encode())
            return

        try:
            content_length = int(self.headers.get('Content-Length', '0'))
            payload = self.rfile.read(content_length)
            body = json.loads(payload.decode('utf-8')) if payload else {}
        except Exception:
            self.send_response(400)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'invalid JSON body'}).encode())
            return

        query = body.get('query') or ''
        selected_tract = body.get('selectedTract')
        live_risk_rows = body.get('liveRiskRows') or []
        response = asyncio.run(_generate_response(query, selected_tract, live_risk_rows))

        json_body = json.dumps(response).encode('utf-8')
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Length', str(len(json_body)))
        self.end_headers()
        self.wfile.write(json_body)

    def log_message(self, format, *args):
        return


if __name__ == '__main__':
    port = int(os.environ.get('AGENT_API_PORT', '8001'))
    server = HTTPServer(('0.0.0.0', port), AgentRequestHandler)
    print(f'Chicago ADK agent API listening on http://0.0.0.0:{port}')
    server.serve_forever()
