import React from 'react';
import { 
  Thermometer, 
  Users, 
  Building2, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  Sparkles,
  RefreshCw
} from 'lucide-react';

export default function MetricsRibbon({
  currentCity,
  liveMetrics = {},
  alertCount,
  simulatedHeatBoost,
  setSimulatedHeatBoost,
  onOpenAlerts
}) {
  // Live values (lib/liveMetrics) where the data has them; the city presets otherwise.
  const hasLiveHeat = liveMetrics.temp != null;
  const hasLivePop = liveMetrics.populationAtRisk != null;
  const effectiveTemp = Math.round((hasLiveHeat ? liveMetrics.temp : currentCity.ambientTemp) + simulatedHeatBoost);
  const baseIndex = liveMetrics.heatIndex ?? (hasLiveHeat ? null : currentCity.heatIndex);
  const effectiveIndex = baseIndex == null ? 'n/a' : `${Math.round(baseIndex + simulatedHeatBoost)}°F`;
  const advisory = hasLiveHeat ? liveMetrics.advisory : currentCity.heatAdvisoryLevel;
  const peakTime = hasLiveHeat ? (liveMetrics.peakTime ?? 'n/a') : currentCity.peakHour;
  const populationAtRisk = hasLivePop ? liveMetrics.populationAtRisk : currentCity.populationAtRisk;

  return (
    <div className="bg-slate-900/70 border-b border-slate-800/80 px-4 lg:px-6 py-2">
      <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-4 text-xs">
        
        {/* Left Metrics Group */}
        <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-2">
          
          {/* Temperature & Heat Index */}
          <div
            className="flex items-center gap-2"
            title={hasLiveHeat ? `Average afternoon air temperature and peak heat index across ${liveMetrics.observationCount?.toLocaleString()} Heat Watch observations (${liveMetrics.city})` : undefined}
          >
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-400">
              <Thermometer className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-semibold text-slate-100">
                <span className="text-sm font-mono text-orange-400">{effectiveTemp}°F</span>
                <span className="text-slate-500">|</span>
                <span className="text-slate-300">{hasLiveHeat ? 'Peak Heat Index:' : 'Heat Index:'}</span>
                <span className="font-mono text-rose-400 font-bold">{effectiveIndex}</span>
              </div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                {advisory}
              </p>
            </div>
          </div>

          {/* Peak Window */}
          <div className="hidden sm:flex items-center gap-2 border-l border-slate-800 pl-4">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-200">{peakTime}</p>
              <p className="text-[10px] text-slate-400">{hasLiveHeat ? 'Hottest Observation' : 'Peak Thermal Anomaly'}</p>
            </div>
          </div>

          {/* Population at Risk */}
          <div
            className="flex items-center gap-2 border-l border-slate-800 pl-4"
            title={hasLivePop ? `Residents of the ${liveMetrics.atRiskTractCount} most socially vulnerable tracts (top 20% of ${liveMetrics.tractCount})` : undefined}
          >
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-rose-500/15 text-rose-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-100 font-mono">
                {populationAtRisk.toLocaleString()}
              </p>
              <p className="text-[10px] text-slate-400">
                {hasLivePop ? `High-Vulnerability Pop · ${liveMetrics.atRiskTractCount} tracts` : 'High-Vulnerability Pop'}
              </p>
            </div>
          </div>

          {/* Cooling Centers Active */}
          <div className="hidden md:flex items-center gap-2 border-l border-slate-800 pl-4">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-cyan-500/15 text-cyan-400">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1 font-semibold text-slate-200">
                <span className="font-mono text-cyan-300">{currentCity.activeCoolingCenters}</span>
                <span className="text-slate-500">/</span>
                <span className="font-mono text-slate-400">{currentCity.totalCoolingCenters}</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1 rounded ml-1 border border-emerald-500/30">
                  Online
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Municipal Cooling Shelters</p>
            </div>
          </div>

          {/* Active Alerts Trigger Button */}
          <button
            onClick={onOpenAlerts}
            className="flex items-center gap-2 border-l border-slate-800 pl-4 group hover:opacity-90 transition-all text-left"
          >
            <div className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              {alertCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 text-[8px] text-white font-bold items-center justify-center">
                    {alertCount}
                  </span>
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-red-400">{alertCount} Active Alerts</span>
                <span className="text-[10px] text-slate-400 group-hover:text-slate-200 transition-colors underline">
                  View &rarr;
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Operations Command</p>
            </div>
          </button>
        </div>

        {/* Right: Heat Wave Simulation Boost Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSimulatedHeatBoost(prev => (prev === 0 ? 3 : 0))}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
              simulatedHeatBoost > 0
                ? 'bg-red-500/20 text-red-300 border-red-500/40 shadow-sm shadow-red-950'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700/80'
            }`}
            title="Simulate +3°F Extreme Heat Spike"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {simulatedHeatBoost > 0 ? "🔥 Peak Spike Active (+3°F)" : "Simulate +3°F Surge"}
            </span>
            {simulatedHeatBoost > 0 && (
              <RefreshCw className="w-3 h-3 text-red-400 ml-1" />
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
