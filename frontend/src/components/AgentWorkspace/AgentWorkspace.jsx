import React from 'react';
import { 
  Bot, 
  MessageSquare, 
  AlertTriangle, 
  Sparkles,
  ShieldCheck,
  Maximize2
} from 'lucide-react';
import ChatTab from './ChatTab';
import AlertsTab from './AlertsTab';

export default function AgentWorkspace({
  activeTab,
  setActiveTab,
  chatMessages,
  setChatMessages,
  alerts,
  onDismissAlert,
  onDeployTruck,
  onDeployTruckFromAlert,
  auditLog,
  selectedTract,
  onSelectTractById,
  onAddToKanban
}) {
  return (
    <div className="flex flex-col h-[580px] lg:h-auto lg:absolute lg:inset-0 bg-[#0b0f19] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      
      {/* Workspace Header with Tabs */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-950/80 border-b border-slate-800">
        
        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
          <button
            id="tab-chat"
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'chat'
                ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md shadow-orange-950/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Planner Chat</span>
          </button>

          <button
            id="tab-alerts"
            onClick={() => setActiveTab('alerts')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
              activeTab === 'alerts'
                ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-rose-950/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-300" />
            <span>Active Alerts & History</span>
            {alerts.length > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-mono font-bold">
                {alerts.length}
              </span>
            )}
          </button>
        </div>

        {/* Right Status Pill */}
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Gemini 2.5 Flash</span>
        </div>

      </div>

      {/* Workspace Body */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'chat' ? (
          <ChatTab
            chatMessages={chatMessages}
            setChatMessages={setChatMessages}
            onSelectTractById={onSelectTractById}
            onDeployTruck={onDeployTruck}
            onAddToKanban={onAddToKanban}
            selectedTract={selectedTract}
          />
        ) : (
          <AlertsTab
            alerts={alerts}
            onDismissAlert={onDismissAlert}
            onDeployTruckFromAlert={onDeployTruckFromAlert}
            auditLog={auditLog}
            onSelectTractById={onSelectTractById}
          />
        )}
      </div>

    </div>
  );
}
