// AI Planning responses, structured card templates, and intelligent query parser
export const INITIAL_CHAT_MESSAGES = [
  {
    id: "msg-1",
    sender: "agent",
    timestamp: "11:00 AM",
    content: `**SHADE** operational in **Dallas - Summer Campaign** mode. 

BigQuery ML thermal offset predictions calibrated using Landsat 9 surface thermography, DART transit trip frequency, and 2024 American Community Survey (ACS) 5-year demographic tracts.

**Current Situation:**
- Baseline ambient: **104°F** | Regional Heat Index: **113°F**
- **4 Critical Tracts** exceeding **+8.5°F** urban heat island offset.
- Estimated **148,500 residents** in high-vulnerability heat zones today.

How can I assist your operational deployment or capital budget planning today?`,
    structuredData: null
  }
];

export const SUGGESTED_PROMPT_CHIPS = [
  {
    id: "chip-1",
    label: "Where should we place 3 new cooling centers?",
    icon: "Building2",
    query: "Where should we place 3 new cooling centers?"
  },
  {
    id: "chip-2",
    label: "Why is the 4th & Marsalis intersection so much hotter?",
    icon: "Flame",
    query: "Why is the 4th & Marsalis intersection so much hotter?"
  },
  {
    id: "chip-3",
    label: "Run an equity audit on top sites.",
    icon: "Scale",
    query: "Run an equity audit on top sites."
  },
  {
    id: "chip-4",
    label: "Simulate Cool Pavement ROI in South Dallas",
    icon: "Sparkles",
    query: "Simulate Cool Pavement ROI in South Dallas"
  }
];

