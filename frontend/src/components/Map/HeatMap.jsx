import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  COOLING_CENTERS,
  HISTORICAL_HOTSPOTS,
  MAP_VIEWBOX
} from '../../data/cityData';
import useGoogleMapOverlay from './useGoogleMapOverlay';
import useVulnerabilitySurface, { RPL_GRADIENT_CSS, scoreColor } from './useVulnerabilitySurface';
import useTractMarkers from './useTractMarkers';
import { fmtOffset, fmtPct, fmtTemp, isVulnerableTract } from '../../lib/tractAdapter';
import { 
  Building2, 
  Flame, 
  Users, 
  Sparkles, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Navigation,
  Info,
  CheckCircle,
  Truck,
  ExternalLink,
  PlusCircle,
  ArrowRight
} from 'lucide-react';

export default function HeatMap({
  currentCity,
  tracts,
  tractSource,
  selectedTract,
  onSelectTract,
  showCoolingCenters,
  showVulnerableTracts,
  showHistoricalHotspots,
  showVulnerabilitySurface,
  basemapStyle,
  onDeployTruck,
  onAddToKanban
}) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [hoveredTract, setHoveredTract] = useState(null);
  const [hoveredCenter, setHoveredCenter] = useState(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0, width: 800 });
  const mapDivRef = useRef(null);
  const pointerDownRef = useRef(null);

  // Real Google basemap with the SVG layer georeferenced on top; falls back to
  // the schematic SVG when no API key is configured or the API fails to load.
  const { map, overlayEl, scale, status: mapStatus, fitToBounds } = useGoogleMapOverlay(mapDivRef, basemapStyle);
  const geoMode = Boolean(overlayEl) && mapStatus === 'ready';

  // Smooth social_vulnerability_score surface from the live tracts; needs real coordinates, so geo mode only.
  // Its bounds and score range also frame the map and colour the tract dots.
  const { bounds: dataBounds, range: scoreRange } = useVulnerabilitySurface(map, showVulnerabilitySurface, tracts);

  // Frame the live tracts once they load (the schematic grid's bounds until then).
  const fitToData = () => {
    if (dataBounds) map.fitBounds(dataBounds, 40);
    else fitToBounds();
  };
  useEffect(() => {
    if (geoMode) fitToData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geoMode, dataBounds]);

  // Live tracts as clickable dots on the Google map.
  useTractMarkers(geoMode ? map : null, tracts, {
    range: scoreRange,
    selectedId: selectedTract?.id,
    hoveredId: hoveredTract?.id,
    highlightVulnerable: showVulnerableTracts,
    onSelect: onSelectTract,
    onHover: setHoveredTract,
  });

  // Without a basemap, lay the same dots out on the schematic SVG (equirectangular, aspect kept).
  const projectToSchematic = useMemo(() => {
    if (!tracts?.length) return null;
    const lats = tracts.map(t => t.lat);
    const lngs = tracts.map(t => t.lng);
    const north = Math.max(...lats), south = Math.min(...lats);
    const west = Math.min(...lngs), east = Math.max(...lngs);
    const kx = Math.cos(((north + south) / 2) * Math.PI / 180);
    const pad = 30;
    const s = Math.min(
      (MAP_VIEWBOX.width - 2 * pad) / ((east - west) * kx || 1),
      (MAP_VIEWBOX.height - 2 * pad) / ((north - south) || 1)
    );
    const ox = (MAP_VIEWBOX.width - (east - west) * kx * s) / 2;
    const oy = (MAP_VIEWBOX.height - (north - south) * s) / 2;
    return t => ({ x: ox + (t.lng - west) * kx * s, y: oy + (north - t.lat) * s });
  }, [tracts]);

  // Cooling centers and hotspots: their georeferenced spot in geo mode, the tracts' projection on the schematic.
  const pinPosition = (item) => (!geoMode && projectToSchematic ? projectToSchematic(item) : item.coordinates);

  // In geo mode the SVG stretches with the map; this keeps badges and pins at a constant screen size.
  const counterScale = geoMode ? ` scale(${1 / scale.x} ${1 / scale.y})` : '';

  // Ignore the click that ends a map drag.
  const isDragRelease = (e) => {
    const start = pointerDownRef.current;
    return Boolean(start) && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 5;
  };

  const handleCanvasMouseMove = (e) => {
    if (!hoveredTract && !hoveredCenter) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverPos({ x: e.clientX - rect.left, y: e.clientY - rect.top, width: rect.width });
  };

  const tooltipStyle = {
    left: `${Math.max(Math.min(hoverPos.x + 16, hoverPos.width - 300), 8)}px`,
    top: `${Math.max(hoverPos.y + 16, 40)}px`
  };

  const handleZoom = (delta) => {
    if (geoMode) {
      map.setZoom(map.getZoom() + Math.sign(delta));
      return;
    }
    setZoomLevel(prev => Math.min(Math.max(prev + delta, 0.8), 2.2));
  };

  const resetView = () => {
    if (geoMode) {
      fitToData();
      return;
    }
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  return (
    <div className="relative w-full h-[580px] lg:h-[640px] bg-[#070b13] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col select-none">
      
      {/* Top Map Status Banner */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 rounded-xl shadow-lg backdrop-blur-md">
        <div className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping-slow"></div>
        <span className="text-xs font-semibold text-slate-200">
          {currentCity.name}
        </span>
        <span className="text-slate-500 text-xs">|</span>
        <span className="text-[11px] font-mono text-orange-400">
          BQML Satellite Surface Grid
        </span>
        {mapStatus === 'error' && (
          <span className="text-[10px] text-amber-400" title="Check VITE_GOOGLE_MAPS_API_KEY and the browser console">
            (Google Maps unavailable — schematic view)
          </span>
        )}
      </div>

      {/* Map Zoom Controls */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5 bg-slate-900/90 border border-slate-700/80 p-1 rounded-xl shadow-lg backdrop-blur-md">
        <button
          onClick={() => handleZoom(0.2)}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoom(-0.2)}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={resetView}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Reset Zoom"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Interactive SVG Map Canvas */}
      <div
        className={`relative flex-1 w-full h-full overflow-hidden ${geoMode ? '' : 'cursor-crosshair'}`}
        onMouseMove={handleCanvasMouseMove}
        onPointerDownCapture={(e) => { pointerDownRef.current = { x: e.clientX, y: e.clientY }; }}
      >
        {/* Google basemap (sits under the schematic SVG until it is ready) */}
        <div ref={mapDivRef} className="absolute inset-0" />

        {(svg => (geoMode ? createPortal(svg, overlayEl) : svg))(
        <svg
          viewBox="0 0 800 580"
          preserveAspectRatio={geoMode ? 'none' : undefined}
          className={geoMode ? 'absolute inset-0 w-full h-full' : 'relative w-full h-full transition-transform duration-300'}
          style={geoMode ? { overflow: 'visible', pointerEvents: 'none' } : {
            transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
            transformOrigin: 'center center'
          }}
        >
          <defs>
            {/* Background Grid Pattern */}
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2,2" />
            </pattern>

            {/* Radar Scan Gradient */}
            <radialGradient id="radarScan" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.15" />
              <stop offset="60%" stopColor="#ea580c" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#0b0f19" stopOpacity="0" />
            </radialGradient>

            {/* Vulnerability Striped Pattern */}
            <pattern id="vulnerableHatch" width="8" height="8" patternTransform={`${counterScale} rotate(45 0 0)`} patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#a855f7" strokeWidth="2" strokeOpacity="0.45" />
            </pattern>

            {/* Tree Canopy Striped Pattern */}
            <pattern id="canopyDeficitHatch" width="6" height="6" patternTransform={`${counterScale} rotate(135 0 0)`} patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="6" stroke="#10b981" strokeWidth="1.5" strokeOpacity="0.3" />
            </pattern>

            {/* Glow Filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Schematic background (replaced by the Google basemap in geo mode) */}
          {!geoMode && (<>
          {/* Background Map Layer */}
          <rect width="800" height="580" fill={basemapStyle === 'satellite' ? '#060a12' : '#0a0e17'} />
          <rect width="800" height="580" fill="url(#grid)" />

          {/* Chicago River & Green Belt Mockup */}
          <g opacity="0.35">
            <path
              d="M 160 520 C 230 420 280 340 320 280 C 370 200 390 120 400 30"
              fill="none"
              stroke="#0284c7"
              strokeWidth="14"
              strokeLinecap="round"
              filter="blur(3px)"
            />
            <path
              d="M 160 520 C 230 420 280 340 320 280 C 370 200 390 120 400 30"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <text x="270" y="320" fill="#38bdf8" fontSize="10" fontFamily="monospace" opacity="0.7" transform="rotate(-55 270 320)">
              Chicago River Corridor
            </text>
          </g>

          {/* Highway Corridors (I-90, I-94, Dan Ryan) */}
          <g opacity="0.25" stroke="#64748b" strokeWidth="2.5" fill="none">
            {/* I-90 East-West */}
            <path d="M 50 310 Q 380 290 750 310" strokeDasharray="6,4" />
            <text x="710" y="300" fill="#94a3b8" fontSize="9" fontFamily="monospace">I-90</text>

            {/* I-94 North-South */}
            <path d="M 390 50 L 370 540" strokeDasharray="6,4" />
            <text x="375" y="70" fill="#94a3b8" fontSize="9" fontFamily="monospace">I-94</text>

            {/* Dan Ryan */}
            <path d="M 100 480 Q 20 250 140 100 Q 400 40 700 120 Q 770 350 680 500" strokeWidth="1.5" strokeDasharray="4,4" />
            <text x="140" y="90" fill="#94a3b8" fontSize="9" fontFamily="monospace">Dan Ryan</text>
          </g>
          </>)}

          {/* Live tracts on the schematic (in geo mode they are Google map markers, see useTractMarkers) */}
          {!geoMode && projectToSchematic && scoreRange && (
            <g id="tracts-layer" pointerEvents="auto">
              {tracts.map((tract) => {
                const { x, y } = projectToSchematic(tract);
                const isSelected = selectedTract?.id === tract.id;
                const isHovered = hoveredTract?.id === tract.id;
                const isFlagged = showVulnerableTracts && isVulnerableTract(tract);

                return (
                  <g
                    key={tract.id}
                    className="cursor-pointer"
                    onClick={(e) => { if (!isDragRelease(e)) onSelectTract(tract); }}
                    onMouseEnter={() => setHoveredTract(tract)}
                    onMouseLeave={() => setHoveredTract(null)}
                  >
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? 7 : isHovered ? 6 : 4}
                      fill={scoreColor(tract.socialVulnerability, scoreRange)}
                      fillOpacity="0.92"
                      stroke={isSelected ? '#ffffff' : isFlagged ? '#c084fc' : '#0f172a'}
                      strokeWidth={isSelected ? 2.5 : isFlagged ? 1.5 : 0.75}
                    />
                    {isSelected && (
                      <circle cx={x} cy={y} r="16" fill="none" stroke="#f97316" strokeWidth="2" className="animate-ping" opacity="0.6" pointerEvents="none" />
                    )}
                  </g>
                );
              })}
            </g>
          )}

          {/* Historical Hotspot Markers (911 Heat Emergency Dispatches) */}
          {showHistoricalHotspots && (
            <g id="historical-hotspots-layer" pointerEvents="auto">
              {HISTORICAL_HOTSPOTS.map((hotspot) => (
                <g
                  key={hotspot.id}
                  transform={`translate(${pinPosition(hotspot).x}, ${pinPosition(hotspot).y})${counterScale}`}
                  className="cursor-pointer group"
                  onClick={(e) => {
                    if (isDragRelease(e)) return;
                    const targetTract = tracts?.find(t => t.id === hotspot.tractId);
                    if (targetTract) onSelectTract(targetTract);
                  }}
                >
                  {/* Warning Aura */}
                  <circle r="18" fill="#ef4444" fillOpacity="0.25" className="animate-ping" />
                  <circle r="14" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1.5" />
                  
                  {/* Flame Icon */}
                  <path
                    d="M 0 -6 C -3 -3 -5 0 -4 4 C -3 7 0 9 2 9 C 5 9 7 6 5 2 C 4 -1 1 -4 0 -6 Z"
                    fill="#fbbf24"
                  />
                  <text
                    x="0"
                    y="22"
                    textAnchor="middle"
                    fill="#fca5a5"
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {hotspot.heatDispatches2025} calls
                  </text>
                </g>
              ))}
            </g>
          )}

          {/* Cooling Centers Pins */}
          {showCoolingCenters && (
            <g id="cooling-centers-layer" pointerEvents="auto">
              {COOLING_CENTERS.map((center) => {
                const isHovered = hoveredCenter?.id === center.id;
                const isNearCapacity = center.occupancyPct >= 85;

                return (
                  <g
                    key={center.id}
                    transform={`translate(${pinPosition(center).x}, ${pinPosition(center).y})${counterScale}`}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredCenter(center)}
                    onMouseLeave={() => setHoveredCenter(null)}
                    onClick={(e) => {
                      if (isDragRelease(e)) return;
                      const targetTract = tracts?.find(t => t.id === center.tractId);
                      if (targetTract) onSelectTract(targetTract);
                    }}
                  >
                    {/* Pulsing Aura */}
                    <circle 
                      r={isNearCapacity ? "18" : "15"} 
                      fill={isNearCapacity ? "#f59e0b" : "#06b6d4"} 
                      fillOpacity="0.3" 
                      className="animate-pulse" 
                    />
                    
                    {/* Shelter Node */}
                    <circle 
                      r="12" 
                      fill="#0f172a" 
                      stroke={isNearCapacity ? "#f59e0b" : "#06b6d4"} 
                      strokeWidth="2" 
                    />

                    {/* Snowflake / Shelter Cross icon */}
                    <path
                      d="M -4 0 L 4 0 M 0 -4 L 0 4 M -3 -3 L 3 3 M -3 3 L 3 -3"
                      stroke={isNearCapacity ? "#fbbf24" : "#67e8f9"}
                      strokeWidth="1.5"
                    />

                    {/* Occupancy Mini Badge */}
                    <rect
                      x="10"
                      y="-10"
                      width="34"
                      height="16"
                      rx="4"
                      fill="#082f49"
                      stroke="#0284c7"
                      strokeWidth="1"
                    />
                    <text
                      x="27"
                      y="2"
                      textAnchor="middle"
                      fill="#7dd3fc"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {center.occupancyPct}%
                    </text>
                  </g>
                );
              })}
            </g>
          )}
        </svg>
        )}

        {/* Hover Tooltip for Tract or Center */}
        {hoveredTract && !selectedTract && (
          <div 
            className="absolute z-30 pointer-events-none bg-slate-900/95 border border-slate-700 p-2.5 rounded-xl shadow-2xl text-xs backdrop-blur-md max-w-xs transition-opacity"
            style={tooltipStyle}
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-1">
              <span className="font-bold text-slate-100">{hoveredTract.name}</span>
              <span className="font-mono font-bold" style={{ color: scoreRange ? scoreColor(hoveredTract.socialVulnerability, scoreRange) : undefined }}>
                SVI {hoveredTract.socialVulnerability.toFixed(2)}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">{hoveredTract.area}</div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1 text-[11px] text-slate-300">
              <div>Avg Temp: <span className="font-semibold text-rose-300">{fmtTemp(hoveredTract.surfaceTemp)}</span></div>
              <div>No Vehicle: <span className="font-semibold text-purple-300">{fmtPct(hoveredTract.demographics.noVehicleRate)}</span></div>
              <div>Seniors &gt;65: <span className="font-semibold text-amber-300">{fmtPct(hoveredTract.demographics.seniorRate)}</span></div>
              <div>Poverty: <span className="font-semibold text-slate-100">{fmtPct(hoveredTract.demographics.povertyRate)}</span></div>
            </div>
            <div className="mt-1.5 text-[10px] text-slate-400 italic">
              Click to feed telemetry directly into AI Planner &rarr;
            </div>
          </div>
        )}

        {/* Center Hover Tooltip */}
        {hoveredCenter && (
          <div 
            className="absolute z-30 pointer-events-none bg-slate-900/95 border border-cyan-500/40 p-2.5 rounded-xl shadow-2xl text-xs backdrop-blur-md max-w-xs"
            style={tooltipStyle}
          >
            <div className="flex items-center gap-1.5 font-bold text-cyan-300 border-b border-slate-800 pb-1">
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>{hoveredCenter.name}</span>
            </div>
            <div className="mt-1 space-y-0.5 text-[11px] text-slate-300">
              <div>Capacity: <span className="font-mono text-white">{hoveredCenter.currentOccupancy}/{hoveredCenter.capacity} ({hoveredCenter.occupancyPct}%)</span></div>
              <div>Generator: <span className="text-emerald-400 font-semibold">{hoveredCenter.generatorStatus}</span></div>
              <div>Water: <span className="font-mono text-cyan-300">{hoveredCenter.waterBottlesRemaining} bottles</span></div>
              <div>Hours: <span className="text-slate-400">{hoveredCenter.hours}</span></div>
            </div>
          </div>
        )}

        {/* Selected Tract Detail Floating Drawer (Bottom overlay on map) */}
        {selectedTract && (
          <div className="absolute bottom-3 left-3 right-3 z-30 bg-slate-900/95 border border-orange-500/40 p-3.5 rounded-xl shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              
              {/* Left Details */}
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-white">
                    {selectedTract.name}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30">
                    Social Vulnerability: {selectedTract.socialVulnerability.toFixed(2)}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    GEOID {selectedTract.tractNumber}
                  </span>
                </div>

                <p className="text-xs text-slate-300 line-clamp-1">
                  {selectedTract.area} · {selectedTract.demographics.population.toLocaleString()} residents
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 pt-0.5 font-mono">
                  <span>Avg Temp: <b className="text-rose-400">{fmtTemp(selectedTract.surfaceTemp)}</b></span>
                  <span>vs City: <b className="text-orange-300">{fmtOffset(selectedTract.heatOffset)}</b></span>
                  <span>Zero-Car: <b className="text-purple-300">{fmtPct(selectedTract.demographics.noVehicleRate)}</b></span>
                  <span>Age &gt;65: <b className="text-amber-300">{fmtPct(selectedTract.demographics.seniorRate)}</b></span>
                  <span>Poverty: <b className="text-slate-100">{fmtPct(selectedTract.demographics.povertyRate)}</b></span>
                </div>
              </div>

              {/* Right Quick Actions */}
              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <button
                  onClick={() => onDeployTruck(selectedTract)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold shadow-md transition-colors whitespace-nowrap"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Deploy Truck</span>
                </button>

                <button
                  onClick={() => onAddToKanban(selectedTract)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-colors whitespace-nowrap"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Push to Kanban</span>
                </button>

                <button
                  onClick={() => onSelectTract(null)}
                  className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-800"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Bottom Map Legend Bar */}
      <div className="bg-slate-900/90 border-t border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        
        {/* Social Vulnerability Gradient Scale (colours both the surface and the tract dots) */}
        {scoreRange ? (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-mono">Social Vulnerability:</span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-400">{scoreRange.min.toFixed(2)} able to escape</span>
              <div className="h-2.5 w-32 rounded-full border border-slate-700" style={{ background: RPL_GRADIENT_CSS }}></div>
              <span className="text-[10px] text-slate-400">{scoreRange.max.toFixed(2)} most attention</span>
              <span className="text-[10px] text-slate-500">· {tracts.length.toLocaleString()} tracts</span>
              {tractSource === 'sample' && (
                <span className="text-[10px] text-amber-400" title="The tract API could not be reached; showing the bundled sample">
                  (sample data)
                </span>
              )}
            </div>
          </div>
        ) : (
          <span className="text-[11px] text-slate-500 font-mono">Loading tracts…</span>
        )}

        {/* Legend Symbols */}
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span>
            <span>Cooling Center</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-2 rounded border border-purple-400 bg-purple-900/50 inline-block"></span>
            <span>Low-Vehicle / High-Age</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
            <span>911 Hotspot</span>
          </div>
        </div>

      </div>

    </div>
  );
}
