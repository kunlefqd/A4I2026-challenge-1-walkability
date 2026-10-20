// Chicago-only municipal climate resilience dataset for the fresh template.
export const CITIES = [
  {
    id: "chicago",
    name: "Chicago - Summer Campaign",
    state: "IL",
    ambientTemp: 94,
    heatIndex: 103,
    peakHour: "3:00 PM",
    heatAdvisoryLevel: "Heat Advisory (Level 3)",
    populationAtRisk: 176000,
    activeCoolingCenters: 12,
    totalCoolingCenters: 15,
    avgOffset: "+7.2°F",
    bounds: { minX: 30, maxX: 770, minY: 30, maxY: 570 },
    normalizedRiskTable: 'a4i_climate.tract_heat_risk'
  }
];

// Georeference for the 800x580 SVG map space. In geo mode the SVG overlay is stretched over
// CHICAGO_GEO_BOUNDS (see useGoogleMapOverlay), so pins placed with pin(lat, lng) land on the
// right spot of the real basemap.
export const MAP_VIEWBOX = { width: 800, height: 580 };
export const CHICAGO_GEO_BOUNDS = {
  north: 42.0230,
  south: 41.6445,
  west: -87.9401,
  east: -87.5240,
};

export const svgToLatLng = ({ x, y }, bounds = CHICAGO_GEO_BOUNDS) => ({
  lat: bounds.north - (y / MAP_VIEWBOX.height) * (bounds.north - bounds.south),
  lng: bounds.west + (x / MAP_VIEWBOX.width) * (bounds.east - bounds.west),
});

export const latLngToSvg = ({ lat, lng }, bounds = CHICAGO_GEO_BOUNDS) => ({
  x: ((lng - bounds.west) / (bounds.east - bounds.west)) * MAP_VIEWBOX.width,
  y: ((bounds.north - lat) / (bounds.north - bounds.south)) * MAP_VIEWBOX.height,
});

// Real location plus its SVG coordinates, for cooling centers and hotspots.
const pin = (lat, lng) => ({ lat, lng, coordinates: latLngToSvg({ lat, lng }) });

