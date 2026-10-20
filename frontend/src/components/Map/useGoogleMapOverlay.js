import { useCallback, useEffect, useRef, useState } from 'react';
import { loadGoogleMaps, GOOGLE_MAPS_API_KEY, GOOGLE_MAPS_MAP_ID } from '../../lib/googleMaps';
import { DALLAS_GEO_BOUNDS, MAP_VIEWBOX } from '../../data/cityData';

const BASEMAPS = {
  dark: { mapTypeId: 'roadmap', colorScheme: 'DARK' },
  satellite: { mapTypeId: 'hybrid', colorScheme: 'DARK' },
  streets: { mapTypeId: 'roadmap', colorScheme: 'LIGHT' },
};

// Mounts a Google map in containerRef and an OverlayView whose div is stretched
// over DALLAS_GEO_BOUNDS, so an 800x580 SVG rendered into it lines up with the map.
// `scale` is screen pixels per SVG unit, for counter-scaling labels and markers.
export default function useGoogleMapOverlay(containerRef, basemapStyle) {
  const [map, setMap] = useState(null);
  const [overlayEl, setOverlayEl] = useState(null);
  const [scale, setScale] = useState({ x: 1, y: 1 });
  const [status, setStatus] = useState(GOOGLE_MAPS_API_KEY ? 'loading' : 'disabled');
  const boundsRef = useRef(null);
  const basemap = BASEMAPS[basemapStyle] || BASEMAPS.dark;

  // colorScheme can only be set when a map is constructed, so changing it rebuilds the map.
  useEffect(() => {
    const el = containerRef.current;
    if (!GOOGLE_MAPS_API_KEY || !el) return;
    let cancelled = false;
    let overlay = null;

    // Called by the Maps API when the key is invalid or not authorized for this origin.
    window.gm_authFailure = () => setStatus('error');

    (async () => {
      try {
        const google = await loadGoogleMaps();
        const [{ Map, OverlayView }, { LatLng, LatLngBounds, ColorScheme }] = await Promise.all([
          google.maps.importLibrary('maps'),
          google.maps.importLibrary('core'),
        ]);
        if (cancelled) return;

        const b = DALLAS_GEO_BOUNDS;
        const sw = new LatLng(b.south, b.west);
        const ne = new LatLng(b.north, b.east);
        boundsRef.current = new LatLngBounds(sw, ne);

        const gmap = new Map(el, {
          mapId: GOOGLE_MAPS_MAP_ID,
          colorScheme: ColorScheme?.[basemap.colorScheme] ?? basemap.colorScheme,
          mapTypeId: basemap.mapTypeId,
          disableDefaultUI: true,
          clickableIcons: false,
          gestureHandling: 'greedy',
        });
        gmap.fitBounds(boundsRef.current, 0);

        class SvgOverlay extends OverlayView {
          onAdd() {
            this.div = document.createElement('div');
            this.div.style.position = 'absolute';
            this.getPanes().overlayMouseTarget.appendChild(this.div);
            setOverlayEl(this.div);
          }

          draw() {
            const projection = this.getProjection();
            const swPx = projection.fromLatLngToDivPixel(sw);
            const nePx = projection.fromLatLngToDivPixel(ne);
            const width = nePx.x - swPx.x;
            const height = swPx.y - nePx.y;
            Object.assign(this.div.style, {
              left: `${swPx.x}px`,
              top: `${nePx.y}px`,
              width: `${width}px`,
              height: `${height}px`,
            });
            const next = { x: width / MAP_VIEWBOX.width, y: height / MAP_VIEWBOX.height };
            setScale(prev =>
              Math.abs(prev.x - next.x) < 1e-3 && Math.abs(prev.y - next.y) < 1e-3 ? prev : next
            );
          }

          onRemove() {
            this.div?.remove();
            this.div = null;
            setOverlayEl(null);
          }
        }

        overlay = new SvgOverlay();
        overlay.setMap(gmap);
        setMap(gmap);
        setStatus(prev => (prev === 'error' ? prev : 'ready'));
      } catch (err) {
        console.error(err);
        if (!cancelled) setStatus('error');
      }
    })();

    return () => {
      cancelled = true;
      overlay?.setMap(null);
      setMap(null);
      el.replaceChildren();
    };
    // basemap.mapTypeId is applied below without a rebuild.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, basemap.colorScheme]);

  useEffect(() => {
    map?.setMapTypeId(basemap.mapTypeId);
  }, [map, basemap.mapTypeId]);

  const fitToBounds = useCallback(() => {
    if (map && boundsRef.current) map.fitBounds(boundsRef.current, 0);
  }, [map]);

  return { map, overlayEl, scale, status, fitToBounds };
}
