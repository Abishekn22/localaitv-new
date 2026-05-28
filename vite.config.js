import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
  preview: {
    port: 4173,
    host: true,
    // Allow the temporary public tunnel hostname (Cloudflare/ngrok) to reach
    // the preview server, which otherwise blocks unknown Host headers.
    allowedHosts: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
