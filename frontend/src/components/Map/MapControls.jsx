import React from 'react';
import { 
  Building2, 
  Users, 
  Flame, 
  TreePine, 
  Sliders, 
  Layers, 
  Eye, 
  EyeOff,
  Filter
} from 'lucide-react';

export default function MapControls({
  showCoolingCenters,
  setShowCoolingCenters,
  showVulnerableTracts,
  setShowVulnerableTracts,
  showHistoricalHotspots,
  setShowHistoricalHotspots,
  showCanopyDeficit,
  setShowCanopyDeficit,
  heatThreshold,
  setHeatThreshold,
  basemapStyle,
  setBasemapStyle
}) {
  return (
    <div className="flex flex-col gap-2 p-3 bg-slate-900/90 rounded-xl border border-slate-800/90 shadow-xl backdrop-blur-md">
      
      {/* Top row: Overlays heading & Basemap selector */}
      <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-800">
        <div className="flex items-center gap-1.5 font-semibold text-slate-200">
          <Layers className="w-3.5 h-3.5 text-orange-400" />
          <span>GIS Layers & Overlays</span>
        </div>
        <div className="flex items-center gap-1 text-[11px]">
          <span className="text-slate-400">Map Mode:</span>
          <select 
            value={basemapStyle}
            onChange={(e) => setBasemapStyle(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-300 rounded px-1.5 py-0.5 text-[11px] focus:outline-none"
          >
            <option value="streets">Light Streets</option>
            <option value="dark">Civic Dark</option>
            <option value="radar">Thermal Radar</option>
          </select>
        </div>
      </div>

      {/* Overlay Toggles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
        
        {/* Toggle: Cooling Centers */}
        <button
          onClick={() => setShowCoolingCenters(!showCoolingCenters)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all text-left border ${
            showCoolingCenters
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm shadow-cyan-950/40'
              : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Building2 className={`w-3.5 h-3.5 ${showCoolingCenters ? 'text-cyan-400' : 'text-slate-500'}`} />
          <span className="truncate">Cooling Centers</span>
        </button>

        {/* Toggle: Vulnerable Tracts */}
        <button
          onClick={() => setShowVulnerableTracts(!showVulnerableTracts)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all text-left border ${
            showVulnerableTracts
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm shadow-purple-950/40'
              : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Users className={`w-3.5 h-3.5 ${showVulnerableTracts ? 'text-purple-400' : 'text-slate-500'}`} />
          <span className="truncate">Vulnerable Tracts</span>
        </button>

        {/* Toggle: Historical Hotspots */}
        <button
          onClick={() => setShowHistoricalHotspots(!showHistoricalHotspots)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all text-left border ${
            showHistoricalHotspots
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm shadow-rose-950/40'
              : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Flame className={`w-3.5 h-3.5 ${showHistoricalHotspots ? 'text-rose-400' : 'text-slate-500'}`} />
          <span className="truncate">Hotspots (911)</span>
        </button>

        {/* Toggle: Tree Canopy Deficit */}
        <button
          onClick={() => setShowCanopyDeficit(!showCanopyDeficit)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all text-left border ${
            showCanopyDeficit
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-950/40'
              : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <TreePine className={`w-3.5 h-3.5 ${showCanopyDeficit ? 'text-emerald-400' : 'text-slate-500'}`} />
          <span className="truncate">Canopy Deficit</span>
        </button>
      </div>

      {/* Heat Offset Filter Threshold Slider */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1 border-t border-slate-800/70 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
          <Filter className="w-3 h-3 text-orange-400" />
          <span>Filter Heat Offset:</span>
          <span className="font-bold text-orange-300 font-mono">≥ +{heatThreshold.toFixed(1)}°F</span>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="range"
            min="4.0"
            max="10.0"
            step="0.5"
            value={heatThreshold}
            onChange={(e) => setHeatThreshold(parseFloat(e.target.value))}
            className="w-full sm:w-36 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
          />
          <button 
            onClick={() => setHeatThreshold(4.0)}
            className="text-[10px] text-slate-400 hover:text-slate-200 underline"
          >
            Reset
          </button>
        </div>
      </div>

    </div>
  );
}
