import React, { useState } from 'react';
import Navbar from './components/Navbar';
import MetricsRibbon from './components/MetricsRibbon';
import HeatMap from './components/Map/HeatMap';
import MapControls from './components/Map/MapControls';
import AgentWorkspace from './components/AgentWorkspace/AgentWorkspace';
import KanbanBoard from './components/Kanban/KanbanBoard';
import DeployTruckModal from './components/Modals/DeployTruckModal';

import { CITIES, DALLAS_TRACTS, svgToLatLng } from './data/cityData';
import { INITIAL_ALERTS, INITIAL_AUDIT_LOG } from './data/initialAlerts';
import { INITIAL_KANBAN_CARDS } from './data/initialKanban';
import { INITIAL_CHAT_MESSAGES, getAgentResponse } from './data/aiKnowledge';
import { CheckCircle2, Bell, Sparkles } from 'lucide-react';

export default function App() {
  // Navigation & Track States
  const [currentCity, setCurrentCity] = useState(CITIES[0]); // Dallas - Summer Campaign
  const [currentTrack, setCurrentTrack] = useState('today'); // 'today' | 'budget' | 'decade'
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'kanban'

  // Spatial Map States
  const [selectedTract, setSelectedTract] = useState(null);
  const [showCoolingCenters, setShowCoolingCenters] = useState(true);
  const [showVulnerableTracts, setShowVulnerableTracts] = useState(true);
  const [showHistoricalHotspots, setShowHistoricalHotspots] = useState(true);
  const [showCanopyDeficit, setShowCanopyDeficit] = useState(false);
  const [showVulnerabilitySurface, setShowVulnerabilitySurface] = useState(true);
  const [heatThreshold, setHeatThreshold] = useState(4.0);
  const [basemapStyle, setBasemapStyle] = useState('dark');
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

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Node Click: Highlight and feed coordinates into Agent Chat
  const handleSelectTract = (tract) => {
    setSelectedTract(tract);
    if (!tract) return;

    // Build automated telemetry query for the AI Planner Chat
    const { lat, lng } = svgToLatLng(tract.coordinates);
    const promptText = `Inspecting Tract ${tract.tractNumber} (${tract.name}). Lat/Lng: ${lat.toFixed(4)}° N, ${Math.abs(lng).toFixed(4)}° W. Current surface temp is ${tract.surfaceTemp}°F (+${(tract.heatOffset + simulatedHeatBoost).toFixed(1)}°F offset). What are the top interventions?`;

    // Add user question to chat
    const userMsg = {
      id: `user-tract-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: promptText,
      structuredData: null
    };

    // Generate response using BQML engine
    const response = getAgentResponse(promptText, tract);
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
    setActiveWorkspaceTab('chat');
    showToast(`📍 Selected ${tract.name} - Spatial coordinates fed to AI Planner.`);
  };

  const handleSelectTractById = (tractId) => {
    const found = DALLAS_TRACTS.find(t => t.id === tractId);
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
      recommendedBy: "SHADE - Copilot Recommendation"
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
                showVulnerabilitySurface={showVulnerabilitySurface}
                setShowVulnerabilitySurface={setShowVulnerabilitySurface}
                heatThreshold={heatThreshold}
                setHeatThreshold={setHeatThreshold}
                basemapStyle={basemapStyle}
                setBasemapStyle={setBasemapStyle}
              />

              {/* Interactive Mock Map Component */}
              <HeatMap
                currentCity={currentCity}
                selectedTract={selectedTract}
                onSelectTract={handleSelectTract}
                showCoolingCenters={showCoolingCenters}
                showVulnerableTracts={showVulnerableTracts}
                showHistoricalHotspots={showHistoricalHotspots}
                showCanopyDeficit={showCanopyDeficit}
                showVulnerabilitySurface={showVulnerabilitySurface}
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
          <span>SHADE · Smart Heat Alert &amp; Dispatch Engine &copy; 2026</span>
          <span>•</span>
          <span>City of Dallas Office of Resilience & Emergency Operations</span>
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
