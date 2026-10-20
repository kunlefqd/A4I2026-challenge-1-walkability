# Frontend: Chicago Heat Response (⚡ Today track)

React + Vite + TypeScript, with Google Maps as the base map and a deck.gl `HexagonLayer` on top.
Each hexagon is colored by the **average offset** of the readings inside it (blue = cooler than the
city average, red = hotter), not by how many readings fall in it.

## Run it

```bash
cd frontend
npm install
cp .env.example .env.local   # then set VITE_GOOGLE_MAPS_API_KEY
npm run dev
```

The API key needs **Maps JavaScript API** enabled in the GCP project. `DEMO_MAP_ID` works as the
Map ID during development.

## Mock vs. live

Everything runs on mocks until the other lanes are ready. Badges in the header show which.

| Piece | Mock | Going live |
|---|---|---|
| City data, hotspots, heat points | `src/data/mock.ts` (real intersections, invented numbers) | Replace the body of `loadCityData()` in `src/data/index.ts` |
| Agent | `src/agent/mock.ts` | Set `VITE_AGENT_URL` (e.g. `http://localhost:8000`) and `VITE_AGENT_APP_NAME` |

In dev, `/agent/*` is proxied to `VITE_AGENT_URL`, so no CORS setup is needed. The client calls
ADK's `POST /apps/{app}/users/{user}/sessions` once, then `POST /run` per message.

## Contract with the agent lane

Replies are prose, optionally followed by a locations block (fenced as ```` ```json ```` or bare):

```json
{"locations": [{"lat": 41.7796, "lon": -87.6445, "label": "63rd & Halsted", "offsetF": 7.1}]}
```

The block is stripped from the chat text, and its points are drawn as numbered purple markers,
with the map zooming to fit them. `lat` and `lon` are required; `label` and `offsetF` are optional.

## Where things are

```
src/types.ts              data contract (City, Hotspot, HeatPoint, ActionLogEntry, ...)
src/actions.ts            action catalog with time horizons
src/components/HeatMap    Google Maps + deck.gl hexagons, markers, legend
src/components/AlertsPanel  hotspots ranked by offset; people first, drivers secondary
src/components/ChatPanel  chat with the agent
src/components/ActionLog  actions taken, with status
src/agent/                ADK client, mock agent, locations parser
```
