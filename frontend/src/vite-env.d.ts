/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPS_API_KEY?: string;
  readonly VITE_GOOGLE_MAPS_MAP_ID?: string;
  readonly VITE_AGENT_URL?: string;
  readonly VITE_AGENT_APP_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
