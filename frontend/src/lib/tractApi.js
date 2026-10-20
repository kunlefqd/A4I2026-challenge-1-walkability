// Client for the tract heat-risk API (see /api). In dev, Vite proxies /api to localhost:8080;
// in production set VITE_API_URL to the Cloud Run service URL.
const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const TIMEOUT_MS = 15000;

// City label in heat_observations, and its time zone for showing the peak observation time.
export const LIVE_CITY = import.meta.env.VITE_LIVE_CITY || 'Chicago';
export const LIVE_CITY_TZ = import.meta.env.VITE_LIVE_CITY_TZ || 'America/Chicago';

async function getJson(path) {
  const res = await fetch(`${API_URL}${path}`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`GET ${path} returned ${res.status}`);
  return res.json();
}

export async function fetchTracts() {
  const body = await getJson('/api/tracts');
  if (!Array.isArray(body?.tracts)) throw new Error('GET /api/tracts returned no tracts array');
  return body.tracts;
}

// Resolves to the summary row, or null when the table has no observations for the city.
export async function fetchHeatSummary(city = LIVE_CITY) {
  const body = await getJson(`/api/heat-summary?city=${encodeURIComponent(city)}`);
  return body?.summary ?? null;
}
