import React, { useEffect, useMemo, useState } from 'react';
import Navbar from './components/Navbar';
import MetricsRibbon from './components/MetricsRibbon';
import HeatMap from './components/Map/HeatMap';
import MapControls from './components/Map/MapControls';
import AgentWorkspace from './components/AgentWorkspace/AgentWorkspace';
import KanbanBoard from './components/Kanban/KanbanBoard';
import DeployTruckModal from './components/Modals/DeployTruckModal';

import { CITIES, CHICAGO_TRACTS } from './data/cityData';
import { INITIAL_ALERTS, INITIAL_AUDIT_LOG } from './data/initialAlerts';
import { INITIAL_KANBAN_CARDS } from './data/initialKanban';
import { INITIAL_CHAT_MESSAGES, getAgentResponse } from './data/aiKnowledge';
import { CHICAGO_WEATHER_FALLBACK, fetchChicagoWeather } from './services/weather';
import { requestAgentResponse } from './services/agent';
import { CheckCircle2, Bell, Sparkles } from 'lucide-react';

export default function App() {
  // Navigation & Track States
  const [currentCity, setCurrentCity] = useState(CITIES[0]); // Chicago - Summer Campaign
  const [currentTrack, setCurrentTrack] = useState('today'); // 'today' | 'budget' | 'decade'
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'kanban'

  // Spatial Map States
  const [selectedTract, setSelectedTract] = useState(null);
  const [showCoolingCenters, setShowCoolingCenters] = useState(true);
  const [showVulnerableTracts, setShowVulnerableTracts] = useState(true);
  const [showHistoricalHotspots, setShowHistoricalHotspots] = useState(true);
  const [showCanopyDeficit, setShowCanopyDeficit] = useState(false);
  const [heatThreshold, setHeatThreshold] = useState(4.0);
  const [basemapStyle, setBasemapStyle] = useState('streets');
  const [simulatedHeatBoost, setSimulatedHeatBoost] = useState(0);

  // Agent Workspace & Alerts States
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState('chat'); // 'chat' | 'alerts'
  const [chatMessages, setChatMessages] = useState(INITIAL_CHAT_MESSAGES);
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [auditLog, setAuditLog] = useState(INITIAL_AUDIT_LOG);

  // Kanban Board States
  const [kanbanCards, setKanbanCards] = useState(INITIAL_KANBAN_CARDS);

  // Emergency Truck Dispatch Modal
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [deployModalTarget, setDeployModalTarget] = useState({ alert: null, tract: null });

  // Floating Toast Notification
  const [toastMessage, setToastMessage] = useState(null);
  const [weather, setWeather] = useState(CHICAGO_WEATHER_FALLBACK);
  const [liveRiskRows, setLiveRiskRows] = useState([]);

  const CHICAGO_REAL_TRACT_LABELS = {
    '17031834900': { name: 'South Chicago / Englewood Corridor', area: 'South Side' },
    '17031670800': { name: 'Chicago Lawn / Englewood', area: 'South Side' },
    '17031671100': { name: 'Halsted & 63rd Priority Tract', area: 'Englewood' },
    '17031670300': { name: 'Auburn Gresham / West Englewood', area: 'Auburn Gresham' },
    '17031670200': { name: 'West Englewood Transit Belt', area: 'West Englewood' },
    '17031671200': { name: 'Englewood South Side Cluster', area: 'Englewood' },
    '17031611900': { name: 'Auburn Gresham Heat Zone', area: 'Auburn Gresham' },
    '17031610300': { name: 'South Side West Corridor', area: 'West Englewood' },
    '17031650200': { name: 'South Chicago Heat Priority', area: 'South Chicago' },
    '17031671600': { name: 'South Side Transit Exposure Tract', area: 'Englewood' },
  };

  const displayedTracts = useMemo(() => {
    if (!liveRiskRows.length) return CHICAGO_TRACTS;

    return liveRiskRows.slice(0, 10).map((row, index) => {
      const baseTract = CHICAGO_TRACTS[index % CHICAGO_TRACTS.length];
      const normalizedHeatHazard = Number(row.normalized_heat_hazard ?? baseTract.normalizedHeatHazard ?? 0.5);
      const combinedPriorityScore = Number(row.combined_priority_score ?? baseTract.combinedPriorityScore ?? 0.5);
      const socialVulnerabilityScore = Number(row.social_vulnerability_score ?? baseTract.cdcSviRplThemes ?? 0.5);
      const noVehicleRate = Number(row.no_vehicle_rate ?? baseTract.demographics.noVehicleRate ?? 30);
      const povertyRate = Number(row.poverty_rate ?? baseTract.demographics.povertyRate ?? 25);
      const over65Rate = Number(row.over_65_rate ?? baseTract.demographics.seniorRate ?? 15);
      const tractMeta = CHICAGO_REAL_TRACT_LABELS[row.geo_id] || { name: `${baseTract.area} Priority Tract`, area: baseTract.area };

      return {
        ...baseTract,
        id: row.geo_id || baseTract.id,
        tractNumber: String(row.geo_id || baseTract.tractNumber),
        geo_id: row.geo_id || baseTract.tractNumber,
        name: tractMeta.name,
        area: tractMeta.area,
        lat: Number(row.tract_lat ?? baseTract.coordinates?.lat ?? 41.8781),
        lng: Number(row.tract_lon ?? baseTract.coordinates?.lng ?? -87.6298),
        heatOffset: Number((normalizedHeatHazard * 11).toFixed(1)),
        surfaceTemp: Number((row.tract_avg_temp_f ? Number(row.tract_avg_temp_f) : baseTract.surfaceTemp).toFixed(1)),
        bqmlRiskScore: Number((combinedPriorityScore * 10).toFixed(1)),
        cdcSviRplThemes: Number(socialVulnerabilityScore.toFixed(2)),
        normalizedHeatHazard: Number(normalizedHeatHazard.toFixed(4)),
        combinedPriorityScore: Number(combinedPriorityScore.toFixed(4)),
        demographics: {
          ...baseTract.demographics,
          medianAge: Number(row.median_age ?? baseTract.demographics.medianAge ?? 35),
          noVehicleRate: Number(noVehicleRate.toFixed(1)),
          povertyRate: Number(povertyRate.toFixed(1)),
          seniorRate: Number(over65Rate.toFixed(1)),
          treeCanopyCover: Number(Math.max(baseTract.demographics.treeCanopyCover || 5, 5).toFixed(1))
        }
      };
    });
  }, [liveRiskRows]);

  useEffect(() => {
    let isMounted = true;

    fetchChicagoWeather().then((nextWeather) => {
      if (isMounted) setWeather(nextWeather);
    }).catch(() => {
      if (isMounted) setWeather(CHICAGO_WEATHER_FALLBACK);
    });

    fetch('http://127.0.0.1:8000/api/chicago/risk')
      .then((response) => response.ok ? response.json() : null)
      .then((payload) => {
        if (!isMounted || !payload || !Array.isArray(payload.rows)) return;
        setLiveRiskRows(payload.rows.slice(0, 10));
      })
      .catch(() => {
        if (isMounted) setLiveRiskRows([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Node Click: Highlight and feed coordinates into Agent Chat
  const handleSelectTract = (tract) => {
    setSelectedTract(tract);
    if (!tract) return;

    const tractLat = Number.isFinite(tract.lat) ? tract.lat : 41.8781;
    const tractLon = Number.isFinite(tract.lng) ? tract.lng : -87.6298;
    const sviValue = typeof tract.cdcSviRplThemes === 'number' ? tract.cdcSviRplThemes.toFixed(2) : 'N/A';
    const normalizedRisk = typeof tract.normalizedHeatHazard === 'number' ? tract.normalizedHeatHazard.toFixed(2) : 'N/A';
    const priorityScore = typeof tract.combinedPriorityScore === 'number' ? tract.combinedPriorityScore.toFixed(2) : 'N/A';
    const promptText = `Inspecting Tract ${tract.tractNumber} (${tract.name}). Lat/Lng: ${tractLat.toFixed(4)}° N, ${tractLon.toFixed(4)}° W. CDC SVI RPL_THEMES = ${sviValue} (higher = more vulnerable); normalized heat hazard = ${normalizedRisk}; combined priority score = ${priorityScore}. Current surface temp is ${tract.surfaceTemp}°F (+${(tract.heatOffset + simulatedHeatBoost).toFixed(1)}°F offset) under current Chicago conditions (${weather.summary}, ${weather.tempF}°F). What are the top interventions?`;

    const userMsg = {
      id: `user-tract-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: promptText,
      structuredData: null
    };

    requestAgentResponse({ query: promptText, selectedTract: tract, liveRiskRows })
      .then((agentPayload) => {
        const response = agentPayload || getAgentResponse(promptText, tract, liveRiskRows);
        const agentMsg = {
          id: `agent-tract-${Date.now()}`,
          sender: 'agent',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: response.content,
          structuredType: response.structuredType,
          cards: response.cards,
          equityMetrics: response.equityMetrics,
          tract: response.tract
        };
        setChatMessages(prev => [...prev, userMsg, agentMsg]);
      })
      .catch(() => {
        const response = getAgentResponse(promptText, tract, liveRiskRows);
        const agentMsg = {
          id: `agent-tract-${Date.now()}`,
          sender: 'agent',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: response.content,
          structuredType: response.structuredType,
          cards: response.cards,
          equityMetrics: response.equityMetrics,
          tract: response.tract
        };
        setChatMessages(prev => [...prev, userMsg, agentMsg]);
      });

    setActiveWorkspaceTab('chat');
    showToast(`📍 Selected ${tract.name} - Spatial coordinates fed to AI Planner.`);
  };

  const handleSelectTractById = (tractId) => {
    const found = displayedTracts.find(t => t.id === tractId);
    if (found) {
      handleSelectTract(found);
      setCurrentView('dashboard');
    }
  };

  // Dismiss an alert
  const handleDismissAlert = (alertId) => {
    const alertToDismiss = alerts.find(a => a.id === alertId);
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    if (alertToDismiss) {
      showToast(`Alert for ${alertToDismiss.tractName} dismissed.`);
    }
  };

  // Open deploy modal from map or card
  const handleDeployTruck = (tract) => {
    setDeployModalTarget({ alert: null, tract });
    setIsDeployModalOpen(true);
  };

  // Open deploy modal from alert
  const handleDeployTruckFromAlert = (alert) => {
    setDeployModalTarget({ alert, tract: null });
    setIsDeployModalOpen(true);
  };

  // Confirm dispatch from modal
  const handleConfirmDispatch = (newAuditEntry, alertIdToDismiss) => {
    setAuditLog(prev => [newAuditEntry, ...prev]);
    if (alertIdToDismiss) {
      setAlerts(prev => prev.filter(a => a.id !== alertIdToDismiss));
    }
    showToast(`🚛 Emergency Dispatch Confirmed: ${newAuditEntry.action} deployed to ${newAuditEntry.location}!`);
    setActiveWorkspaceTab('alerts');
  };

  // Add card to Kanban board
  const handleAddToKanban = (cardOrTract) => {
    // If it's a tract object
    const newCard = cardOrTract.columnId ? cardOrTract : {
      id: `kb-added-${Date.now()}`,
      columnId: 'proposed',
      title: `${cardOrTract.name} Cooling Shelter`,
      tractId: cardOrTract.id,
      tractName: cardOrTract.name,
      category: "Resilience Hub",
      bqmlRiskScore: cardOrTract.bqmlRiskScore || 9.0,
      heatOffset: `+${cardOrTract.heatOffset || 8.5}°F`,
      demographics: {
        medianAge: cardOrTract.demographics?.medianAge || 38,
        noVehicleRate: `${cardOrTract.demographics?.noVehicleRate || 35}%`,
        povertyRate: `${cardOrTract.demographics?.povertyRate || 32}%`,
        treeCanopy: `${cardOrTract.demographics?.treeCanopyCover || 8}%`
      },
      estimatedCost: "$650,000",
      fundingSource: "Capital Improvement Program (CIP)",
      equityScore: 96,
      projectedTempReduction: "-6.2°F localized relief",
      tags: ["AI Recommendation", "Resilience Hub"],
      recommendedBy: "SHADE - Smart Heat Alert & Dispatch Engine"
    };

    setKanbanCards(prev => [newCard, ...prev]);
    showToast(`📋 Added "${newCard.title}" to Strategic Planning Kanban!`);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans">
      
      {/* 1. TOP NAVIGATION BAR */}
      <Navbar
        currentCity={currentCity}
        setCurrentCity={setCurrentCity}
        currentTrack={currentTrack}
        setCurrentTrack={setCurrentTrack}
        currentView={currentView}
        setCurrentView={setCurrentView}
        activeAlertCount={alerts.length}
      />

      {/* METRICS & SITUATIONAL AWARENESS RIBBON */}
      <MetricsRibbon
        currentCity={currentCity}
        alertCount={alerts.length}
        simulatedHeatBoost={simulatedHeatBoost}
        setSimulatedHeatBoost={setSimulatedHeatBoost}
        weather={weather}
        liveRiskRows={liveRiskRows}
        onOpenAlerts={() => {
          setCurrentView('dashboard');
          setActiveWorkspaceTab('alerts');
        }}
      />

      {/* Track Description Banner (Dynamic context for emergency vs budget vs decade) */}
      <div className="bg-slate-950/40 border-b border-slate-800/60 px-4 lg:px-6 py-1.5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <span className="text-orange-400 font-bold uppercase">
            Active Track:
          </span>
          <span className="text-slate-200">
            {currentTrack === 'today' && "⚡ Today's Emergency — Real-time high-risk dispatch, mobile hydration units, and cooling shelter saturation."}
            {currentTrack === 'budget' && "🏛️ Budget Cycle — FY2027 Capital Improvement Program (CIP), cool pavement bids, and bus canopy funding."}
            {currentTrack === 'decade' && "🌳 Decade Strategy — 2035 Climate Action Plan, 30% urban canopy target, and long-term heat equity."}
          </span>
        </div>
        <div className="hidden lg:flex items-center gap-3">
          <span>BigQuery ML Model: <b>UHI_Landsat_ACS_v4</b></span>
          <span className="text-emerald-400">Confidence: 96.8%</span>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-3 lg:p-5 flex flex-col">
        {currentView === 'dashboard' ? (
          /* 2. MAIN DASHBOARD CONTENT (Two-Column Layout: Left 60%, Right 40%) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 flex-1 items-start">
            
            {/* LEFT COLUMN: Map & Spatial Intelligence (60% width = 7/12 cols on desktop) */}
            <div className="lg:col-span-7 flex flex-col gap-3">
              
              {/* Map GIS Layer Controls */}
              <MapControls
                showCoolingCenters={showCoolingCenters}
                setShowCoolingCenters={setShowCoolingCenters}
                showVulnerableTracts={showVulnerableTracts}
                setShowVulnerableTracts={setShowVulnerableTracts}
                showHistoricalHotspots={showHistoricalHotspots}
                setShowHistoricalHotspots={setShowHistoricalHotspots}
                showCanopyDeficit={showCanopyDeficit}
                setShowCanopyDeficit={setShowCanopyDeficit}
                heatThreshold={heatThreshold}
                setHeatThreshold={setHeatThreshold}
                basemapStyle={basemapStyle}
                setBasemapStyle={setBasemapStyle}
              />

              {/* Interactive Mock Map Component */}
              <HeatMap
                currentCity={currentCity}
                tracts={displayedTracts}
                selectedTract={selectedTract}
                onSelectTract={handleSelectTract}
                showCoolingCenters={showCoolingCenters}
                showVulnerableTracts={showVulnerableTracts}
                showHistoricalHotspots={showHistoricalHotspots}
                showCanopyDeficit={showCanopyDeficit}
                heatThreshold={heatThreshold}
                basemapStyle={basemapStyle}
                onDeployTruck={handleDeployTruck}
                onAddToKanban={handleAddToKanban}
                simulatedHeatBoost={simulatedHeatBoost}
              />

            </div>

            {/* RIGHT COLUMN: Agent Workspace (40% width = 5/12 cols on desktop) */}
            <div className="lg:col-span-5 flex flex-col">
              <AgentWorkspace
                activeTab={activeWorkspaceTab}
                setActiveTab={setActiveWorkspaceTab}
                chatMessages={chatMessages}
                setChatMessages={setChatMessages}
                alerts={alerts}
                onDismissAlert={handleDismissAlert}
                onDeployTruck={handleDeployTruck}
                onDeployTruckFromAlert={handleDeployTruckFromAlert}
                auditLog={auditLog}
                selectedTract={selectedTract}
                onSelectTractById={handleSelectTractById}
                onAddToKanban={handleAddToKanban}
              />
            </div>

          </div>
        ) : (
          /* 3. SECONDARY VIEW: Strategic Planning Kanban Board */
          <KanbanBoard
            cards={kanbanCards}
            setCards={setKanbanCards}
            onSwitchToMap={() => setCurrentView('dashboard')}
            onSelectTractById={handleSelectTractById}
          />
        )}
      </main>

      {/* Emergency Truck Dispatch Modal */}
      <DeployTruckModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
        targetAlert={deployModalTarget.alert}
        targetTract={deployModalTarget.tract}
        onConfirmDispatch={handleConfirmDispatch}
      />

      {/* Floating Action Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 bg-slate-900 border border-orange-500/50 text-slate-100 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-5 duration-300">
          <Sparkles className="w-4 h-4 text-orange-400 flex-shrink-0 animate-spin" />
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 px-4 lg:px-6 py-2.5 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span>SHADE | Smart Heat Alert &amp; Dispatch Engine &copy; 2026</span>
          <span>•</span>
          <span>City of Chicago Office of Climate Resilience & Emergency Operations</span>
        </div>
        <div className="flex items-center gap-4 font-mono text-[11px]">
          <span>BigQuery ML Spatial API</span>
          <span>Landsat-9 Surface Temp</span>
          <span>Justice40 Audited</span>
        </div>
      </footer>

    </div>
  );
}
