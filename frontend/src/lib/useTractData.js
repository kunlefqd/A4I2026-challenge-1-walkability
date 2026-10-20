import { useEffect, useState } from 'react';
import { fetchHeatSummary, fetchTracts } from './tractApi';
import { toAppTract } from './tractAdapter';

// One request per page load, shared by every component that asks for tracts.
let tractsPromise = null;

function loadTracts() {
  if (!tractsPromise) {
    tractsPromise = fetchTracts()
      .then((rows) => ({ rows, source: 'live' }))
      .catch(async (err) => {
        // The sample is loaded only on failure, so it stays out of the main bundle.
        console.warn(`Tract API unavailable, using bundled sample data: ${err.message}`);
        const sample = await import('../data/tractVulnerability.json');
        return { rows: sample.default, source: 'sample' };
      })
      .then(({ rows, source }) => ({ rows, tracts: rows.map(toAppTract).filter(Boolean), source }));
  }
  return tractsPromise;
}

// rows: raw tract_heat_risk rows; tracts: app-shaped tracts; source: 'live' | 'sample'. Nulls while loading.
export function useTractData() {
  const [data, setData] = useState({ rows: null, tracts: null, source: null });

  useEffect(() => {
    let cancelled = false;
    loadTracts()
      .then((next) => { if (!cancelled) setData(next); })
      .catch((err) => console.error('Could not load tract data', err));
    return () => { cancelled = true; };
  }, []);

  return data;
}

// Afternoon heat observation summary for the live city; null while loading or if unavailable.
export function useHeatSummary() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchHeatSummary()
      .then((next) => { if (!cancelled) setSummary(next); })
      .catch((err) => console.warn(`Heat summary unavailable: ${err.message}`));
    return () => { cancelled = true; };
  }, []);

  return summary;
}
