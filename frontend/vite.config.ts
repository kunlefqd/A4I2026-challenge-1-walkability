import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// In dev, requests to /agent/* are proxied to the ADK server (VITE_AGENT_URL),
// so the browser never hits CORS. Leave VITE_AGENT_URL unset to use the mock agent.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const agentUrl = env.VITE_AGENT_URL;

  return {
    plugins: [react()],
    server: {
      proxy: agentUrl
        ? {
            '/agent': {
              target: agentUrl,
              changeOrigin: true,
              rewrite: (path) => path.replace(/^\/agent/, ''),
            },
          }
        : undefined,
    },
  };
});
