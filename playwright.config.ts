import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:5174',
    trace: 'retain-on-failure',
    viewport: {
      width: 1440,
      height: 900,
    },
  },
  projects: [
    {
      name: 'chromium',
      use: devices['Desktop Chrome'],
    },
  ],
  webServer: {
    command: 'npm run dev -- --host 0.0.0.0 --port 5174',
    reuseExistingServer: true,
    timeout: 120_000,
    url: 'http://127.0.0.1:5174/editor',
  },
});
