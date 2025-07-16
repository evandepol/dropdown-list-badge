import { defineConfig, devices, type ReporterDescription } from '@playwright/test';

/**
 * Conditionally set reporters based on the environment.
 * In CI, use the 'github' reporter for integrated annotations.
 * Locally, use the 'list' reporter for immediate feedback in the console.
 */
// Initialize reporters as a flat array of the correct type.
const reporters: ReporterDescription[] = [
  // Default reporter for all environments
  ['html', { outputFolder: 'html-report', open: 'never' }]
];

if (process.env.CI) {
  // In CI, push the 'github' string and the 'json' tuple directly.
  reporters.push(['github']);
  reporters.push(['json', { outputFile: 'test-results.json' }]);
} else {
  // Locally, push the 'list' string directly.
  reporters.push(['list']);
}

export default defineConfig({
  testDir: './',
  outputDir: './test-results',
  snapshotDir: './__snapshots__',
  reporter: reporters,
  use: {
    baseURL: 'http://localhost:5000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 20000,
    // Remove launchOptions.args from here to avoid passing Chromium flags to all browsers
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--font-render-hinting=none',
          ],
        },
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        // No Chromium flags here
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        // No Chromium flags here
      },
    },
  ],
  retries: 1,
  timeout: 30000,
});