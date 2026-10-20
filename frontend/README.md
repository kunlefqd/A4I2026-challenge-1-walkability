# Urban Heat Resilience Planner ("Urban Heat AI")

A modern, responsive web application for a municipal climate resilience planning assistant, designed for city managers and emergency responders. Built with React, Tailwind CSS, and Lucide React.

## Features

1. **Top Navigation Bar**:
   - Live status badge: `Agent Active` (BQML Spatial Engine v3.8)
   - City selector dropdown: Dallas (default), Phoenix, Atlanta
   - Track selector toggle:
     - `⚡ Today's Emergency`: Real-time dispatch, high-risk tract alerts, mobile cooling vans
     - `🏛️ Budget Cycle`: FY2027 Capital Improvement Program (CIP), cool pavement bids, shade funding
     - `🌳 Decade Strategy`: 2035 Climate Action Plan, 30% urban canopy target, long-term equity
   - View switcher: Toggle between Spatial Map/AI Workspace and Strategic Planning Kanban Board

2. **Spatial Intelligence & Map (60% Width)**:
   - Interactive GIS SVG map showing census tracts color-coded by BQML heat offsets (+4°F to +10.2°F)
   - Highway corridors (I-30, I-35E, Loop 12) & Trinity River greenway
   - Interactive overlay toggles:
     - Cooling Centers (with live occupancy % and generator readiness)
     - Vulnerable Tracts (Low-Vehicle >30% / Seniors >25%)
     - Historical Hotspots (911 emergency heat dispatch call frequency)
     - Tree Canopy Deficit (<10% canopy)
   - Dynamic Heat Offset threshold filter slider
   - Clicking any tract highlights it, displays a floating telemetry drawer, and streams coordinates directly into the AI Planner Chat

3. **Agent Workspace (40% Width - Tabbed)**:
   - **Tab 1: AI Planner Chat**:
     - Pre-loaded prompt chips (*"Where should we place 3 new cooling centers?"*, *"Why is the 4th & Marsalis intersection so much hotter?"*, *"Run an equity audit on top sites."*, etc.)
     - Structured Recommendation Cards with one-click actions: `Add to Kanban`, `Deploy Resource`, `Locate on Map`
     - Automated Title VI Environmental Justice Disparity Matrix
   - **Tab 2: Active Alerts & Action History**:
     - Real-time operational alerts for high-risk zones with `Dismiss` and `Take Action (Deploy Truck)` buttons
     - Action History & Audit Log with automated Title VI Equity check badges (`PASSED: Score 99/100`)

4. **Strategic Planning Kanban Board**:
   - 4 Columns: `Backlog`, `Proposed Sites`, `Council Review`, and `Approved / Funded`
   - Cards display demographic data (median age, no-vehicle rate, poverty rate, canopy %) and BQML risk scores
   - Dynamic stage advancement with celebratory confetti upon funding approval
   - Custom proposal modal to add new municipal interventions

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation
```bash
cd frontend
npm install
```

### Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build
```bash
npm run build
```