// Tracts for Chicago - Summer Campaign
export const CHICAGO_TRACTS = [
  {
    id: "tract-chi-01",
    tractNumber: "17031010100",
    name: "63rd & Halsted / Englewood East",
    area: "Englewood",
    heatOffset: 10.4,
    surfaceTemp: 138.8,
    bqmlRiskScore: 9.9,
    demographics: {
      population: 6840,
      medianAge: 38.6,
      seniorRate: 22.4,
      noVehicleRate: 43.2,
      povertyRate: 40.8,
      treeCanopyCover: 5.1,
      imperviousSurface: 76.5,
      pedestrianExposureIndex: 9.4
    },
    cdcSviRplThemes: 0.97,
    normalizedHeatHazard: 0.84,
    socialVulnerabilityScore: 0.66,
    combinedPriorityScore: 0.65,
    sviLabel: "Extreme vulnerability",
    status: "CRITICAL_DEFICIT",
    coolingCenterNearby: false,
    nearestCenterDist: "2.6 miles",
    isHistoricalHotspot: true,
    historicalCalls2025: 58,
    recommendedAction: "Dispatch mobile hydration bus & shade canopy at 63rd & Halsted",
    coordinates: { x: 345, y: 415 },
    shape: "M 300 350 L 405 345 L 420 460 L 310 470 Z",
    pathPoints: [[300,350],[405,345],[420,460],[310,470]],
    notes: "Large asphalt transit frontage with high pedestrian exposure and few cooling options."
  },
  {
    id: "tract-chi-02",
    tractNumber: "17031010201",
    name: "North Lawndale / Pulaski Corridor",
    area: "North Lawndale",
    heatOffset: 9.7,
    surfaceTemp: 135.2,
    bqmlRiskScore: 9.5,
    demographics: {
      population: 7710,
      medianAge: 33.2,
      seniorRate: 17.5,
      noVehicleRate: 38.9,
      povertyRate: 33.4,
      treeCanopyCover: 6.8,
      imperviousSurface: 73.2,
      pedestrianExposureIndex: 8.8
    },
    cdcSviRplThemes: 0.92,
    normalizedHeatHazard: 0.79,
    socialVulnerabilityScore: 0.54,
    combinedPriorityScore: 0.64,
    sviLabel: "Very high vulnerability",
    status: "HIGH_VULNERABILITY",
    coolingCenterNearby: true,
    nearestCenterDist: "0.9 miles (Homan Square Rec Center)",
    isHistoricalHotspot: true,
    historicalCalls2025: 51,
    recommendedAction: "Install cool pavement and bus shelter shade pilot",
    coordinates: { x: 250, y: 270 },
    shape: "M 200 220 L 320 210 L 330 330 L 210 340 Z",
    pathPoints: [[200,220],[320,210],[330,330],[210,340]],
    notes: "Wide commercial corridors and aging housing stock create reflective heat pockets."
  },
  {
    id: "tract-chi-03",
    tractNumber: "17031020100",
    name: "South Shore / 79th & Stony Island",
    area: "South Shore",
    heatOffset: 8.8,
    surfaceTemp: 130.6,
    bqmlRiskScore: 8.9,
    demographics: {
      population: 8120,
      medianAge: 35.8,
      seniorRate: 20.1,
      noVehicleRate: 32.4,
      povertyRate: 31.6,
      treeCanopyCover: 9.2,
      imperviousSurface: 68.8,
      pedestrianExposureIndex: 8.1
    },
    cdcSviRplThemes: 0.87,
    normalizedHeatHazard: 0.72,
    socialVulnerabilityScore: 0.49,
    combinedPriorityScore: 0.61,
    sviLabel: "High vulnerability",
    status: "HIGH_VULNERABILITY",
    coolingCenterNearby: true,
    nearestCenterDist: "0.7 miles (South Shore Library)",
    isHistoricalHotspot: true,
    historicalCalls2025: 44,
    recommendedAction: "Expand library cooling hours and add transit shade structures",
    coordinates: { x: 560, y: 340 },
    shape: "M 520 290 L 640 280 L 650 420 L 530 430 Z",
    pathPoints: [[520,290],[640,280],[650,420],[530,430]],
    notes: "Frequent bus ridership and older housing stock without adequate canopy coverage."
  },
  {
    id: "tract-chi-04",
    tractNumber: "17031020400",
    name: "West Garfield Park / Cicero & Madison",
    area: "West Garfield Park",
    heatOffset: 8.1,
    surfaceTemp: 126.7,
    bqmlRiskScore: 8.3,
    demographics: {
      population: 6940,
      medianAge: 34.5,
      seniorRate: 19.9,
      noVehicleRate: 35.1,
      povertyRate: 34.2,
      treeCanopyCover: 8.4,
      imperviousSurface: 70.8,
      pedestrianExposureIndex: 7.9
    },
    cdcSviRplThemes: 0.84,
    normalizedHeatHazard: 0.76,
    socialVulnerabilityScore: 0.52,
    combinedPriorityScore: 0.59,
    sviLabel: "Elevated vulnerability",
    status: "MODERATE_HIGH",
    coolingCenterNearby: false,
    nearestCenterDist: "1.8 miles",
    isHistoricalHotspot: true,
    historicalCalls2025: 36,
    recommendedAction: "Deploy cooling depot and retrofit school grounds with shade structures",
    coordinates: { x: 210, y: 180 },
    shape: "M 150 140 L 270 130 L 280 240 L 160 250 Z",
    pathPoints: [[150,140],[270,130],[280,240],[160,250]],
    notes: "Dense block fabric and wide arterial surfaces intensify daytime heat retention."
  },
  {
    id: "tract-chi-05",
    tractNumber: "17031030100",
    name: "Pilsen / 18th & Ashland",
    area: "Lower West Side",
    heatOffset: 7.2,
    surfaceTemp: 123.8,
    bqmlRiskScore: 7.5,
    demographics: {
      population: 11300,
      medianAge: 32.1,
      seniorRate: 15.1,
      noVehicleRate: 31.1,
      povertyRate: 26.3,
      treeCanopyCover: 11.8,
      imperviousSurface: 66.7,
      pedestrianExposureIndex: 8.3
    },
    cdcSviRplThemes: 0.75,
    normalizedHeatHazard: 0.68,
    socialVulnerabilityScore: 0.48,
    combinedPriorityScore: 0.55,
    sviLabel: "Moderate vulnerability",
    status: "HIGH_DENSITY_RENTAL",
    coolingCenterNearby: true,
    nearestCenterDist: "0.6 miles (Pilsen Community Hub)",
    isHistoricalHotspot: false,
    historicalCalls2025: 23,
    recommendedAction: "Add misting nodes at major pedestrian intersections",
    coordinates: { x: 380, y: 235 },
    shape: "M 320 200 L 450 190 L 465 295 L 335 305 Z",
    pathPoints: [[320,200],[450,190],[465,295],[335,305]],
    notes: "Dense mixed-use blocks raise late-afternoon heat exposure for workers and pedestrians."
  },
  {
    id: "tract-chi-06",
    tractNumber: "17031050100",
    name: "Rogers Park / Clark & Morse",
    area: "North Side",
    heatOffset: 5.8,
    surfaceTemp: 119.4,
    bqmlRiskScore: 5.2,
    demographics: {
      population: 9550,
      medianAge: 36.4,
      seniorRate: 18.9,
      noVehicleRate: 21.2,
      povertyRate: 17.6,
      treeCanopyCover: 22.7,
      imperviousSurface: 47.8,
      pedestrianExposureIndex: 5.1
    },
    cdcSviRplThemes: 0.46,
    normalizedHeatHazard: 0.42,
    socialVulnerabilityScore: 0.31,
    combinedPriorityScore: 0.38,
    sviLabel: "Lower vulnerability",
    status: "COOL_CANOPY_BASELINE",
    coolingCenterNearby: true,
    nearestCenterDist: "0.8 miles",
    isHistoricalHotspot: false,
    historicalCalls2025: 9,
    recommendedAction: "Preserve canopy corridors and add drinking fountains along transit stops",
    coordinates: { x: 600, y: 120 },
    shape: "M 540 80 L 670 70 L 685 180 L 555 190 Z",
    pathPoints: [[540,80],[670,70],[685,180],[555,190]],
    notes: "Better tree cover keeps this neighborhood cooler than central-city hotspots."
  }
];


