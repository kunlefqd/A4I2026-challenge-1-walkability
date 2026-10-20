# Tract Heat Risk API

A small FastAPI service that reads `a4i_climate.tract_heat_risk` from BigQuery and serves it to the
frontend map. The browser never talks to BigQuery directly; this service holds the credentials.

| Endpoint | Returns |
|---|---|
| `GET /api/tracts` | `{"tracts": [...], "fetched_at": <unix time>, "table": "<project.dataset.table>"}` |
| `GET /healthz` | `{"ok": true, "table": "..."}` (does not touch BigQuery) |

`/api/tracts` drops tracts with zero population (their score of 0 means "no data") and caches the
result in memory for `CACHE_SECONDS`. If a refresh fails, it keeps serving the last good result.

## Configuration

| Variable | Default | Notes |
|---|---|---|
| `BQ_TABLE` | `qwiklabs-gcp-04-2bc40033bbb7.a4i_climate.tract_heat_risk` | Set this when the Qwiklabs project changes. |
| `BQ_PROJECT` | the table's project | Project that runs and pays for the query. |
| `CACHE_SECONDS` | `600` | How long a result is reused. |
| `ALLOWED_ORIGINS` | `http://localhost:5173` | Comma-separated origins allowed to call the API (CORS). |

## Run locally

```bash
cd api
python -m venv .venv
.venv\Scripts\activate          # Windows; use `source .venv/bin/activate` on macOS/Linux
pip install -r requirements.txt
gcloud auth application-default login
uvicorn main:app --reload --port 8080
```

Then `npm run dev` in `frontend/`. Vite proxies `/api` to `localhost:8080`, so no `VITE_API_URL`
is needed. Check http://localhost:8080/api/tracts directly if the map shows "(sample data)".

## Deploy to Cloud Run

```bash
gcloud run deploy tract-api \
  --source api \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars BQ_TABLE=qwiklabs-gcp-04-2bc40033bbb7.a4i_climate.tract_heat_risk,ALLOWED_ORIGINS=https://YOUR-FRONTEND-ORIGIN
```

The service account Cloud Run runs as needs **BigQuery Data Viewer** on the dataset and
**BigQuery Job User** on the billing project. Then set `VITE_API_URL` in `frontend/.env.local` (or
your frontend build) to the service URL that `gcloud run deploy` prints.

To allow several origins, change the env-var delimiter so the commas survive:
`--set-env-vars "^@^BQ_TABLE=...@ALLOWED_ORIGINS=https://a.example,https://b.example"`.
