// Real-time operational alerts and historical audit log for municipal emergency response
export const INITIAL_ALERTS = [
  {
    id: "alert-001",
    tractId: "tract-0089",
    tractName: "4th & Marsalis / Oak Cliff East",
    severity: "CRITICAL",
    timestamp: "14 mins ago",
    title: "Extreme Thermal Anomaly & Transit Hazard",
    description: "BQML satellite telemetry indicates surface temp reached 136.4°F (+10.2°F offset). Zero cooling facilities within a 2.4-mile radius. 41.5% zero-vehicle households at high risk of heat stroke at DART bus stop #21.",
    bqmlOffset: "+10.2°F",
    affectedPop: 6420,
    metrics: {
      heatOffset: "+10.2°F",
      surfaceTemp: "136.4°F",
      noVehicleRate: "41.5%",
      seniorRate: "31.2%"
    },
    suggestedAction: "Dispatch Mobile Cooling Unit #4 & Palletized Hydration Depot",
    priority: 1
  },
  {
    id: "alert-002",
    tractId: "tract-0115",
    tractName: "Pleasant Grove Central",
    severity: "CRITICAL",
    timestamp: "28 mins ago",
    title: "Cooling Center Overcrowding Warning",
    description: "Pleasant Grove Branch Library has reached 90% capacity (108/120 persons). Waiting line formed outdoors under direct 104°F sun with 620 water bottles remaining. Critical threshold approaching.",
    bqmlOffset: "+8.8°F",
    affectedPop: 9140,
    metrics: {
      heatOffset: "+8.8°F",
      surfaceTemp: "129.5°F",
      occupancy: "90%",
      bottlesLeft: "620"
    },
    suggestedAction: "Route Auxiliary Mobile Water Tender & Open Overflow Pavilion",
    priority: 2
  },
  {
    id: "alert-003",
    tractId: "tract-0048",
    tractName: "South Dallas / Fair Park West",
    severity: "HIGH",
    timestamp: "45 mins ago",
    title: "Vulnerable Senior Cluster Heat Index Alert",
    description: "Heat Index reached 114°F at senior housing complex (MLK Blvd & Malcolm X). 28.4% residents over 65; electrical load spike reported on Feeder 14B.",
    bqmlOffset: "+9.6°F",
    affectedPop: 5890,
    metrics: {
      heatOffset: "+9.6°F",
      surfaceTemp: "133.8°F",
      seniorRate: "28.4%",
      gridStatus: "Heavy Load"
    },
    suggestedAction: "Deploy Emergency Generator Backup & Wellness Check Squad",
    priority: 3
  },
  {
    id: "alert-004",
    tractId: "tract-0100",
    tractName: "West Dallas / Singleton Blvd",
    severity: "MEDIUM",
    timestamp: "1 hour ago",
    title: "Industrial Radiant Boundary Thermal Spike",
    description: "Reflective corrugated metal roofing elevating ambient temperatures on Singleton Blvd to 109°F. High pedestrian exposure along unshaded work transit path.",
    bqmlOffset: "+7.9°F",
    affectedPop: 5210,
    metrics: {
      heatOffset: "+7.9°F",
      surfaceTemp: "126.1°F",
      treeCanopy: "11.2%"
    },
    suggestedAction: "Stage Pop-Up Shade Canopies at 3 Major Crosswalks",
    priority: 4
  }
];

export const INITIAL_AUDIT_LOG = [
  {
    id: "audit-001",
    action: "Deployed Mobile Hydration Unit #2",
    tractId: "tract-0048",
    location: "South Dallas (MLK Community Center Overflow)",
    actor: "Urban Heat AI Automated Dispatch (Confirmed by Capt. R. Vance)",
    timestamp: "Today, 1:15 PM",
    equityResult: "PASSED (Score: 98/100)",
    equityDetails: "Direct Title VI EJ Compliance. Target tract has 41.2% poverty and 37.8% no-vehicle households (Top 5% vulnerability citywide).",
    status: "Active In Field",
    impact: "Supplied 1,200 cold electrolyte packets, shaded 85 waiting transit riders."
  },
  {
    id: "audit-002",
    action: "Cooling Center Operating Hours Extended to 10 PM",
    tractId: "tract-0019",
    location: "Downtown Core (J. Erik Jonsson Library)",
    actor: "City Manager Emergency Directive",
    timestamp: "Today, 11:30 AM",
    equityResult: "PASSED (Score: 91/100)",
    equityDetails: "High unsheltered and pedestrian density corridor during nighttime urban canyon heat trap.",
    status: "Completed",
    impact: "Accommodated 285 individuals during peak thermal radiant hours."
  },
  {
    id: "audit-003",
    action: "Automated Equity Check: Cool Pavement Pilot Site Selection",
    tractId: "tract-0089",
    location: "Oak Cliff East / 4th & Marsalis",
    actor: "Urban Heat AI - BQML Algorithmic Evaluator",
    timestamp: "Yesterday, 4:45 PM",
    equityResult: "PRIORITY VERIFIED (Score: 99/100)",
    equityDetails: "Disparity audit flagged historical redlining disinvestment; zero public cooling infrastructure in tract despite +10.2°F heat island anomaly.",
    status: "Forwarded to Council CIP Review",
    impact: "Promoted to Top 1 Priority for FY2027 Capital Improvement Bond."
  },
  {
    id: "audit-004",
    action: "Dispatched High-Capacity Misting Trailer #07",
    tractId: "tract-0115",
    location: "Pleasant Grove Central Transit Transfer",
    actor: "Emergency Operations Specialist D. Morales",
    timestamp: "Yesterday, 2:10 PM",
    equityResult: "PASSED (Score: 94/100)",
    equityDetails: "Tract exceeds 30% poverty threshold and 29% non-car commuting rate.",
    status: "Completed",
    impact: "Reduced localized ambient air temp at bus queue by 14.8°F."
  }
];
