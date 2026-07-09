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
