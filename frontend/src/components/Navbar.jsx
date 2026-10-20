import React from 'react';
import { 
  Flame, 
  Activity, 
  MapPin, 
  Calendar, 
  TreePine, 
  Zap, 
  Building, 
  LayoutGrid, 
  Map as MapIcon,
  ChevronDown,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { CITIES } from '../data/cityData';

export default function Navbar({ 
  currentCity, 
  setCurrentCity, 
  currentTrack, 
  setCurrentTrack, 
  currentView, 
  setCurrentView,
  activeAlertCount
}) {
  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 bg-[#0b0f19]/90 px-4 lg:px-6 py-2.5 transition-all">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Left: App Title & Live Agent Status */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 via-orange-500 to-rose-600 shadow-lg shadow-orange-500/20 text-white font-bold">
              <Flame className="w-5 h-5 text-white animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-[#0b0f19]"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="flex items-baseline gap-2 text-white leading-none">
                  <span className="text-base sm:text-lg font-extrabold tracking-[0.2em]">SHADE</span>
                  <span className="hidden sm:inline text-slate-600" aria-hidden="true">│</span>
                  <span className="hidden sm:inline text-xs font-medium text-slate-300 tracking-tight">
                    Smart Heat Alert &amp; Dispatch Engine
                  </span>
                </h1>
                <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 hidden sm:inline-block">
                  AI Copilot
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Agent Active
                </span>
                <span className="text-xs text-slate-400 hidden lg:inline font-mono">
                  Gemini 2.5 Flash
                </span>
              </div>
            </div>
          </div>

          {/* Mobile view toggle */}
          <div className="flex md:hidden items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`p-1.5 rounded ${currentView === 'dashboard' ? 'bg-orange-500 text-white' : 'text-slate-400'}`}
              title="Map & Chat"
            >
              <MapIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentView('kanban')}
              className={`p-1.5 rounded ${currentView === 'kanban' ? 'bg-orange-500 text-white' : 'text-slate-400'}`}
              title="Kanban Board"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center: Track Selector Toggle */}
        <div className="flex items-center justify-center w-full md:w-auto">
          <div className="inline-flex p-1 bg-slate-900/90 rounded-xl border border-slate-800 shadow-inner max-w-full overflow-x-auto">
            <button
              id="track-today"
              onClick={() => setCurrentTrack('today')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                currentTrack === 'today'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md shadow-orange-950/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>⚡ Today's Emergency</span>
            </button>

            <button
              id="track-budget"
              onClick={() => setCurrentTrack('budget')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                currentTrack === 'budget'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-950/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Building className="w-3.5 h-3.5 text-purple-300" />
              <span>🏛️ Budget Cycle</span>
            </button>

            <button
              id="track-decade"
              onClick={() => setCurrentTrack('decade')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                currentTrack === 'decade'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <TreePine className="w-3.5 h-3.5 text-emerald-300" />
              <span>🌳 Decade Strategy</span>
            </button>
          </div>
        </div>

        {/* Right: City Selector & View Switcher */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          {/* City Selector */}
          <div className="relative">
            <select
              id="city-selector"
              value={currentCity.id}
              onChange={(e) => {
                const selected = CITIES.find(c => c.id === e.target.value);
                if (selected) setCurrentCity(selected);
              }}
              className="appearance-none bg-slate-900 border border-slate-700/80 hover:border-slate-600 text-slate-200 text-xs font-medium rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500/50 cursor-pointer shadow-sm"
            >
              {CITIES.map((city) => (
                <option key={city.id} value={city.id} className="bg-slate-900 text-slate-200">
                  {city.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* View Switcher Toggle (Desktop) */}
          <div className="hidden md:flex items-center p-1 bg-slate-900 rounded-lg border border-slate-800">
            <button
              id="view-toggle-dashboard"
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                currentView === 'dashboard'
                  ? 'bg-orange-500 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map & Chat</span>
            </button>

            <button
              id="view-toggle-kanban"
              onClick={() => setCurrentView('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                currentView === 'kanban'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kanban Board</span>
            </button>
          </div>
        </div>

      </div>
    </header>
  );
}
