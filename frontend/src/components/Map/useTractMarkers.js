import { useEffect, useRef } from 'react';
import { scoreColor } from './useVulnerabilitySurface';
import { isVulnerableTract } from '../../lib/tractAdapter';

// Draws each tract as a clickable dot on the Google map, coloured by social vulnerability.
// A Data layer keeps ~1,000 markers cheap and lets one style function handle selection and hover.
export default function useTractMarkers(map, tracts, { range, selectedId, hoveredId, highlightVulnerable, onSelect, onHover }) {
  const layerRef = useRef(null);
  // Handlers change every render; keep the listeners stable and read the latest ones from a ref.
  const handlers = useRef({ onSelect, onHover });
  handlers.current = { onSelect, onHover };

  useEffect(() => {
    if (!map || !tracts?.length) return;
    const { Data } = window.google.maps;
    const layer = new Data({ map });
    const byId = new Map(tracts.map(t => [t.id, t]));
    tracts.forEach(t => layer.add({ id: t.id, geometry: new Data.Point({ lat: t.lat, lng: t.lng }) }));

    const listeners = [
      layer.addListener('click', e => handlers.current.onSelect?.(byId.get(e.feature.getId()))),
      layer.addListener('mouseover', e => handlers.current.onHover?.(byId.get(e.feature.getId()), e.domEvent)),
      layer.addListener('mouseout', () => handlers.current.onHover?.(null)),
    ];
    layerRef.current = { layer, byId };

    return () => {
      listeners.forEach(l => l.remove());
      layer.setMap(null);
      layerRef.current = null;
    };
  }, [map, tracts]);

  useEffect(() => {
    const current = layerRef.current;
    if (!current || !range) return;
    const { SymbolPath } = window.google.maps;

    current.layer.setStyle(feature => {
      const t = current.byId.get(feature.getId());
      const selected = t.id === selectedId;
      const hovered = t.id === hoveredId;
      const flagged = highlightVulnerable && isVulnerableTract(t);
      return {
        cursor: 'pointer',
        title: `${t.name} · vulnerability ${t.socialVulnerability.toFixed(2)}`,
        // Most vulnerable on top so the red dots are not buried under green ones.
        zIndex: selected ? 10000 : Math.round(t.socialVulnerability * 1000),
        icon: {
          path: SymbolPath.CIRCLE,
          scale: selected ? 8 : hovered ? 7 : 5,
          fillColor: scoreColor(t.socialVulnerability, range),
          fillOpacity: 0.95,
          strokeColor: selected ? '#ffffff' : flagged ? '#c084fc' : '#0f172a',
          strokeWeight: selected ? 3 : flagged ? 2 : 1,
        },
      };
    });
  }, [map, tracts, range, selectedId, hoveredId, highlightVulnerable]);
}
