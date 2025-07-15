import { defineConfig, devices } from '@playwright/test';
/**
 * Conditionally set reporters based on the environment.
 * In CI, use the 'github' reporter for integrated annotations.
 * Locally, use the 'list' reporter for immediate feedback in the console.
 */
// Initialize reporters as a flat array of the correct type.
const reporters = [
    // Default reporter for all environments
    ['html', { outputFolder: 'html-report', open: 'never' }]
];
if (process.env.CI) {
    // In CI, push the 'github' string and the 'json' tuple directly.
    reporters.push(['github']);
    reporters.push(['json', { outputFile: 'test-results.json' }]);
}
else {
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
//# sourceMappingURL=playwright.config.js.map