export const COOLING_CENTERS = [
  {
    id: "cc-1",
    name: "Homan Square Recreation Center",
    address: "1313 S Homan Ave, Chicago, IL 60624",
    tractId: "tract-chi-02",
    capacity: 180,
    currentOccupancy: 142,
    occupancyPct: 79,
    status: "OPERATIONAL",
    generatorStatus: "ONLINE (Full Load)",
    waterBottlesRemaining: 1840,
    medicalStaff: "2 RNs On Site",
    hours: "8:00 AM - 9:00 PM (Extended Heat Hours)",
    ...pin(41.8645, -87.7108)
  },
  {
    id: "cc-2",
    name: "South Shore Library & Community Hub",
    address: "2505 E 79th St, Chicago, IL 60649",
    tractId: "tract-chi-03",
    capacity: 240,
    currentOccupancy: 188,
    occupancyPct: 78,
    status: "OPERATIONAL",
    generatorStatus: "ONLINE",
    waterBottlesRemaining: 2900,
    medicalStaff: "1 Paramedic On Site",
    hours: "9:00 AM - 10:00 PM",
    ...pin(41.7516, -87.5636)
  },
  {
    id: "cc-3",
    name: "Englewood Regional Center",
    address: "6500 S Halsted St, Chicago, IL 60621",
    tractId: "tract-chi-01",
    capacity: 160,
    currentOccupancy: 146,
    occupancyPct: 91,
    status: "NEAR_CAPACITY",
    generatorStatus: "ONLINE",
    waterBottlesRemaining: 740,
    medicalStaff: "On-Call EMS",
    hours: "10:00 AM - 8:00 PM",
    ...pin(41.7762, -87.6443)
  },
  {
    id: "cc-4",
    name: "Pilsen Community Hub",
    address: "1800 W 18th St, Chicago, IL 60608",
    tractId: "tract-chi-05",
    capacity: 150,
    currentOccupancy: 80,
    occupancyPct: 53,
    status: "OPERATIONAL",
    generatorStatus: "ONLINE",
    waterBottlesRemaining: 1880,
    medicalStaff: "First Aid Station",
    hours: "8:00 AM - 9:00 PM",
    ...pin(41.8578, -87.6717)
  },
  {
    id: "cc-5",
    name: "Rogers Park Senior Center",
    address: "6900 N Clark St, Chicago, IL 60626",
    tractId: "tract-chi-06",
    capacity: 130,
    currentOccupancy: 37,
    occupancyPct: 28,
    status: "OPERATIONAL",
    generatorStatus: "STANDBY",
    waterBottlesRemaining: 2300,
    medicalStaff: "First Aid Qualified",
    hours: "9:00 AM - 7:00 PM",
    ...pin(42.0080, -87.6741)
  }
];

export const HISTORICAL_HOTSPOTS = [
  {
    id: "hh-1",
    name: "63rd & Halsted Transit Exchange",
    tractId: "tract-chi-01",
    heatDispatches2025: 58,
    peakRecordedSurface: "139.1°F",
    primaryHazard: "Unshaded bus stop and wide concrete transit frontage with high pedestrian exposure",
    ...pin(41.7796, -87.6446)
  },
  {
    id: "hh-2",
    name: "Pulaski & Cermak/Central Corridor",
    tractId: "tract-chi-02",
    heatDispatches2025: 51,
    peakRecordedSurface: "136.4°F",
    primaryHazard: "Dense commercial strip with low tree cover and reflective storefront surfaces",
    ...pin(41.8520, -87.7248)
  },
  {
    id: "hh-3",
    name: "79th & Stony Island Transfer",
    tractId: "tract-chi-03",
    heatDispatches2025: 44,
    peakRecordedSurface: "132.2°F",
    primaryHazard: "Large parking lots and unshaded waiting areas near bus transfer points",
    ...pin(41.7515, -87.5856)
  },
  {
    id: "hh-4",
    name: "Madison & Cicero Industrial Spine",
    tractId: "tract-chi-04",
    heatDispatches2025: 36,
    peakRecordedSurface: "129.8°F",
    primaryHazard: "Heat stored in pavement and metal-clad industrial frontage",
    ...pin(41.8806, -87.7454)
  }
];
