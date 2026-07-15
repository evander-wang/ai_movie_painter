import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';
import { parse } from 'smol-toml';
import { defineConfig } from 'vite';

const appConfig = parse(readFileSync(new URL('./config/app.toml', import.meta.url), 'utf8')) as {
  server?: {
    host?: string;
    port?: number;
  };
};

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('/@xyflow/')) return 'vendor-reactflow';
          if (id.includes('/lucide-react/')) return 'vendor-icons';
          if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/react-router-dom/')) {
            return 'vendor-react';
          }
          return undefined;
        },
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: appConfig.server?.host ?? '0.0.0.0',
    port: appConfig.server?.port ?? 5174,
  },
});
