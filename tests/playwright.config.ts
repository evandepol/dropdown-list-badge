import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  outputDir: './tests/results',
  snapshotDir: './tests/__snapshots__',
  reporter: [
    ['list'],
    ['html', { outputFolder: './tests/results/html-report', open: 'never' }]
  ],
  use: {
    baseURL: 'http://localhost:5000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
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
});