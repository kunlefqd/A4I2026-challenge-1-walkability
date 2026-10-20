// Client for the tract heat-risk API (see /api). In dev, Vite proxies /api to localhost:8080;
// in production set VITE_API_URL to the Cloud Run service URL.
const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const TIMEOUT_MS = 15000;

export async function fetchTracts() {
  const res = await fetch(`${API_URL}/api/tracts`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`GET /api/tracts returned ${res.status}`);
  const body = await res.json();
  if (!Array.isArray(body?.tracts)) throw new Error('GET /api/tracts returned no tracts array');
  return body.tracts;
}
