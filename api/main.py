"""Tract heat-risk API: serves BigQuery tract and heat-observation data to the frontend."""
import os
import re
import threading
import time

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from google.api_core.exceptions import GoogleAPIError
from google.auth.exceptions import DefaultCredentialsError
from google.cloud import bigquery

# The Qwiklabs project ID changes when the lab resets, so override BQ_TABLE rather than editing this.
TABLE = os.environ.get("BQ_TABLE", "qwiklabs-gcp-04-2bc40033bbb7.a4i_climate.tract_heat_risk")
# The heat observations table lives next to the tract table unless told otherwise.
HEAT_TABLE = os.environ.get("BQ_HEAT_TABLE") or TABLE.rsplit(".", 1)[0] + ".heat_observations"
# Project that runs (and is billed for) the query; defaults to the table's own project.
BILLING_PROJECT = os.environ.get("BQ_PROJECT") or TABLE.split(".")[0]
CACHE_SECONDS = int(os.environ.get("CACHE_SECONDS", "600"))
ALLOWED_ORIGINS = [o.strip() for o in os.environ.get("ALLOWED_ORIGINS", "http://localhost:5173").split(",") if o.strip()]

# Table names cannot be query parameters, so validate before interpolating.
for name, value in (("BQ_TABLE", TABLE), ("BQ_HEAT_TABLE", HEAT_TABLE)):
    if not re.fullmatch(r"[A-Za-z0-9_-]+\.[A-Za-z0-9_]+\.[A-Za-z0-9_]+", value):
        raise RuntimeError(f"{name} must be project.dataset.table, got {value!r}")

# SAFE_CAST keeps the filter working whether the columns are FLOAT64 or STRING.
# Unpopulated tracts (airports, the lake) carry a score of 0 that means "no data", so drop them here.
TRACTS_QUERY = f"""
SELECT
  geo_id, tract_lat, tract_lon, total_pop,
  social_vulnerability_score, normalized_heat_hazard, combined_priority_score,
  tract_avg_temp_f, raw_anomaly_f, observation_count,
  poverty_rate, no_vehicle_rate, over_65_rate, median_age, median_income
FROM `{TABLE}`
WHERE SAFE_CAST(total_pop AS FLOAT64) > 0
  AND SAFE_CAST(tract_lat AS FLOAT64) IS NOT NULL
  AND SAFE_CAST(tract_lon AS FLOAT64) IS NOT NULL
"""

# One summary row for the metrics ribbon. An empty @city matches every row; otherwise the city
# label is matched case-insensitively by prefix ("chicago" matches "Chicago" and "Chicago, IL").
HEAT_SUMMARY_QUERY = f"""
WITH obs AS (
  SELECT city, temp_f, heat_index_f, humidity_pct, SAFE_CAST(observed_at AS TIMESTAMP) AS observed_at
  FROM `{HEAT_TABLE}`
  WHERE @city = '' OR STARTS_WITH(LOWER(city), LOWER(@city))
)
SELECT
  ANY_VALUE(city)                    AS city,
  COUNT(*)                           AS observation_count,
  ROUND(AVG(temp_f), 1)              AS avg_temp_f,
  ROUND(MAX(temp_f), 1)              AS max_temp_f,
  ROUND(AVG(heat_index_f), 1)        AS avg_heat_index_f,
  ROUND(MAX(heat_index_f), 1)        AS max_heat_index_f,
  ROUND(AVG(humidity_pct), 0)        AS avg_humidity_pct,
  ARRAY_AGG(observed_at IGNORE NULLS ORDER BY temp_f DESC LIMIT 1)[SAFE_OFFSET(0)] AS peak_observed_at,
  MIN(observed_at)                   AS first_observed_at,
  MAX(observed_at)                   AS last_observed_at
FROM obs
"""

app = FastAPI(title="Tract Heat Risk API")
app.add_middleware(CORSMiddleware, allow_origins=ALLOWED_ORIGINS, allow_methods=["GET"], allow_headers=["*"])

_client = None
_cache = {}
_lock = threading.Lock()


def get_client():
    # Created lazily so the app starts (and /healthz answers) even before credentials are set up.
    global _client
    if _client is None:
        _client = bigquery.Client(project=BILLING_PROJECT)
    return _client


def cached(key, load):
    """Return a cached result for key, refreshing it after CACHE_SECONDS.

    If a refresh fails, keep serving the last good result rather than failing the page."""
    with _lock:
        entry = _cache.get(key)
        if entry is None or time.time() - entry["at"] > CACHE_SECONDS:
            try:
                body = load()
            except (GoogleAPIError, DefaultCredentialsError) as err:
                if entry is None:
                    raise HTTPException(status_code=502, detail=f"BigQuery query failed: {err}") from err
            else:
                entry = _cache[key] = {"at": time.time(), "body": body}
        return entry["body"]


def load_tracts():
    rows = get_client().query(TRACTS_QUERY).result()
    return {"tracts": [dict(r) for r in rows], "fetched_at": time.time(), "table": TABLE}


def load_heat_summary(city):
    job_config = bigquery.QueryJobConfig(query_parameters=[bigquery.ScalarQueryParameter("city", "STRING", city)])
    row = next(iter(get_client().query(HEAT_SUMMARY_QUERY, job_config=job_config).result()), None)
    summary = dict(row) if row else {}
    return {"summary": summary if summary.get("observation_count") else None, "fetched_at": time.time(), "table": HEAT_TABLE}


@app.get("/api/tracts")
def tracts():
    return cached("tracts", load_tracts)


@app.get("/api/heat-summary")
def heat_summary(city: str = Query("", max_length=80)):
    city = city.strip()
    return cached(f"heat:{city.lower()}", lambda: load_heat_summary(city))


@app.get("/healthz")
def healthz():
    return {"ok": True, "table": TABLE, "heat_table": HEAT_TABLE}
