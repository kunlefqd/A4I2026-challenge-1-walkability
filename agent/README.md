# Google ADK Chicago Heat Planner

This folder now contains a working Google ADK agent scaffold for the Chicago heat resilience challenge.

## What it does

The root agent is configured for the Chicago use case and exposes two tools:

- `query_chicago_risk(limit=10)`
  - Calls BigQuery and returns the top Chicago tract-risk rows from `a4i_climate.tract_heat_risk`.
- `get_chicago_weather_summary()`
  - Pulls current Chicago weather conditions from Open-Meteo and falls back safely if the API is unavailable.

## How to run it with ADK

From the repo root:

```bash
cd /config/Hackathon/A4I2026-challenge-1-walkability.worktrees/readme-operations-and-objectives
adk run agent
```

Or if you want to start the ADK web UI:

```bash
adk web
```

## Required environment

Set the following in your shell or a project `.env` before starting the agent:

```bash
export GOOGLE_CLOUD_PROJECT=qwiklabs-gcp-04-2bc40033bbb7
export GOOGLE_CLOUD_LOCATION=us-central1
export GOOGLE_API_KEY=your_api_key_here
```

The project automatically loads a root `.env` file (and the frontend `.env.local` if present), so the ADK runtime can pick up credentials without hard-coding them into source.

If you are using the repo locally, create a root `.env` from the repo pattern or a `.env.example` if available, then start the server with the same environment loaded.

The project uses the active Google Cloud project for BigQuery reads, and the agent uses the Gemini model through Google ADK.

## Example prompts

- "Which tracts are the highest priority for immediate cooling support?"
- "What is the current heat risk in Chicago today?"
- "Which neighborhoods need action first given vulnerability and heat exposure?"
- "What operations should we prioritize this afternoon?"

## Notes

This is intentionally aligned with the challenge’s `BigQuery ML + agentic reasoning` model: the agent calls tools, not just summarises static data, and the recommendations are grounded in real Chicago risk records.
