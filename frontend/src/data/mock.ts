// MOCK DATA for building the UI before the data and agent lanes are live.
// Locations are real Chicago intersections; every number attached to them is invented.
// Replace with real BigQuery output via loadCityData() in ./index.ts.

import type { CityData, HeatPoint, Hotspot } from '../types';

// Deterministic PRNG so the map looks the same on every reload.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const BBOX: [number, number, number, number] = [41.65, -87.85, 42.01, -87.53];

// Approximate Lake Michigan shoreline: [lat, lon]. Points east of it are dropped.
const SHORELINE: [number, number][] = [
  [41.64, -87.525],
  [41.73, -87.535],
  [41.76, -87.555],
  [41.8, -87.58],
  [41.85, -87.605],
  [41.88, -87.612],
  [41.9, -87.622],
  [41.95, -87.638],
  [42.0, -87.655],
  [42.03, -87.665],
];

function shoreLon(lat: number): number {
  for (let i = 1; i < SHORELINE.length; i++) {
    const [lat0, lon0] = SHORELINE[i - 1];
    const [lat1, lon1] = SHORELINE[i];
    if (lat <= lat1) return lon0 + ((lat - lat0) / (lat1 - lat0)) * (lon1 - lon0);
  }
  return SHORELINE[SHORELINE.length - 1][1];
}

const HOTSPOTS: Hotspot[] = [
  {
    id: 'englewood',
    name: 'Englewood – 63rd & Halsted',
    lat: 41.7796,
    lon: -87.6445,
    tractGeoId: '17031680900',
    offsetF: 7.4,
    severity: 'high',
    demographics: { population: 3120, medianAge: 41, noVehicleRate: 0.38, medianIncome: 24800 },
    drivers: [
      { feature: 'impervious_surface', contributionF: 3.9 },
      { feature: 'building_density', contributionF: 2.1 },
      { feature: 'distance_to_lake', contributionF: 1.4 },
    ],
    suggestedActions: ['mobile_cooling', 'wellness_checks', 'hydration_truck'],
  },
  {
    id: 'little-village',
    name: 'Little Village – 26th & Pulaski',
    lat: 41.8445,
    lon: -87.7246,
    tractGeoId: '17031300900',
    offsetF: 6.8,
    severity: 'high',
    demographics: { population: 4870, medianAge: 29, noVehicleRate: 0.24, medianIncome: 36200 },
    drivers: [
      { feature: 'impervious_surface', contributionF: 3.2 },
      { feature: 'industrial_land_use', contributionF: 2.5 },
      { feature: 'tree_canopy', contributionF: 1.1 },
    ],
    suggestedActions: ['mobile_cooling', 'hydration_truck', 'extended_hours'],
  },
  {
    id: 'back-of-the-yards',
    name: 'Back of the Yards – 47th & Ashland',
    lat: 41.8087,
    lon: -87.6651,
    tractGeoId: '17031610400',
    offsetF: 6.1,
    severity: 'high',
    demographics: { population: 3540, medianAge: 31, noVehicleRate: 0.27, medianIncome: 31500 },
    drivers: [
      { feature: 'industrial_land_use', contributionF: 2.9 },
      { feature: 'impervious_surface', contributionF: 2.4 },
      { feature: 'building_density', contributionF: 0.8 },
    ],
    suggestedActions: ['hydration_truck', 'mobile_cooling'],
  },
  {
    id: 'austin',
    name: 'Austin – Chicago Ave & Cicero',
    lat: 41.8955,
    lon: -87.7456,
    tractGeoId: '17031251600',
    offsetF: 5.6,
    severity: 'medium',
    demographics: { population: 2980, medianAge: 44, noVehicleRate: 0.33, medianIncome: 29400 },
    drivers: [
      { feature: 'impervious_surface', contributionF: 2.6 },
      { feature: 'distance_to_lake', contributionF: 2.2 },
      { feature: 'tree_canopy', contributionF: 0.8 },
    ],
    suggestedActions: ['wellness_checks', 'extended_hours', 'mobile_cooling'],
  },
  {
    id: 'belmont-cragin',
    name: 'Belmont Cragin – Belmont & Central',
    lat: 41.9389,
    lon: -87.7665,
    tractGeoId: '17031190200',
    offsetF: 4.7,
    severity: 'medium',
    demographics: { population: 5210, medianAge: 34, noVehicleRate: 0.12, medianIncome: 52100 },
    drivers: [
      { feature: 'building_density', contributionF: 2.3 },
      { feature: 'distance_to_lake', contributionF: 2.0 },
      { feature: 'park_proximity', contributionF: -0.4 },
    ],
    suggestedActions: ['extended_hours', 'hydration_truck'],
  },
  {
    id: 'south-chicago',
    name: 'South Chicago – 87th & Commercial',
    lat: 41.7366,
    lon: -87.5518,
    tractGeoId: '17031460500',
    offsetF: 3.9,
    severity: 'medium',
    demographics: { population: 2640, medianAge: 38, noVehicleRate: 0.35, medianIncome: 27900 },
    drivers: [
      { feature: 'industrial_land_use', contributionF: 2.8 },
      { feature: 'impervious_surface', contributionF: 1.7 },
      { feature: 'distance_to_lake', contributionF: -0.6 },
    ],
    suggestedActions: ['wellness_checks', 'mobile_cooling'],
  },
];

