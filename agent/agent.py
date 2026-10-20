import json
import os
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from google.adk.agents import LlmAgent
from google.adk.tools import FunctionTool
from google.cloud import bigquery

ROOT_DIR = Path(__file__).resolve().parent.parent
for env_path in [ROOT_DIR / '.env', ROOT_DIR / 'frontend' / '.env.local']:
    if env_path.exists():
        load_dotenv(env_path)
load_dotenv()


def _resolve_project_id() -> str:
    env_project = os.environ.get("GOOGLE_CLOUD_PROJECT")
    if env_project:
        return env_project

    project = os.environ.get("GOOGLE_CLOUD_PROJECT_ID")
    if project:
        return project

    return "qwiklabs-gcp-04-2bc40033bbb7"


PROJECT_ID = _resolve_project_id()
DATASET = "a4i_climate"
TABLE = "tract_heat_risk"


def query_chicago_risk(limit: int = 10) -> str:
    """Return the highest-priority Chicago tract risk rows from the live BigQuery dataset."""
    client = bigquery.Client(project=PROJECT_ID)
    query = f"""
        SELECT
          CAST(geo_id AS STRING) AS geo_id,
          CAST(normalized_heat_hazard AS FLOAT64) AS normalized_heat_hazard,
          CAST(social_vulnerability_score AS FLOAT64) AS social_vulnerability_score,
          CAST(combined_priority_score AS FLOAT64) AS combined_priority_score,
          CAST(no_vehicle_rate AS FLOAT64) AS no_vehicle_rate,
          CAST(poverty_rate AS FLOAT64) AS poverty_rate,
          CAST(over_65_rate AS FLOAT64) AS over_65_rate,
          CAST(tract_avg_temp_f AS FLOAT64) AS tract_avg_temp_f,
          CAST(total_pop AS FLOAT64) AS total_pop
        FROM `{DATASET}.{TABLE}`
        ORDER BY combined_priority_score DESC
        LIMIT @limit
    """

    job_config = bigquery.QueryJobConfig(query_parameters=[
        bigquery.ScalarQueryParameter("limit", "INT64", limit),
    ])

    rows = client.query(query, job_config=job_config).result()
    payload = []
    for row in rows:
        payload.append({
            "geo_id": row["geo_id"],
            "normalized_heat_hazard": round(float(row["normalized_heat_hazard"]), 4),
            "social_vulnerability_score": round(float(row["social_vulnerability_score"]), 4),
            "combined_priority_score": round(float(row["combined_priority_score"]), 4),
            "no_vehicle_rate": round(float(row["no_vehicle_rate"]), 2),
            "poverty_rate": round(float(row["poverty_rate"]), 2),
            "over_65_rate": round(float(row["over_65_rate"]), 2),
            "tract_avg_temp_f": round(float(row["tract_avg_temp_f"]), 2),
            "total_pop": round(float(row["total_pop"]), 0),
        })

    return json.dumps({
        "project": PROJECT_ID,
        "source": f"{DATASET}.{TABLE}",
        "rows": payload,
    })


def get_chicago_weather_summary() -> str:
    """Return current Chicago weather conditions, falling back to a city baseline if live data is unavailable."""
    import urllib.request

    url = (
        "https://api.open-meteo.com/v1/forecast?latitude=41.8781&longitude=-87.6298&current="
        "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code"
        "&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto"
    )

    try:
        with urllib.request.urlopen(url, timeout=12) as response:
            data = json.loads(response.read().decode("utf-8"))
        current = data.get("current", {})
        temp_f = round(float(current.get("temperature_2m", 94)), 1)
        feels_like_f = round(float(current.get("apparent_temperature", 103)), 1)
        humidity = int(current.get("relative_humidity_2m", 52))
        wind = int(current.get("wind_speed_10m", 8))
        return json.dumps({
            "provider": "Open-Meteo",
            "temperature_f": temp_f,
            "feels_like_f": feels_like_f,
            "humidity_pct": humidity,
            "wind_mph": wind,
            "status": "live",
        })
    except Exception:
        return json.dumps({
            "provider": "fallback",
            "temperature_f": 94,
            "feels_like_f": 103,
            "humidity_pct": 52,
            "wind_mph": 8,
            "status": "fallback",
        })


root_agent = LlmAgent(
    name="chicago_heat_planner_agent",
    model="gemini-2.5-flash",
    description=(
        "Chicago heat resilience planning agent that uses live tract risk data and weather context "
        "to help city staff prioritize cooling and resilience interventions."
    ),
    instruction=(
        "You are a municipal heat resilience planner for Chicago. "
        "Always ground your recommendations in the live BigQuery tract risk data when the user asks about ranking, risk, or intervention priorities. "
        "Use query_chicago_risk to fetch the latest rows before answering ranking questions. "
        "Use get_chicago_weather_summary to include current weather conditions when the user asks about today’s conditions. "
        "Explain tradeoffs in plain language for city operations leaders. "
        "Return actionable recommendations, highlight vulnerable tracts, and connect risk to demographic vulnerability such as no-car households, poverty, and the older adult share."
    ),
    tools=[
        FunctionTool(query_chicago_risk),
        FunctionTool(get_chicago_weather_summary),
    ],
)
