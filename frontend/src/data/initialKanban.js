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
    title: "Mountain Creek Pkwy Hydration Shelter",
    tractId: "tract-0055",
    tractName: "Mountain Creek Valley",
    category: "Emergency Hydration",
    bqmlRiskScore: 4.9,
    heatOffset: "+5.2°F",
    demographics: {
      medianAge: 35.1,
      noVehicleRate: "12.3%",
      povertyRate: "18.6%",
      treeCanopy: "22.8%"
    },
    estimatedCost: "$35,000",
    fundingSource: "Municipal General Fund",
    equityScore: 78,
    projectedTempReduction: "-4.5°F (Local shelter radius)",
    tags: ["Hydration", "Suburban Corridor"],
    recommendedBy: "Automated Gap Scanner"
  },
  {
    id: "kb-02",
    columnId: "backlog",
    title: "Elm Thicket Canopy Infill Buffer",
    tractId: "tract-0039",
    tractName: "Love Field / Elm Thicket",
    category: "Urban Forestry",
    bqmlRiskScore: 5.9,
    heatOffset: "+5.8°F",
    demographics: {
      medianAge: 40.5,
      noVehicleRate: "18.2%",
      povertyRate: "19.3%",
      treeCanopy: "16.5%"
    },
    estimatedCost: "$120,000",
    fundingSource: "IRA Urban Forestry Grant",
    equityScore: 82,
    projectedTempReduction: "-2.8°F (Long term 5-yr)",
    tags: ["Canopy Infill", "Tree Planting"],
    recommendedBy: "Park Dept. Infill Analysis"
  },
  {
    id: "kb-03",
    columnId: "proposed",
    title: "Singleton Blvd Bioswale & Cool Median",
    tractId: "tract-0100",
    tractName: "West Dallas / Singleton Blvd",
    category: "Cool Infrastructure",
    bqmlRiskScore: 8.0,
    heatOffset: "+7.9°F",
    demographics: {
      medianAge: 36.9,
      noVehicleRate: "26.4%",
      povertyRate: "27.5%",
      treeCanopy: "11.2%"
    },
    estimatedCost: "$450,000",
    fundingSource: "TXDOT Transportation Alternatives",
    equityScore: 89,
    projectedTempReduction: "-5.2°F surface temp",
    tags: ["Bioswale", "Cool Median", "Pedestrian"],
    recommendedBy: "SHADE - Spatial Priority Rank #4"
  },
  {
    id: "kb-04",
    columnId: "proposed",
    title: "Vickery Meadow Cool Roof Multi-Family Retrofit",
    tractId: "tract-0092",
    tractName: "Vickery Meadow",
    category: "Building Envelope",
    bqmlRiskScore: 7.5,
    heatOffset: "+6.8°F",
    demographics: {
      medianAge: 29.8,
      noVehicleRate: "38.9%",
      povertyRate: "36.4%",
      treeCanopy: "12.4%"
    },
    estimatedCost: "$850,000",
    fundingSource: "HUD Community Development Block Grant",
    equityScore: 94,
    projectedTempReduction: "-7.4°F indoor radiant temp",
    tags: ["Cool Roofs", "High Density Rental", "Energy Equity"],
    recommendedBy: "SHADE - Demographic Audit"
  },
  {
    id: "kb-05",
    columnId: "council",
    title: "4th & Marsalis Resilience Hub & Transit Canopy",
    tractId: "tract-0089",
    tractName: "East Oak Cliff",
    category: "Resilience Hub",
    bqmlRiskScore: 9.8,
    heatOffset: "+10.2°F",
    demographics: {
      medianAge: 44.8,
      noVehicleRate: "41.5%",
      povertyRate: "38.6%",
      treeCanopy: "4.8%"
    },
    estimatedCost: "$1,450,000",
    fundingSource: "FY2027 Capital Improvement Bond (CIP)",
    equityScore: 99,
    projectedTempReduction: "-8.6°F shaded zone / -3.8°F tract avg",
    tags: ["Critical Need", "Solar Misting", "Transit Hub", "Zero-Vehicle Tract"],
    recommendedBy: "SHADE - Highest Urgency Recommendation"
  },
  {
    id: "kb-06",
    columnId: "council",
    title: "Pleasant Grove 40-Structure Shading Network",
    tractId: "tract-0115",
    tractName: "Pleasant Grove Central",
    category: "Pedestrian Shade",
    bqmlRiskScore: 8.9,
    heatOffset: "+8.8°F",
    demographics: {
      medianAge: 33.5,
      noVehicleRate: "29.5%",
      povertyRate: "34.1%",
      treeCanopy: "8.1%"
    },
    estimatedCost: "$620,000",
    fundingSource: "Dallas Safe Routes to School + Climate Fund",
    equityScore: 96,
    projectedTempReduction: "-14°F under canopy surface",
    tags: ["School Route", "Shade Structures", "High Density"],
    recommendedBy: "SHADE - Youth Heat Exposure Audit"
  },
  {
    id: "kb-07",
    columnId: "approved",
    title: "MLK Jr. Blvd High-Albedo Cool Pavement Sealcoat",
    tractId: "tract-0048",
    tractName: "South Dallas / Fair Park West",
    category: "Reflective Pavement",
    bqmlRiskScore: 9.4,
    heatOffset: "+9.6°F",
    demographics: {
      medianAge: 42.1,
      noVehicleRate: "37.8%",
      povertyRate: "41.2%",
      treeCanopy: "6.2%"
    },
    estimatedCost: "$380,000",
    fundingSource: "Approved Bond Proposition D (Streets & Climate)",
    equityScore: 98,
    projectedTempReduction: "-10.5°F roadway surface / -2.4°F ambient",
    tags: ["Cool Pavement", "Funded", "Construction Q3"],
    recommendedBy: "SHADE - Council Approved July 2026"
  },
  {
    id: "kb-08",
    columnId: "approved",
    title: "Downtown Main St Misting & Hydration Nodes",
    tractId: "tract-0019",
    tractName: "Downtown Core",
    category: "Misting & Water",
    bqmlRiskScore: 7.3,
    heatOffset: "+7.1°F",
    demographics: {
      medianAge: 34.2,
      noVehicleRate: "46.2%",
      povertyRate: "18.2%",
      treeCanopy: "7.6%"
    },
    estimatedCost: "$195,000",
    fundingSource: "Downtown Improvement District (PID)",
    equityScore: 88,
    projectedTempReduction: "-12.0°F ambient micro-pocket",
    tags: ["High Pedestrian", "Public Misting", "Operational"],
    recommendedBy: "SHADE - Downtown Heat Study"
  }
];
