#!/usr/bin/env python3
import json
import os
import subprocess
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse

from google.cloud import bigquery


def resolve_project_id():
    env_project = os.environ.get('GOOGLE_CLOUD_PROJECT')
    if env_project:
        return env_project

    try:
        project = subprocess.check_output(['gcloud', 'config', 'get-value', 'project'], text=True).strip()
        if project:
            os.environ['GOOGLE_CLOUD_PROJECT'] = project
            return project
    except Exception:
        pass

    return 'a4i-2026-test'


PROJECT_ID = resolve_project_id()
DATASET = 'a4i_climate'
TABLE = 'tract_heat_risk'

QUERY = f"""
SELECT
  CAST(geo_id AS STRING) AS geo_id,
  CAST(tract_lat AS FLOAT64) AS tract_lat,
  CAST(tract_lon AS FLOAT64) AS tract_lon,
  CAST(observation_count AS INT64) AS observation_count,
  CAST(tract_avg_temp_f AS FLOAT64) AS tract_avg_temp_f,
  CAST(raw_anomaly_f AS FLOAT64) AS raw_anomaly_f,
  CAST(floored_anomaly_f AS FLOAT64) AS floored_anomaly_f,
  CAST(max_positive_anomaly_f AS FLOAT64) AS max_positive_anomaly_f,
  CAST(normalized_heat_hazard AS FLOAT64) AS normalized_heat_hazard,
  CAST(total_pop AS FLOAT64) AS total_pop,
  CAST(median_age AS FLOAT64) AS median_age,
  CAST(median_income AS FLOAT64) AS median_income,
  CAST(poverty_rate AS FLOAT64) AS poverty_rate,
  CAST(no_vehicle_rate AS FLOAT64) AS no_vehicle_rate,
  CAST(pop_over_65 AS FLOAT64) AS pop_over_65,
  CAST(over_65_rate AS FLOAT64) AS over_65_rate,
  CAST(norm_poverty AS FLOAT64) AS norm_poverty,
  CAST(norm_no_vehicle AS FLOAT64) AS norm_no_vehicle,
  CAST(norm_over_65 AS FLOAT64) AS norm_over_65,
  CAST(social_vulnerability_score AS FLOAT64) AS social_vulnerability_score,
  CAST(combined_priority_score AS FLOAT64) AS combined_priority_score
FROM `{DATASET}.{TABLE}`
ORDER BY combined_priority_score DESC
LIMIT 200
"""

client = bigquery.Client(project=PROJECT_ID)


def fetch_risk_rows():
    rows = list(client.query(QUERY))
    payload = []
    for row in rows:
        payload.append({
            'geo_id': row['geo_id'],
            'tract_lat': row['tract_lat'],
            'tract_lon': row['tract_lon'],
            'observation_count': row['observation_count'],
            'tract_avg_temp_f': row['tract_avg_temp_f'],
            'raw_anomaly_f': row['raw_anomaly_f'],
            'floored_anomaly_f': row['floored_anomaly_f'],
            'max_positive_anomaly_f': row['max_positive_anomaly_f'],
            'normalized_heat_hazard': row['normalized_heat_hazard'],
            'total_pop': row['total_pop'],
            'median_age': row['median_age'],
            'median_income': row['median_income'],
            'poverty_rate': row['poverty_rate'],
            'no_vehicle_rate': row['no_vehicle_rate'],
            'pop_over_65': row['pop_over_65'],
            'over_65_rate': row['over_65_rate'],
            'norm_poverty': row['norm_poverty'],
            'norm_no_vehicle': row['norm_no_vehicle'],
            'norm_over_65': row['norm_over_65'],
            'social_vulnerability_score': row['social_vulnerability_score'],
            'combined_priority_score': row['combined_priority_score'],
        })
    return payload


class RiskRequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)

        if parsed.path == '/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'status': 'ok', 'project': PROJECT_ID}).encode())
            return

        if parsed.path == '/api/chicago/risk':
            payload = {
                'source': f'{DATASET}.{TABLE}',
                'rows': fetch_risk_rows(),
            }
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

    def log_message(self, format, *args):
        return


if __name__ == '__main__':
    server = HTTPServer(('0.0.0.0', 8000), RiskRequestHandler)
    print(f'Chicago tract risk API listening on http://0.0.0.0:8000')
    server.serve_forever()
