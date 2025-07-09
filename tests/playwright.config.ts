import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './',
  outputDir: './test-results',
  snapshotDir: './__snapshots__',
  reporter: [
    ['list'],
    ['html', { outputFolder: './html-report', open: 'never' }]
  ],
  use: {
    baseURL: 'http://localhost:5000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 20000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  retries: 1,
  timeout: 30000,
});