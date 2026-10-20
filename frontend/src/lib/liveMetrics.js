import { LIVE_CITY_TZ } from './tractApi';

// Share of tracts, ranked by social vulnerability, counted as "high vulnerability".
// The score is not a percentile, so rank within the loaded tracts instead of using a fixed cut-off.
export const HIGH_VULNERABILITY_SHARE = 0.2;

// NWS heat index risk categories.
function heatIndexCategory(hi) {
  if (hi == null) return 'Heat index unavailable';
  if (hi >= 125) return 'NWS: Extreme Danger';
  if (hi >= 103) return 'NWS: Danger';
  if (hi >= 90) return 'NWS: Extreme Caution';
  if (hi >= 80) return 'NWS: Caution';
  return 'Below NWS caution level';
}

function formatPeakTime(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: LIVE_CITY_TZ });
}

const num = (v) => (v == null || Number.isNaN(Number(v)) ? null : Number(v));

// Metrics for the ribbon from live tracts and the heat_observations summary.
// Any value the data cannot supply is null so the ribbon can fall back to its defaults.
export function computeLiveMetrics(tracts, heatSummary) {
  const metrics = {};

  if (tracts?.length) {
    const ranked = [...tracts].sort((a, b) => b.socialVulnerability - a.socialVulnerability);
    const top = ranked.slice(0, Math.max(1, Math.round(ranked.length * HIGH_VULNERABILITY_SHARE)));
    metrics.populationAtRisk = top.reduce((sum, t) => sum + t.demographics.population, 0);
    metrics.atRiskTractCount = top.length;
    metrics.tractCount = tracts.length;
  }

  if (heatSummary) {
    metrics.temp = num(heatSummary.avg_temp_f);
    metrics.heatIndex = num(heatSummary.max_heat_index_f) ?? num(heatSummary.avg_heat_index_f);
    metrics.advisory = heatIndexCategory(metrics.heatIndex);
    metrics.peakTime = formatPeakTime(heatSummary.peak_observed_at);
    metrics.observationCount = num(heatSummary.observation_count);
    metrics.city = heatSummary.city;
  }

  return metrics;
}
