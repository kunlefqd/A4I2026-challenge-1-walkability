import React, { useEffect, useRef, useState } from 'react';
import { 
  CHICAGO_TRACTS,
  COOLING_CENTERS,
  HISTORICAL_HOTSPOTS
} from '../../data/cityData';
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
  tracts = CHICAGO_TRACTS,
  selectedTract,
  onSelectTract,
  showCoolingCenters,
  showVulnerableTracts,
  showHistoricalHotspots,
  showCanopyDeficit,
  heatThreshold,
  basemapStyle,
  onDeployTruck,
  onAddToKanban,
  simulatedHeatBoost
}) {
  const mapRef = useRef(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [hoveredTract, setHoveredTract] = useState(null);
  const [hoveredCenter, setHoveredCenter] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!mapsApiKey || !mapRef.current || typeof window === 'undefined') return;

    const ensureMapsScript = () => {
      const existingScript = document.getElementById('google-maps-script');
      if (existingScript) {
        if (window.google?.maps) setMapLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${mapsApiKey}&callback=initChicagoHeatMap`;
      script.async = true;
      script.defer = true;
      window.initChicagoHeatMap = () => setMapLoaded(true);
      document.head.appendChild(script);
    };

    ensureMapsScript();
  }, [mapsApiKey]);

  useEffect(() => {
    if (!mapRef.current || !window.google?.maps || !mapsApiKey) return;

    const darkStyles = [
      { elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
      { elementType: 'labels.text.fill', stylers: [{ color: '#cbd5e1' }] },
      { elementType: 'labels.text.stroke', stylers: [{ color: '#0b1120' }] },
      { featureType: 'road', stylers: [{ color: '#1e293b' }, { visibility: 'simplified' }] },
      { featureType: 'water', stylers: [{ color: '#0f766e' }, { opacity: 0.4 }] },
      { featureType: 'poi', stylers: [{ visibility: 'off' }] }
    ];

    const lightStyles = [
      { featureType: 'water', stylers: [{ color: '#dbeafe' }] },
      { featureType: 'road', stylers: [{ color: '#f8fafc' }, { visibility: 'simplified' }] },
      { featureType: 'poi', stylers: [{ visibility: 'off' }] },
      { elementType: 'labels.text.fill', stylers: [{ color: '#0f172a' }] },
      { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }] }
    ];

    const selectedStyles = basemapStyle === 'dark' ? darkStyles : basemapStyle === 'radar' ? darkStyles : lightStyles;

    let map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 41.8781, lng: -87.6298 },
      zoom: 10,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      disableDefaultUI: true,
      styles: selectedStyles,
      gestureHandling: 'greedy'
    });

    const tractLocations = (tracts || [])
      .filter((tract) => Number.isFinite(tract.lat) && Number.isFinite(tract.lng))
      .slice(0, 12);

    tractLocations.forEach((tract) => {
      const color = tract.heatOffset >= 8.5 ? '#ef4444' : tract.heatOffset >= 6 ? '#f97316' : '#fbbf24';
      const marker = new window.google.maps.Marker({
        position: { lat: tract.lat, lng: tract.lng },
        map,
        title: tract.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 7,
          fillColor: color,
          fillOpacity: 0.95,
          strokeColor: '#f8fafc',
          strokeWeight: 2
        }
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `<div style="color:#0f172a;font-family:monospace;font-size:12px;padding:4px 8px"><strong>${tract.name}</strong><br/>Risk ${tract.bqmlRiskScore ?? tract.heatOffset?.toFixed(1) ?? 'n/a'} / Heat +${tract.heatOffset?.toFixed(1) ?? '0.0'}°F</div>`
      });

      marker.addListener('click', () => infoWindow.open({ anchor: marker, map }));
    });

    return () => {
      map = null;
    };
  }, [mapLoaded, mapsApiKey, tracts, basemapStyle]);

  // Helper to get heat color based on BQML offset + simulation boost
  const getHeatFillColor = (offset, isHovered, isSelected) => {
    const effectiveOffset = offset + simulatedHeatBoost;
    let baseColor = "#eab308"; // default yellow (+4°F)
    let opacity = isSelected ? "0.92" : isHovered ? "0.85" : "0.72";

    if (effectiveOffset >= 9.5) {
      baseColor = "#991b1b"; // Deep dark red / crimson
    } else if (effectiveOffset >= 8.5) {
      baseColor = "#dc2626"; // Vibrant red
    } else if (effectiveOffset >= 7.5) {
      baseColor = "#ea580c"; // Red-orange
    } else if (effectiveOffset >= 6.0) {
      baseColor = "#f97316"; // Orange
    } else if (effectiveOffset >= 5.0) {
      baseColor = "#eab308"; // Yellow-amber
    } else {
      baseColor = "#84cc16"; // Lime / baseline
    }

    return { color: baseColor, opacity };
  };

  const handleZoom = (delta) => {
    setZoomLevel(prev => Math.min(Math.max(prev + delta, 0.8), 2.2));
  };

  const resetView = () => {
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
          {mapsApiKey ? 'Google Maps + BQML Surface Grid' : 'BQML Satellite Surface Grid'}
        </span>
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
      <div className="relative flex-1 w-full h-full overflow-hidden cursor-crosshair">
        {mapsApiKey && (
          <div
            ref={mapRef}
            className="absolute inset-0 opacity-100 pointer-events-none z-10"
            aria-label="Google Maps background for Chicago"
          />
        )}
        <svg
          viewBox="0 0 800 580"
          className="absolute inset-0 w-full h-full transition-transform duration-300 z-20"
          style={{
            transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
            transformOrigin: 'center center',
            opacity: 0.9
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
            <pattern id="vulnerableHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#a855f7" strokeWidth="2" strokeOpacity="0.45" />
            </pattern>

            {/* Tree Canopy Striped Pattern */}
            <pattern id="canopyDeficitHatch" width="6" height="6" patternTransform="rotate(135 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="6" stroke="#10b981" strokeWidth="1.5" strokeOpacity="0.3" />
            </pattern>

            {/* Glow Filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Map Layer */}
          <rect
            width="800"
            height="580"
            fill={basemapStyle === 'radar' ? '#060a12' : basemapStyle === 'dark' ? '#0a0e17' : '#f8fafc'}
          />
          <rect width="800" height="580" fill={basemapStyle === 'streets' ? 'rgba(148, 163, 184, 0.08)' : 'url(#grid)'} />

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

          {/* Heat Offset Tract Polygons */}
          <g id="tracts-layer">
            {tracts.map((tract) => {
              const effectiveOffset = tract.heatOffset + simulatedHeatBoost;
              const isFilteredOut = effectiveOffset < heatThreshold;
              const isSelected = selectedTract?.id === tract.id;
              const isHovered = hoveredTract?.id === tract.id;
              const { color, opacity } = getHeatFillColor(tract.heatOffset, isHovered, isSelected);

              // Vulnerable tract criteria (no-vehicle > 30% OR seniorRate > 25%)
              const isVulnerable = tract.demographics.noVehicleRate > 30 || tract.demographics.seniorRate > 25;
              const isCanopyDeficit = tract.demographics.treeCanopyCover < 10;

              return (
                <g 
                  key={tract.id}
                  className="cursor-pointer transition-all duration-200"
                  onClick={() => onSelectTract(tract)}
                  onMouseEnter={() => setHoveredTract(tract)}
                  onMouseLeave={() => setHoveredTract(null)}
                >
                  {/* Base Tract Polygon */}
                  <path
                    d={tract.shape}
                    fill={color}
                    fillOpacity={isFilteredOut ? 0.15 : opacity}
                    stroke={isSelected ? "#ffffff" : isHovered ? "#f97316" : "#334155"}
                    strokeWidth={isSelected ? 3.5 : isHovered ? 2.5 : 1}
                    className="transition-all duration-200"
                    filter={isSelected ? "url(#glow)" : undefined}
                  />

                  {/* Vulnerable Tract Overlay Pattern */}
                  {showVulnerableTracts && isVulnerable && !isFilteredOut && (
                    <path
                      d={tract.shape}
                      fill="url(#vulnerableHatch)"
                      stroke="#c084fc"
                      strokeWidth="2"
                      strokeDasharray="4,3"
                      pointerEvents="none"
                    />
                  )}

                  {/* Canopy Deficit Overlay Pattern */}
                  {showCanopyDeficit && isCanopyDeficit && !isFilteredOut && (
                    <path
                      d={tract.shape}
                      fill="url(#canopyDeficitHatch)"
                      pointerEvents="none"
                    />
                  )}

                  {/* Heat Offset Badge in Tract Center */}
                  <g transform={`translate(${tract.coordinates.x}, ${tract.coordinates.y})`} pointerEvents="none">
                    <rect
                      x="-28"
                      y="-12"
                      width="56"
                      height="24"
                      rx="6"
                      fill="#0f172a"
                      fillOpacity="0.88"
                      stroke={isSelected ? "#f97316" : "#475569"}
                      strokeWidth={isSelected ? "1.5" : "1"}
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill={effectiveOffset >= 8.5 ? "#f87171" : "#fbbf24"}
                      fontSize="11"
                      fontWeight="700"
                      fontFamily="monospace"
                    >
                      +{effectiveOffset.toFixed(1)}°F
                    </text>
                  </g>

                  {/* Selected Indicator Pulse Beacon */}
                  {isSelected && (
                    <g transform={`translate(${tract.coordinates.x}, ${tract.coordinates.y})`}>
                      <circle r="36" fill="none" stroke="#f97316" strokeWidth="2" className="animate-ping" opacity="0.6" />
                      <circle r="42" fill="none" stroke="#ea580c" strokeWidth="1" strokeDasharray="3,3" />
                    </g>
                  )}
                </g>
              );
            })}
          </g>

          {/* Historical Hotspot Markers (911 Heat Emergency Dispatches) */}
          {showHistoricalHotspots && (
            <g id="historical-hotspots-layer">
              {HISTORICAL_HOTSPOTS.map((hotspot) => (
                <g 
                  key={hotspot.id} 
                  transform={`translate(${hotspot.coordinates.x}, ${hotspot.coordinates.y})`}
                  className="cursor-pointer group"
                  onClick={() => {
                    const targetTract = tracts.find(t => t.id === hotspot.tractId);
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
            <g id="cooling-centers-layer">
              {COOLING_CENTERS.map((center) => {
                const isHovered = hoveredCenter?.id === center.id;
                const isNearCapacity = center.occupancyPct >= 85;

                return (
                  <g 
                    key={center.id}
                    transform={`translate(${center.coordinates.x}, ${center.coordinates.y})`}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredCenter(center)}
                    onMouseLeave={() => setHoveredCenter(null)}
                    onClick={() => {
                      const targetTract = tracts.find(t => t.id === center.tractId);
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

        {/* Hover Tooltip for Tract or Center */}
        {hoveredTract && !selectedTract && (
          <div 
            className="absolute z-30 pointer-events-none bg-slate-900/95 border border-slate-700 p-2.5 rounded-xl shadow-2xl text-xs backdrop-blur-md max-w-xs transition-opacity"
            style={{
              left: `${Math.min(Math.max(hoveredTract.coordinates.x * 0.9, 20), 480)}px`,
              top: `${Math.min(Math.max(hoveredTract.coordinates.y * 0.8, 40), 400)}px`
            }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-1">
              <span className="font-bold text-slate-100">{hoveredTract.name}</span>
              <span className="font-mono font-bold text-orange-400">
                +{(hoveredTract.heatOffset + simulatedHeatBoost).toFixed(1)}°F
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1 text-[11px] text-slate-300">
              <div>Surface Temp: <span className="font-semibold text-rose-300">{hoveredTract.surfaceTemp}°F</span></div>
              <div>No Vehicle: <span className="font-semibold text-purple-300">{hoveredTract.demographics.noVehicleRate}%</span></div>
              <div>Seniors &gt;65: <span className="font-semibold text-amber-300">{hoveredTract.demographics.seniorRate}%</span></div>
              <div>Canopy Cover: <span className="font-semibold text-emerald-300">{hoveredTract.demographics.treeCanopyCover}%</span></div>
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
            style={{
              left: `${hoveredCenter.coordinates.x * 0.85}px`,
              top: `${hoveredCenter.coordinates.y * 0.8}px`
            }}
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
                    BQML Offset: +{(selectedTract.heatOffset + simulatedHeatBoost).toFixed(1)}°F
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    Tract {selectedTract.tractNumber}
                  </span>
                </div>
                
                <p className="text-xs text-slate-300 line-clamp-1">
                  {selectedTract.notes}
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 pt-0.5 font-mono">
                  <span>Surface: <b className="text-rose-400">{selectedTract.surfaceTemp}°F</b></span>
                  <span>Zero-Car: <b className="text-purple-300">{selectedTract.demographics.noVehicleRate}%</b></span>
                  <span>Age &gt;65: <b className="text-amber-300">{selectedTract.demographics.seniorRate}%</b></span>
                  <span>Canopy: <b className="text-emerald-300">{selectedTract.demographics.treeCanopyCover}%</b></span>
                  <span>Cooling Center: <b className="text-cyan-300">{selectedTract.nearestCenterDist}</b></span>
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
        
        {/* Heat Offset Gradient Scale */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-mono">BQML Heat Offset:</span>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400">+4°F</span>
            <div className="flex h-2.5 w-32 rounded-full overflow-hidden border border-slate-700">
              <div className="flex-1 bg-[#84cc16]"></div>
              <div className="flex-1 bg-[#eab308]"></div>
              <div className="flex-1 bg-[#f97316]"></div>
              <div className="flex-1 bg-[#dc2626]"></div>
              <div className="flex-1 bg-[#991b1b]"></div>
            </div>
            <span className="text-[10px] text-slate-400">+10°F+</span>
          </div>
        </div>

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
