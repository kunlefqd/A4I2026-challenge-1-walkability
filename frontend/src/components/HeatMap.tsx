import { useEffect, useMemo, useState } from 'react';
import { APIProvider, AdvancedMarker, Map, useMap } from '@vis.gl/react-google-maps';
import { GoogleMapsOverlay } from '@deck.gl/google-maps';
import { HexagonLayer } from '@deck.gl/aggregation-layers';
import type { Color, Layer, PickingInfo } from '@deck.gl/core';
import type { AgentLocation, City, HeatPoint, Hotspot } from '../types';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID';

// Diverging blue (cooler than city average) → red (hotter). The middle bin is neutral.
export const OFFSET_COLORS: Color[] = [
  [33, 102, 172],
  [103, 169, 207],
  [209, 229, 240],
  [247, 247, 247],
  [253, 219, 199],
  [239, 138, 98],
  [178, 24, 43],
];
// Symmetric around 0 so neutral always means "same as the city average".
export const OFFSET_DOMAIN_F = 7;

export interface FocusRequest {
  points: { lat: number; lon: number }[];
  seq: number;
}

interface Props {
  city: City;
  heatPoints: HeatPoint[];
  hotspots: Hotspot[];
  selectedId: string | null;
  agentLocations: AgentLocation[];
  focus: FocusRequest | null;
  onSelectHotspot: (id: string) => void;
}

declare global {
  interface Window {
    gm_authFailure?: () => void;
  }
}

export function HeatMap(props: Props) {
  const [authFailed, setAuthFailed] = useState(false);

  // Google calls this global when it rejects the key. Unmounting the map also stops
  // deck.gl from drawing onto a map that never initialized.
  useEffect(() => {
    window.gm_authFailure = () => setAuthFailed(true);
    return () => {
      delete window.gm_authFailure;
    };
  }, []);

  if (authFailed) {
    return (
      <div className="map-missing">
        <h3>Google rejected the Maps API key</h3>
        <p>
          Check <code>VITE_GOOGLE_MAPS_API_KEY</code> in <code>frontend/.env.local</code>: a Maps key is 39
          characters and starts with <code>AIza</code>. The key's project also needs the{' '}
          <strong>Maps JavaScript API</strong> enabled and billing on, and any HTTP-referrer restriction must
          allow this page's address. Restart <code>npm run dev</code> after changing it.
        </p>
      </div>
    );
  }

  if (!API_KEY) {
    return (
      <div className="map-missing">
        <h3>Google Maps API key missing</h3>
        <p>
          Copy <code>frontend/.env.example</code> to <code>frontend/.env.local</code>, set{' '}
          <code>VITE_GOOGLE_MAPS_API_KEY</code>, and restart <code>npm run dev</code>.
        </p>
      </div>
    );
  }

  return (
    <APIProvider apiKey={API_KEY}>
      <Map
        mapId={MAP_ID}
        defaultCenter={{ lat: props.city.center.lat, lng: props.city.center.lon }}
        defaultZoom={11}
        gestureHandling="greedy"
        disableDefaultUI
        zoomControl
        clickableIcons={false}
      >
        <HexOverlay heatPoints={props.heatPoints} />
        <FocusController focus={props.focus} />
        {props.hotspots.map((h) => (
          <AdvancedMarker
            key={h.id}
            position={{ lat: h.lat, lng: h.lon }}
            onClick={() => props.onSelectHotspot(h.id)}
            zIndex={h.id === props.selectedId ? 20 : 10}
            title={h.name}
          >
            <div className={`marker marker--${h.severity} ${h.id === props.selectedId ? 'is-selected' : ''}`}>
              +{h.offsetF.toFixed(1)}°
            </div>
          </AdvancedMarker>
        ))}
        {props.agentLocations.map((loc, i) => (
          <AdvancedMarker key={`agent-${i}`} position={{ lat: loc.lat, lng: loc.lon }} zIndex={30} title={loc.label}>
            <div className="marker marker--agent">
              <span className="marker__index">{i + 1}</span>
              {loc.label && <span className="marker__label">{loc.label}</span>}
            </div>
          </AdvancedMarker>
        ))}
      </Map>
      <Legend />
    </APIProvider>
  );
}

function HexOverlay({ heatPoints }: { heatPoints: HeatPoint[] }) {
  const map = useMap();
  const overlay = useMemo(() => new GoogleMapsOverlay({ interleaved: true }), []);

  useEffect(() => {
    if (!map) return;
    overlay.setMap(map);
    return () => overlay.setMap(null);
  }, [map, overlay]);

  useEffect(() => {
    const layers: Layer[] = [
      new HexagonLayer<HeatPoint>({
        id: 'offset-hexagons',
        data: heatPoints,
        getPosition: (d) => [d.lon, d.lat],
        // Color = average offset of the readings in the cell, not how many readings there are.
        getColorWeight: (d) => d.offsetF,
        colorAggregation: 'MEAN',
        colorDomain: [-OFFSET_DOMAIN_F, OFFSET_DOMAIN_F],
        colorScaleType: 'quantize',
        colorRange: OFFSET_COLORS,
        radius: 300,
        coverage: 0.9,
        opacity: 0.7,
        extruded: false,
        gpuAggregation: false,
        pickable: true,
      }),
    ];
    overlay.setProps({ layers, getTooltip: hexTooltip });
  }, [overlay, heatPoints]);

  return null;
}

function hexTooltip({ object }: PickingInfo) {
  if (!object) return null;
  const { colorValue, count } = object as { colorValue: number; count: number };
  const sign = colorValue >= 0 ? '+' : '−';
  return {
    html: `<strong>${sign}${Math.abs(colorValue).toFixed(1)}°F</strong> vs. city average<br/><span>${count} readings</span>`,
    className: 'deck-tooltip',
  };
}

function FocusController({ focus }: { focus: FocusRequest | null }) {
  const map = useMap();
  useEffect(() => {
    if (!map || !focus || focus.points.length === 0) return;
    if (focus.points.length === 1) {
      map.panTo({ lat: focus.points[0].lat, lng: focus.points[0].lon });
      map.setZoom(Math.max(map.getZoom() ?? 13, 14));
      return;
    }
    const bounds = new google.maps.LatLngBounds();
    focus.points.forEach((p) => bounds.extend({ lat: p.lat, lng: p.lon }));
    map.fitBounds(bounds, 80);
  }, [map, focus]);
  return null;
}

function Legend() {
  return (
    <div className="legend" aria-label="Map legend">
      <div className="legend__title">Offset vs. city average (°F)</div>
      <div className="legend__bar">
        {OFFSET_COLORS.map((c, i) => (
          <span key={i} style={{ background: `rgb(${c.join(',')})` }} />
        ))}
      </div>
      <div className="legend__ticks">
        <span>−{OFFSET_DOMAIN_F} cooler</span>
        <span>0</span>
        <span>+{OFFSET_DOMAIN_F} hotter</span>
      </div>
    </div>
  );
}
