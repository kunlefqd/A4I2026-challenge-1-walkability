// Initial cards for the Strategic Planning Kanban Board
export const INITIAL_KANBAN_COLUMNS = [
  { id: "backlog", title: "Backlog", badgeColor: "bg-slate-700/60 text-slate-300" },
  { id: "proposed", title: "Proposed Sites", badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  { id: "council", title: "Council Review", badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
  { id: "approved", title: "Approved / Funded", badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" }
];

export const INITIAL_KANBAN_CARDS = [
  {
    id: "kb-01",
    columnId: "backlog",
    title: "63rd & Halsted Hydration Shelter",
    tractId: "tract-chi-01",
    tractName: "Englewood East",
    category: "Emergency Hydration",
    bqmlRiskScore: 9.9,
    heatOffset: "+10.4°F",
    demographics: {
      medianAge: 38.6,
      noVehicleRate: "43.2%",
      povertyRate: "40.8%",
      treeCanopy: "5.1%"
    },
    estimatedCost: "$42,000",
    fundingSource: "Municipal General Fund",
    equityScore: 96,
    projectedTempReduction: "-5.1°F (local shelter radius)",
    tags: ["Hydration", "Transit Corridor"],
    recommendedBy: "Automated Gap Scanner"
  },
  {
    id: "kb-02",
    columnId: "backlog",
    title: "North Lawndale Canopy Buffer",
    tractId: "tract-chi-02",
    tractName: "Pulaski Corridor",
    category: "Urban Forestry",
    bqmlRiskScore: 9.5,
    heatOffset: "+9.7°F",
    demographics: {
      medianAge: 33.2,
      noVehicleRate: "38.9%",
      povertyRate: "33.4%",
      treeCanopy: "6.8%"
    },
    estimatedCost: "$128,000",
    fundingSource: "Urban Forestry Grant",
    equityScore: 90,
    projectedTempReduction: "-3.1°F (5-year canopy effect)",
    tags: ["Canopy", "Tree Planting"],
    recommendedBy: "Parks & Forestry Review"
  },
  {
    id: "kb-03",
    columnId: "proposed",
    title: "79th & Stony Island Cooling Depot",
    tractId: "tract-chi-03",
    tractName: "South Shore",
    category: "Cooling Infrastructure",
    bqmlRiskScore: 8.9,
    heatOffset: "+8.8°F",
    demographics: {
      medianAge: 35.8,
      noVehicleRate: "32.4%",
      povertyRate: "31.6%",
      treeCanopy: "9.2%"
    },
    estimatedCost: "$520,000",
    fundingSource: "Chicago Climate Resilience Fund",
    equityScore: 92,
    projectedTempReduction: "-5.6°F surface temp",
    tags: ["Transit", "Cooling Depot"],
    recommendedBy: "Urban Heat AI - Spatial Priority Rank #3"
  },
  {
    id: "kb-04",
    columnId: "proposed",
    title: "Cicero & Madison Cool Roof Retrofit",
    tractId: "tract-chi-04",
    tractName: "West Garfield Park",
    category: "Building Envelope",
    bqmlRiskScore: 8.3,
    heatOffset: "+8.1°F",
    demographics: {
      medianAge: 34.5,
      noVehicleRate: "35.1%",
      povertyRate: "34.2%",
      treeCanopy: "8.4%"
    },
    estimatedCost: "$860,000",
    fundingSource: "CDBG / Energy Equity",
    equityScore: 94,
    projectedTempReduction: "-6.8°F indoor radiant temp",
    tags: ["Cool Roofs", "Energy Equity"],
    recommendedBy: "Urban Heat AI - Demographic Audit"
  },
  {
    id: "kb-05",
    columnId: "council",
    title: "18th & Ashland Resilience Hub",
    tractId: "tract-chi-05",
    tractName: "Pilsen",
    category: "Resilience Hub",
    bqmlRiskScore: 7.5,
    heatOffset: "+7.2°F",
    demographics: {
      medianAge: 32.1,
      noVehicleRate: "31.1%",
      povertyRate: "26.3%",
      treeCanopy: "11.8%"
    },
    estimatedCost: "$1,100,000",
    fundingSource: "FY2027 Capital Improvement Bond",
    equityScore: 90,
    projectedTempReduction: "-6.4°F shaded zone / -2.8°F tract avg",
    tags: ["Multi-use District", "Cooling Hub"],
    recommendedBy: "Urban Heat AI - Highest Urgency Recommendation"
  },
  {
    id: "kb-06",
    columnId: "approved",
    title: "Clark & Morse Shade & Fountain Network",
    tractId: "tract-chi-06",
    tractName: "Rogers Park",
    category: "Public Shade",
    bqmlRiskScore: 5.2,
    heatOffset: "+5.8°F",
    demographics: {
      medianAge: 36.4,
      noVehicleRate: "21.2%",
      povertyRate: "17.6%",
      treeCanopy: "22.7%"
    },
    estimatedCost: "$280,000",
    fundingSource: "Approved Streets & Climate Program",
    equityScore: 84,
    projectedTempReduction: "-4.2°F localized relief",
    tags: ["Shade", "Transit", "Funded"],
    recommendedBy: "Urban Heat AI - North Side Baseline Review"
  }
];
