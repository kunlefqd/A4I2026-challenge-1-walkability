// Maps a tract_heat_risk row onto the tract shape the map, chat, and Kanban components use.
// Fields the table does not have (tree canopy, cooling-center distance, notes) are null, not invented.

const COUNTIES = {
  '17031': 'Cook County, IL',
  '17043': 'DuPage County, IL',
  '17089': 'Kane County, IL',
  '17097': 'Lake County, IL',
  '17111': 'McHenry County, IL',
  '17197': 'Will County, IL',
  '18089': 'Lake County, IN',
  '18127': 'Porter County, IN',
};

// ACS/SVI use large negative sentinels (-999, -666666666) for "not available".
const num = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) && n > -999 ? n : null;
};
const pct = (v) => {
  const n = num(v);
  return n == null ? null : Math.round(n * 1000) / 10;
};

// 17031381700 -> "3817"; 17031030604 -> "306.04"
function tractLabel(geoId) {
  const code = geoId.slice(5).padStart(6, '0');
  const base = String(parseInt(code.slice(0, 4), 10));
  const suffix = code.slice(4);
  return suffix === '00' ? base : `${base}.${suffix}`;
}

export function toAppTract(row) {
  const lat = num(row.tract_lat);
  const lng = num(row.tract_lon);
  const score = num(row.social_vulnerability_score);
  const population = num(row.total_pop);
  if (lat == null || lng == null || score == null || !(population > 0)) return null;

  const geoId = String(row.geo_id);
  return {
    id: `tract-${geoId}`,
    tractNumber: geoId,
    name: `Census Tract ${tractLabel(geoId)}`,
    area: COUNTIES[geoId.slice(0, 5)] || `County FIPS ${geoId.slice(0, 5)}`,
    lat,
    lng,
    socialVulnerability: score,
    // 0-10 scale the Kanban cards and Add Site dialog already display as "Risk".
    bqmlRiskScore: Math.round(score * 100) / 10,
    heatOffset: num(row.raw_anomaly_f),
    surfaceTemp: num(row.tract_avg_temp_f),
    observationCount: num(row.observation_count),
    demographics: {
      population,
      medianAge: num(row.median_age),
      medianIncome: num(row.median_income),
      seniorRate: pct(row.over_65_rate),
      noVehicleRate: pct(row.no_vehicle_rate),
      povertyRate: pct(row.poverty_rate),
      treeCanopyCover: null,
    },
  };
}

// The map's "Vulnerable Tracts" layer: transit-dependent or older populations.
export const isVulnerableTract = (t) =>
  (t.demographics.noVehicleRate ?? 0) > 30 || (t.demographics.seniorRate ?? 0) > 25;

// Display helpers so missing values read as "n/a" instead of "null%".
export const fmtPct = (v) => (v == null ? 'n/a' : `${v}%`);
export const fmtTemp = (v) => (v == null ? 'n/a' : `${v.toFixed(1)}°F`);
export const fmtOffset = (v) => (v == null ? 'n/a' : `${v >= 0 ? '+' : ''}${v.toFixed(1)}°F`);
