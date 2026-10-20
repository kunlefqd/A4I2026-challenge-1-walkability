"""Tract heat-risk API: serves rows from the BigQuery tract_heat_risk table to the frontend map."""
import os
import re
import threading
import time

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google.api_core.exceptions import GoogleAPIError
from google.auth.exceptions import DefaultCredentialsError
from google.cloud import bigquery

# The Qwiklabs project ID changes when the lab resets, so override BQ_TABLE rather than editing this.
TABLE = os.environ.get("BQ_TABLE", "qwiklabs-gcp-04-2bc40033bbb7.a4i_climate.tract_heat_risk")
# Project that runs (and is billed for) the query; defaults to the table's own project.
BILLING_PROJECT = os.environ.get("BQ_PROJECT") or TABLE.split(".")[0]
CACHE_SECONDS = int(os.environ.get("CACHE_SECONDS", "600"))
ALLOWED_ORIGINS = [o.strip() for o in os.environ.get("ALLOWED_ORIGINS", "http://localhost:5173").split(",") if o.strip()]

# Table names cannot be query parameters, so validate before interpolating.
if not re.fullmatch(r"[A-Za-z0-9_-]+\.[A-Za-z0-9_]+\.[A-Za-z0-9_]+", TABLE):
    raise RuntimeError(f"BQ_TABLE must be project.dataset.table, got {TABLE!r}")

# SAFE_CAST keeps the filter working whether the columns are FLOAT64 or STRING.
# Unpopulated tracts (airports, the lake) carry a score of 0 that means "no data", so drop them here.
QUERY = f"""
SELECT
  geo_id, tract_lat, tract_lon, total_pop,
  social_vulnerability_score, normalized_heat_hazard, combined_priority_score,
  tract_avg_temp_f, raw_anomaly_f, observation_count,
  poverty_rate, no_vehicle_rate, over_65_rate, median_income
FROM `{TABLE}`
WHERE SAFE_CAST(total_pop AS FLOAT64) > 0
  AND SAFE_CAST(tract_lat AS FLOAT64) IS NOT NULL
  AND SAFE_CAST(tract_lon AS FLOAT64) IS NOT NULL
"""

app = FastAPI(title="Tract Heat Risk API")
app.add_middleware(CORSMiddleware, allow_origins=ALLOWED_ORIGINS, allow_methods=["GET"], allow_headers=["*"])

_client = None
_cache = {"at": 0.0, "body": None}
_lock = threading.Lock()


def get_client():
    # Created lazily so the app starts (and /healthz answers) even before credentials are set up.
    global _client
    if _client is None:
        _client = bigquery.Client(project=BILLING_PROJECT)
    return _client


def load_tracts():
    rows = get_client().query(QUERY).result()
    return {"tracts": [dict(r) for r in rows], "fetched_at": time.time(), "table": TABLE}


@app.get("/api/tracts")
def tracts():
    with _lock:
        if _cache["body"] is None or time.time() - _cache["at"] > CACHE_SECONDS:
            try:
                _cache["body"] = load_tracts()
            except (GoogleAPIError, DefaultCredentialsError) as err:
                # Serve the last good result rather than failing the page if BigQuery hiccups.
                if _cache["body"] is None:
                    raise HTTPException(status_code=502, detail=f"BigQuery query failed: {err}") from err
            else:
                _cache["at"] = time.time()
        return _cache["body"]


@app.get("/healthz")
def healthz():
    return {"ok": True, "table": TABLE}