// Parks that pull the offset down locally: [lat, lon, coolingF].
const PARKS: [number, number, number][] = [
  [41.7925, -87.617, 3.0], // Washington Park
  [41.905, -87.701, 2.5], // Humboldt Park
  [41.886, -87.717, 2.5], // Garfield Park
  [41.832, -87.689, 1.5], // McKinley Park
];

function rawOffset(lat: number, lon: number, rand: () => number): number {
  let v = 0;
  for (const h of HOTSPOTS) {
    const d2 = (lat - h.lat) ** 2 + (lon - h.lon) ** 2;
    v += h.offsetF * Math.exp(-d2 / (2 * 0.014 ** 2));
  }
  for (const [plat, plon, cool] of PARKS) {
    const d2 = (lat - plat) ** 2 + (lon - plon) ** 2;
    v -= cool * Math.exp(-d2 / (2 * 0.007 ** 2));
  }
  // Lake breeze: strong cooling within ~2 km of the shore.
  v -= 4 * Math.exp(-(shoreLon(lat) - lon) / 0.02);
  return v + (rand() - 0.5) * 1.6;
}

function generateHeatPoints(): HeatPoint[] {
  const rand = mulberry32(2026);
  const [latMin, lonMin, latMax, lonMax] = BBOX;
  const step = 0.0006; // ~50–65 m between readings
  const points: HeatPoint[] = [];

  // Volunteer routes follow Chicago's street grid: alternate east-west and north-south legs.
  for (let route = 0; route < 45; route++) {
    let lat = latMin + rand() * (latMax - latMin);
    let lon = lonMin + rand() * (lonMax - lonMin);
    for (let leg = 0; leg < 8; leg++) {
      const horizontal = leg % 2 === 0;
      const length = 0.01 + rand() * 0.03;
      const dir = rand() < 0.5 ? -1 : 1;
      for (let s = 0; s < length; s += step) {
        if (horizontal) lon += dir * step;
        else lat += dir * step;
        if (lat < latMin || lat > latMax || lon < lonMin || lon > shoreLon(lat) - 0.003) break;
        points.push({ lat, lon, offsetF: rawOffset(lat, lon, rand) });
      }
      lat = Math.min(latMax, Math.max(latMin, lat));
      lon = Math.min(shoreLon(lat) - 0.004, Math.max(lonMin, lon));
    }
  }

  // An offset is relative to the city's own average, so re-center to mean 0.
  const mean = points.reduce((sum, p) => sum + p.offsetF, 0) / points.length;
  return points.map((p) => ({ ...p, offsetF: Math.round((p.offsetF - mean) * 10) / 10 }));
}

export function mockCityData(): CityData {
  const heatPoints = generateHeatPoints();
  return {
    isMock: true,
    city: {
      name: 'Chicago',
      scenario:
        'Forecast is 98°F on Thursday. We have 4 mobile cooling units, 2 hydration trucks and ' +
        'wellness-check teams for 3 neighborhoods. Where do they go first?',
      center: { lat: 41.835, lon: -87.68 },
      bbox: BBOX,
      readingCount: heatPoints.length,
      campaignDate: 'mock campaign',
      hotDaysPerYear: 14,
    },
    heatPoints,
    hotspots: HOTSPOTS,
  };
}