// Generates an AI response based on user input or tract selection
export function getAgentResponse(query, contextTract = null) {
  const q = query.toLowerCase().trim();

  // 1. Where should we place 3 new cooling centers?
  if (q.includes("where should we place") || q.includes("3 new cooling centers") || q.includes("cooling center recommendation")) {
    return {
      content: `### 🎯 BQML Multi-Objective Cooling Center Allocation Analysis

Based on our spatial optimization model minimizing pedestrian walking distance under extreme thermal exposure ($\Delta T > +7.5^\circ\text{F}$), the algorithm prioritizes **three critical coverage gaps**:

1. **Top Priority:** **4th & Marsalis / East Oak Cliff** — 2.4-mile gap to nearest center, 41.5% zero-vehicle households.
2. **Second Priority:** **Red Bird / Dallas Executive Corridor** — 2.1-mile gap, high concentration of isolated seniors (26.5%).
3. **Third Priority:** **West Dallas / Singleton Blvd** — 1.9-mile gap, heavy industrial metal thermal radiation.

Review the structured recommendation cards below to push directly into the **Strategic Planning Kanban** or trigger **Immediate Mobile Dispatch**:`,
      structuredType: "recommendation_cards",
      cards: [
        {
          id: "rec-site-1",
          rank: 1,
          tractId: "tract-0089",
          tractName: "4th & Marsalis / Oak Cliff East",
          locationDetails: "Former Retail Bank Site (Corner of E 4th & Marsalis Ave)",
          bqmlHeatOffset: "+10.2°F",
          riskScore: 9.8,
          gapDistance: "2.4 miles to closest center",
          demographics: {
            zeroVehicle: "41.5%",
            seniors: "31.2%",
            poverty: "38.6%",
            canopyCover: "4.8%"
          },
          projectedImpact: "Protects 6,420 high-risk residents; estimated -6.8°F indoor relief.",
          recommendedType: "Tier-1 Climate Resilience Hub (Solar + Battery + Medical)",
          estCost: "$1,450,000",
          fundingOption: "CIP Bond 2027 Prop A"
        },
        {
          id: "rec-site-2",
          rank: 2,
          tractId: "tract-0109",
          tractName: "Red Bird / Executive Airport Corridor",
          locationDetails: "Red Bird Mall Community Annex (West Camp Wisdom Rd)",
          bqmlHeatOffset: "+8.5°F",
          riskScore: 8.2,
          gapDistance: "2.1 miles to closest center",
          demographics: {
            zeroVehicle: "27.8%",
            seniors: "26.5%",
            poverty: "29.8%",
            canopyCover: "10.3%"
          },
          projectedImpact: "Protects 8,350 residents; bridges airport thermal shadow.",
          recommendedType: "Tier-2 Community Cooling Depot & Transit Shading",
          estCost: "$780,000",
          fundingOption: "Community Development Block Grant (CDBG)"
        },
        {
          id: "rec-site-3",
          rank: 3,
          tractId: "tract-0100",
          tractName: "West Dallas / Singleton Blvd",
          locationDetails: "Singleton Community Center Expansion (Singleton & Morris)",
          bqmlHeatOffset: "+7.9°F",
          riskScore: 8.0,
          gapDistance: "1.9 miles to closest center",
          demographics: {
            zeroVehicle: "26.4%",
            seniors: "22.8%",
            poverty: "27.5%",
            canopyCover: "11.2%"
          },
          projectedImpact: "Buffers industrial thermal envelope; shelters 5,210 residents.",
          recommendedType: "Retrofit Existing Youth Center with High-Capacity HVAC",
          estCost: "$420,000",
          fundingOption: "FEMA Building Resilient Infrastructure (BRIC)"
        }
      ]
    };
  }

  // 2. Why is 4th & Marsalis so much hotter?
  if (q.includes("4th & marsalis") || q.includes("why is the 4th") || (contextTract && contextTract.id === "tract-0089")) {
    return {
      content: `### 🔬 Microclimate Diagnostic: 4th & Marsalis Intersection (Tract 48113008900)

BQML satellite thermography and hyper-local GIS feature attribution break down why this node experiences a **+10.2°F thermal penalty** (Peak Surface Temp: **136.4°F**):

#### 1. Severe Impervious Surface & Albedo Deficit (62% of thermal variance)
- **74.2% impervious surface cover**: Consists of expansive unshaded asphalt parking lots from decommissioned automotive facilities and widened multi-lane roadbeds.
- **Surface Albedo = 0.08**: Absorbs ~92% of incoming solar radiation during peak zenith (12:00 PM – 4:00 PM), storing sensible heat that radiates back well past 9:00 PM.

#### 2. Tree Canopy Desertification (24% of variance)
- **4.8% tree canopy** compared to Dallas citywide average of 29.4% and affluent benchmark tracts like Lake Highlands (34.2%).
- Zero mature shade trees along DART Route 21 bus stops along Marsalis Ave.

#### 3. Demographic & Social Heat Multipliers (Compounding Risk)
- **41.5% zero-car households**: Residents must walk an average of 1,200 feet in direct sun to reach basic food and transit.
- **31.2% elderly population (>65)**: Markedly elevated vulnerability to heat exhaustion and cardiovascular stress.
- **No public cooling refuge** within a 2.4-mile radius.

**Recommended Urgent Action:**
- Stage **Mobile Hydration Unit #4** immediately at 4th & Marsalis.
- Fast-track **Shade Structure Capital Proposal** for Council CIP review.`,
      structuredType: "diagnostic_breakdown",
      tractId: "tract-0089"
    };
  }

  // 3. Run an equity audit on top sites
  if (q.includes("equity audit") || q.includes("audit on top sites") || q.includes("title vi") || q.includes("environmental justice")) {
    return {
      content: `### ⚖️ Automated Equity & Environmental Justice (EJ) Audit

**Audit Methodology:** Title VI Civil Rights Act compliance combined with CDC Social Vulnerability Index (SVI) and BQML Heat Disparity Indexes.

#### Findings & Risk Matrix:
Citywide capital expenditure analysis reveals that over the past decade, tree canopy and shade infrastructure were disproportionately allocated to northern census tracts with low heat vulnerability.

The table below audits our current top 4 candidate intervention sites:`,
      structuredType: "equity_audit_table",
      equityMetrics: [
        {
          tractName: "4th & Marsalis / Oak Cliff East",
          tractId: "tract-0089",
          heatOffset: "+10.2°F",
          povertyRate: "38.6%",
          noVehicle: "41.5%",
          sviScore: "0.98 (Extreme)",
          equityIndex: 99,
          complianceStatus: "CRITICAL PRIORITY (Underfunded)",
          statusBadge: "bg-red-500/20 text-red-300 border-red-500/40"
        },
        {
          tractName: "South Dallas / Fair Park West",
          tractId: "tract-0048",
          heatOffset: "+9.6°F",
          povertyRate: "41.2%",
          noVehicle: "37.8%",
          sviScore: "0.95 (High)",
          equityIndex: 98,
          complianceStatus: "ACTIVE INTERVENTION (CIP Funded)",
          statusBadge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
        },
        {
          tractName: "Pleasant Grove Central",
          tractId: "tract-0115",
          heatOffset: "+8.8°F",
          povertyRate: "34.1%",
          noVehicle: "29.5%",
          sviScore: "0.89 (High)",
          equityIndex: 96,
          complianceStatus: "PARTIAL COVERAGE (Overcrowded)",
          statusBadge: "bg-amber-500/20 text-amber-300 border-amber-500/40"
        },
        {
          tractName: "West Dallas / Singleton Blvd",
          tractId: "tract-0100",
          heatOffset: "+7.9°F",
          povertyRate: "27.5%",
          noVehicle: "26.4%",
          sviScore: "0.80 (Moderate-High)",
          equityIndex: 89,
          complianceStatus: "ELIGIBLE FOR BRIC GRANT",
          statusBadge: "bg-blue-500/20 text-blue-300 border-blue-500/40"
        }
      ]
    };
  }

  // 4. Cool Pavement Simulation
  if (q.includes("cool pavement") || q.includes("roi") || q.includes("south dallas")) {
    return {
      content: `### 🛣️ BQML Simulation: High-Albedo Cool Pavement Sealcoat (South Dallas Corridor)

Simulating the application of high-reflectance titanium oxide-infused slurry coating ($0.42/sq ft) along 4.2 lane-miles of MLK Jr. Blvd & Robert B. Cullum:

- **Surface Temperature Reduction:** $-10.5^\circ\text{F}$ at 2:00 PM peak (from $133.8^\circ\text{F} \rightarrow 123.3^\circ\text{F}$).
- **Ambient 2-Meter Air Temp Reduction:** $-2.4^\circ\text{F}$ microclimate benefit.
- **Estimated Heat-Related 911 Call Reduction:** $-28\%$ based on historical empirical regression.
- **Pavement Lifespan Extension:** +4.5 years due to lower thermal fatigue cracking.
- **Benefit-Cost Ratio (BCR):** **3.8 : 1** over a 7-year municipal lifecycle.

Recommendation: Approved in Bond Proposition D. Contractor procurement scheduled for August 2026.`,
      structuredType: "roi_simulation",
      tractId: "tract-0048"
    };
  }

  // 5. Node click inspection response
  if (contextTract) {
    return {
      content: `### 📍 Spatial Node Telemetry: ${contextTract.name} (${contextTract.tractNumber})

- **BQML Heat Offset:** **+${contextTract.heatOffset}°F** above Dallas regional baseline.
- **Current Surface Temperature:** **${contextTract.surfaceTemp}°F**
- **Heat Vulnerability Score:** **${contextTract.bqmlRiskScore} / 10**
- **Demographics:** Zero-Vehicle: **${contextTract.demographics.noVehicleRate}%** | Senior Pop (>65): **${contextTract.demographics.seniorRate}%** | Tree Canopy: **${contextTract.demographics.treeCanopyCover}%**
- **Nearest Cooling Facility:** ${contextTract.nearestCenterDist} (${contextTract.coolingCenterNearby ? "Nearby" : "Deficit Zone"})
- **Historical Hotspot:** ${contextTract.isHistoricalHotspot ? `YES (${contextTract.historicalCalls2025} EMS calls in 2025)` : "No active flag"}

**Strategic Intelligence:**
${contextTract.notes}

**Recommended Action:**
${contextTract.recommendedAction}`,
      structuredType: "tract_card",
      tract: contextTract
    };
  }

  // Default intelligent assistant response
  return {
    content: `### 🌐 SHADE Analysis

I have processed your query regarding: **"${query}"** against Dallas municipal spatial layers and BQML climate projections.

**Key Model Observations:**
- Today's thermal envelope peaks between **2:30 PM – 5:15 PM** with surface temperatures reaching up to **136.4°F** in South & Oak Cliff tracts.
- Emergency services should prioritize non-vehicular transit stops along major bus arteries.
- Would you like me to:
  1. Generate a **Candidate Site Card** for this location to push to the Kanban board?
  2. Simulate the microclimate cooling effect of planting 250 shade trees?
  3. Dispatch a mobile hydration unit or cooling bus?`,
    structuredType: "general"
  };
}
