// Real-time operational alerts and historical audit log for municipal emergency response
export const INITIAL_ALERTS = [
  {
    id: "alert-001",
    tractId: "tract-chi-01",
    tractName: "63rd & Halsted / Englewood East",
    severity: "CRITICAL",
    timestamp: "14 mins ago",
    title: "Extreme Thermal Anomaly & Transit Hazard",
    description: "BQML surface modeling indicates 138.8°F at the 63rd & Halsted transit edge. No public cooling refuge exists within 2.6 miles and 43.2% of households have no vehicle.",
    bqmlOffset: "+10.4°F",
    affectedPop: 6840,
    metrics: {
      heatOffset: "+10.4°F",
      surfaceTemp: "138.8°F",
      noVehicleRate: "43.2%",
      seniorRate: "22.4%"
    },
    suggestedAction: "Dispatch Mobile Cooling Unit #4 & Shade Canopy at 63rd & Halsted",
    priority: 1
  },
  {
    id: "alert-002",
    tractId: "tract-chi-03",
    tractName: "South Shore / 79th & Stony Island",
    severity: "CRITICAL",
    timestamp: "28 mins ago",
    title: "Cooling Center Overcrowding Warning",
    description: "The South Shore Library & Community Hub has reached 89% occupancy. Riders are waiting in direct heat while water reserves are falling and bus transfers continue to stack up.",
    bqmlOffset: "+8.8°F",
    affectedPop: 8120,
    metrics: {
      heatOffset: "+8.8°F",
      surfaceTemp: "130.6°F",
      occupancy: "89%",
      bottlesLeft: "760"
    },
    suggestedAction: "Route auxiliary hydration trailer and open overflow pavilion",
    priority: 2
  },
  {
    id: "alert-003",
    tractId: "tract-chi-02",
    tractName: "North Lawndale / Pulaski Corridor",
    severity: "HIGH",
    timestamp: "45 mins ago",
    title: "Vulnerable Senior Cluster Heat Index Alert",
    description: "Heat index reached 103°F near the senior housing cluster along Pulaski. 17.5% of residents are 65+ and the corridor remains exposed to reflective commercial surfaces.",
    bqmlOffset: "+9.7°F",
    affectedPop: 7710,
    metrics: {
      heatOffset: "+9.7°F",
      surfaceTemp: "135.2°F",
      seniorRate: "17.5%",
      gridStatus: "Heavy Load"
    },
    suggestedAction: "Deploy wellness check team and add emergency cooling station",
    priority: 3
  },
  {
    id: "alert-004",
    tractId: "tract-chi-04",
    tractName: "West Garfield Park / Cicero & Madison",
    severity: "MEDIUM",
    timestamp: "1 hour ago",
    title: "Industrial Radiant Boundary Thermal Spike",
    description: "Reflective industrial surfaces and wide roadways are pushing air temperature above 102°F. The corridor remains exposed to radiant heat without a nearby cooling option.",
    bqmlOffset: "+8.1°F",
    affectedPop: 6940,
    metrics: {
      heatOffset: "+8.1°F",
      surfaceTemp: "126.7°F",
      treeCanopy: "8.4%"
    },
    suggestedAction: "Stage pop-up shade canopies and cooling water access points",
    priority: 4
  }
];

export const INITIAL_AUDIT_LOG = [
  {
    id: "audit-001",
    action: "Deployed Mobile Hydration Unit #2",
    tractId: "tract-chi-02",
    location: "North Lawndale (Homan Square)",
    actor: "Urban Heat AI Automated Dispatch (Confirmed by Captain R. Flores)",
    timestamp: "Today, 1:15 PM",
    equityResult: "PASSED (Score: 98/100)",
    equityDetails: "Direct EJ compliance check met minimum thresholds for zero-vehicle households and poverty burden in the target tract.",
    status: "Active In Field",
    impact: "Supplied 1,200 electrolyte packets and shaded 88 riders at key transit stops."
  },
  {
    id: "audit-002",
    action: "Cooling Center Hours Extended to 10 PM",
    tractId: "tract-chi-03",
    location: "South Shore (South Shore Library)",
    actor: "City Manager Emergency Directive",
    timestamp: "Today, 11:30 AM",
    equityResult: "PASSED (Score: 92/100)",
    equityDetails: "High transit dependence and near-term exposure risk triggered extended evening hours.",
    status: "Completed",
    impact: "Accommodated 285 residents during peak thermal stress period."
  },
  {
    id: "audit-003",
    action: "Automated Equity Check: Transit Shade Pilot",
    tractId: "tract-chi-01",
    location: "Englewood East / 63rd & Halsted",
    actor: "Urban Heat AI - BQML Algorithmic Evaluator",
    timestamp: "Yesterday, 4:45 PM",
    equityResult: "PRIORITY VERIFIED (Score: 99/100)",
    equityDetails: "Exposure audit confirmed major underinvestment in shade access and cooling infrastructure despite extreme surface heating.",
    status: "Forwarded to Council CIP Review",
    impact: "Promoted to Top 1 Priority for 2027 capital funding cycle."
  },
  {
    id: "audit-004",
    action: "Dispatched High-Capacity Misting Trailer #07",
    tractId: "tract-chi-04",
    location: "West Garfield Park Transit Spine",
    actor: "Emergency Operations Specialist D. Morales",
    timestamp: "Yesterday, 2:10 PM",
    equityResult: "PASSED (Score: 94/100)",
    equityDetails: "Target tract exceeds 30% poverty threshold and a high share of households without vehicle access.",
    status: "Completed",
    impact: "Reduced localized ambient temperature at the bus queue by 12.8°F."
  }
];
