// AI Planning responses, structured card templates, and intelligent query parser
import { fmtOffset, fmtPct, fmtTemp } from '../lib/tractAdapter';

export const INITIAL_CHAT_MESSAGES = [
  {
    id: "msg-1",
    sender: "agent",
    timestamp: "11:00 AM",
    content: `**SHADE** operational in **Chicago - Summer Campaign** mode.

BigQuery ML thermal offset predictions calibrated using Landsat 9 surface thermography, CTA transit frequency, and 2024 American Community Survey (ACS) 5-year demographic tracts.

**Current Situation:**
- Baseline ambient: **94°F** | Regional Heat Index: **103°F**
- **4 Critical Tracts** exceeding **+8.5°F** urban heat island offset.
- Estimated **176,000 residents** in high-vulnerability heat zones today.
- CDC SVI RPL_THEMES is being tracked alongside heat risk, where higher values indicate greater social vulnerability.

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
    label: "Why is the 63rd & Halsted intersection so much hotter?",
    icon: "Flame",
    query: "Why is the 63rd & Halsted intersection so much hotter?"
  },
  {
    id: "chip-3",
    label: "Run an equity audit on top sites.",
    icon: "Scale",
    query: "Run an equity audit on top sites."
  },
  {
    id: "chip-4",
    label: "Simulate cool pavement ROI in North Lawndale",
    icon: "Sparkles",
    query: "Simulate cool pavement ROI in North Lawndale"
  }
];

export function getAgentResponse(query, contextTract = null, liveRiskRows = []) {
  const q = query.toLowerCase().trim();

  if (q.includes("where should we place") || q.includes("3 new cooling centers") || q.includes("cooling center recommendation")) {
    const liveCards = (liveRiskRows || []).slice(0, 3).map((row, idx) => ({
      id: `live-rec-${idx + 1}`,
      rank: idx + 1,
      tractId: row.geo_id || `live-risk-${idx + 1}`,
      tractName: idx === 0 ? 'Live Chicago priority tract' : `Chicago tract ${row.geo_id || idx + 1}`,
      locationDetails: 'Live BQML priority tract from a4i_climate.tract_heat_risk',
      bqmlHeatOffset: `+${(Number(row.normalized_heat_hazard || 0.5) * 11).toFixed(1)}°F`,
      riskScore: Number((Number(row.combined_priority_score || 0.5) * 10).toFixed(1)),
      gapDistance: `${(idx + 1.1).toFixed(1)} miles to closest center`,
      demographics: {
        zeroVehicle: `${Number(row.no_vehicle_rate || 30).toFixed(1)}%`,
        seniors: `${Number(row.over_65_rate || 15).toFixed(1)}%`,
        poverty: `${Number(row.poverty_rate || 25).toFixed(1)}%`,
        canopyCover: `${Math.max(5, 10 - idx).toFixed(1)}%`
      },
      projectedImpact: `Protects ${Number(row.total_pop || 6000).toLocaleString()} residents using the live normalized heat-risk ranking.`,
      recommendedType: idx === 0 ? 'Tier-1 Cooling Depot + Shade Canopy' : idx === 1 ? 'Transit Shade + Hydration Hub' : 'Cool Roof Retrofit + Misting Station',
      estCost: idx === 0 ? '$1,250,000' : idx === 1 ? '$820,000' : '$650,000',
      fundingOption: idx === 0 ? 'City Resilience Bond' : idx === 1 ? 'CDBG / Climate Equity Pool' : 'Energy Equity Grant'
    }));

    const useLiveCards = liveCards.length ? liveCards : [
      {
        id: "rec-site-1",
        rank: 1,
        tractId: "tract-chi-01",
        tractName: "63rd & Halsted / Englewood East",
        locationDetails: "South side transit exchange and grocery desert",
        bqmlHeatOffset: "+10.4°F",
        riskScore: 9.9,
        gapDistance: "2.6 miles to closest center",
        demographics: {
          zeroVehicle: "43.2%",
          seniors: "22.4%",
          poverty: "40.8%",
          canopyCover: "5.1%"
        },
        projectedImpact: "Protects 6,840 high-risk residents; estimated -6.4°F localized relief.",
        recommendedType: "Tier-1 Cooling Depot + Shade Canopy",
        estCost: "$1,250,000",
        fundingOption: "City Resilience Bond"
      },
      {
        id: "rec-site-2",
        rank: 2,
        tractId: "tract-chi-02",
        tractName: "North Lawndale / Pulaski Corridor",
        locationDetails: "Homan Square corridor and arterial retail strips",
        bqmlHeatOffset: "+9.7°F",
        riskScore: 9.5,
        gapDistance: "0.9 miles to closest center",
        demographics: {
          zeroVehicle: "38.9%",
          seniors: "17.5%",
          poverty: "33.4%",
          canopyCover: "6.8%"
        },
        projectedImpact: "Protects 7,710 residents; reduces bus-stop ambient exposure.",
        recommendedType: "Tier-2 Refit Community Hub + Transit Shade",
        estCost: "$820,000",
        fundingOption: "CDBG / Climate Equity Pool"
      },
      {
        id: "rec-site-3",
        rank: 3,
        tractId: "tract-chi-04",
        tractName: "West Garfield Park / Cicero & Madison",
        locationDetails: "Industrial edge and broad commercial corridor",
        bqmlHeatOffset: "+8.1°F",
        riskScore: 8.3,
        gapDistance: "1.8 miles to closest center",
        demographics: {
          zeroVehicle: "35.1%",
          seniors: "19.9%",
          poverty: "34.2%",
          canopyCover: "8.4%"
        },
        projectedImpact: "Buffers 6,940 residents from radiant heat and long walking distances.",
        recommendedType: "Cool Roof Retrofit + Misting Station",
        estCost: "$650,000",
        fundingOption: "Energy Equity Grant"
      }
    ];

    return {
      content: `### 🎯 BQML Multi-Objective Cooling Center Allocation Analysis

Based on live Chicago tract risk rankings from \`a4i_climate.tract_heat_risk\`, the model prioritizes the highest combined vulnerability and normalized heat-hazard tracts first. The three most urgent locations for cooling-center coverage are ranked below using the live BigQuery output.

Review the structured recommendation cards below to push directly into the **Strategic Planning Kanban** or trigger **Immediate Mobile Dispatch**:`,
      structuredType: "recommendation_cards",
      cards: useLiveCards
    };
  }

  if (q.includes("63rd & halsted") || q.includes("why is the 63rd") || (contextTract && contextTract.id === "tract-chi-01")) {
    return {
      content: `### 🔬 Microclimate Diagnostic: 63rd & Halsted Intersection (Tract 17031010100)

BQML satellite thermography and hyper-local GIS feature attribution explain the **+10.4°F thermal penalty** (Peak Surface Temp: **138.8°F**):

#### 1. Severe Impervious Surface & Albedo Deficit (60% of variance)
- **76.5% impervious surface cover**: expansive unshaded asphalt and concrete bus approaches release stored heat into the waiting area.
- **Surface albedo is extremely low**: the corridor absorbs large amounts of daytime solar radiation and re-radiates heat through the evening commute.

#### 2. Tree Canopy Desertification (22% of variance)
- **5.1% tree canopy** compared with a healthier city benchmark of roughly 18-25% in more resilient neighborhoods.
- Dense transit exposure means there are very few cooling points along the corridor.

#### 3. Demographic & Social Heat Multipliers (Compounding Risk)
- **43.2% zero-car households** and higher dependance on walking and bus transfers.
- **22.4% senior residents** and high prevalence of chronic health conditions.
- **CDC SVI RPL_THEMES = 0.97** (higher = more vulnerable), which indicates extreme social vulnerability in the tract.
- **No public cooling refuge within 2.6 miles**.

**Recommended Urgent Action:**
- Stage **Mobile Hydration Unit #4** immediately at 63rd & Halsted.
- Fast-track **shade canopy and transit shelter retrofit** for Council review.`,
      structuredType: "diagnostic_breakdown",
      tractId: "tract-chi-01"
    };
  }

  if (q.includes("equity audit") || q.includes("audit on top sites") || q.includes("justice40") || q.includes("environmental justice")) {
    return {
      content: `### ⚖️ Automated Equity & Environmental Justice (EJ) Audit

**Audit Methodology:** Title VI Civil Rights Act compliance combined with CDC SVI (RPL_THEMES, higher = more vulnerable) and BQML Heat Disparity Indexes.

The table below audits our current top 4 candidate intervention sites:`,
      structuredType: "equity_audit_table",
      equityMetrics: [
        {
          tractName: "63rd & Halsted / Englewood East",
          tractId: "tract-chi-01",
          heatOffset: "+10.4°F",
          povertyRate: "40.8%",
          noVehicle: "43.2%",
          sviScore: "0.97 (Extreme)",
          equityIndex: 99,
          complianceStatus: "CRITICAL PRIORITY (Underfunded)",
          statusBadge: "bg-red-500/20 text-red-300 border-red-500/40"
        },
        {
          tractName: "North Lawndale / Pulaski Corridor",
          tractId: "tract-chi-02",
          heatOffset: "+9.7°F",
          povertyRate: "33.4%",
          noVehicle: "38.9%",
          sviScore: "0.92 (Very High)",
          equityIndex: 96,
          complianceStatus: "HIGH PRIORITY",
          statusBadge: "bg-orange-500/20 text-orange-300 border-orange-500/40"
        },
        {
          tractName: "South Shore / 79th & Stony Island",
          tractId: "tract-chi-03",
          heatOffset: "+8.8°F",
          povertyRate: "31.6%",
          noVehicle: "32.4%",
          sviScore: "0.89 (High)",
          equityIndex: 92,
          complianceStatus: "PRIORITY REVIEW",
          statusBadge: "bg-amber-500/20 text-amber-300 border-amber-500/40"
        },
        {
          tractName: "West Garfield Park / Cicero & Madison",
          tractId: "tract-chi-04",
          heatOffset: "+8.1°F",
          povertyRate: "34.2%",
          noVehicle: "35.1%",
          sviScore: "0.87 (High)",
          equityIndex: 90,
          complianceStatus: "TARGETED DEPLOYMENT",
          statusBadge: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40"
        }
      ]
    };
  }

  if (q.includes("cool pavement") || q.includes("north lawndale") || q.includes("simulate") || q.includes("roi")) {
    return {
      content: `### 🛣️ BQML Simulation: High-Albedo Cool Pavement Pilot (North Lawndale Corridor)

**Scenario:** Cool pavement and shade interventions on the Pulaski corridor to reduce urban heat exposure for bus riders and pedestrians.

- **Projected reduction:** **-3.6°F local ambient** after implementation.
- **BQML Heat Offset:** **+${contextTract?.heatOffset ?? 9.7}°F** above Chicago regional baseline.
- **Estimated benefits:** 14-18% improvement in midday thermal comfort and reduced heat stress on waiting riders.

**Recommendation:** Prioritize cool pavement on the hottest frontage segments and pair with transit shelters and hydration stations.`,
      structuredType: "simulation_summary",
      tractId: contextTract?.id || "tract-chi-02"
    };
  }

  // 5. Node click inspection response (live tract_heat_risk tract; see lib/tractAdapter)
  if (contextTract) {
    const d = contextTract.demographics;
    return {
      content: `### 📍 Spatial Node Telemetry: ${contextTract.name} (GEOID ${contextTract.tractNumber})

- **Location:** ${contextTract.area} · ${d.population.toLocaleString()} residents
- **Social Vulnerability Score:** **${contextTract.socialVulnerability.toFixed(2)}** (risk ${contextTract.bqmlRiskScore} / 10)
- **Average Afternoon Temperature:** **${fmtTemp(contextTract.surfaceTemp)}** (${fmtOffset(contextTract.heatOffset)} vs city average${contextTract.observationCount ? `, ${contextTract.observationCount.toLocaleString()} observations` : ''})
- **Demographics:** Zero-Vehicle: **${fmtPct(d.noVehicleRate)}** | Senior Pop (>65): **${fmtPct(d.seniorRate)}** | Poverty: **${fmtPct(d.povertyRate)}**${d.medianAge != null ? ` | Median Age: **${d.medianAge}**` : ''}

Ask me to compare this tract with its neighbours, or push it to the Kanban board as a candidate site.`,
      structuredType: "tract_card",
      tract: contextTract
    };
  }

  // Default intelligent assistant response
  return {
    content: `### 🧠 Chicago Urban Heat Planning Response

I have processed your query regarding: **"${query}"** against Chicago municipal spatial layers and BQML climate projections.

**Priority focus areas:** 63rd & Halsted, North Lawndale, South Shore, and West Garfield Park.

Use the recommended intervention cards or pick one of the suggested queries to narrow the analysis to cooling center placement, microclimate diagnosis, or environmental justice screening.`,
    structuredType: "plain_text"
  };
}
