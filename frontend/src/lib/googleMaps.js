// Minimal Google Maps JavaScript API loader (no extra dependency).
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
export const GOOGLE_MAPS_MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID';

let loadPromise = null;

export function loadGoogleMaps(apiKey = GOOGLE_MAPS_API_KEY) {
  if (!apiKey) return Promise.reject(new Error('VITE_GOOGLE_MAPS_API_KEY is not set'));
  if (window.google?.maps?.importLibrary) return Promise.resolve(window.google);
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const callbackName = '__initGoogleMaps';
    window[callbackName] = () => {
      delete window[callbackName];
      resolve(window.google);
    };

    const script = document.createElement('script');
    script.src =
      `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}` +
      `&v=weekly&loading=async&callback=${callbackName}`;
    script.async = true;
    script.onerror = () => {
      loadPromise = null;
      script.remove();
      reject(new Error('Failed to load the Google Maps JavaScript API'));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}
