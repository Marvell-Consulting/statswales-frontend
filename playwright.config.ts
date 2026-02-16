import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import 'dotenv/config';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests-e2e',
  /* Whether to run tests inside files in parallel (default is to run separate files in parallel but not the tests within the same file) */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Fail fast on CI */
  maxFailures: process.env.CI ? 1 : 3,
  /* Use multiple workers for parallel test execution */
  workers: 4,
  /* Dir for test artifacts such as screenshots, videos, traces, etc. */
  outputDir: './playwright/results',
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['html', { outputFolder: './playwright/report' }]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.CONSUMER_URL || 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry'
  },

  /* Configure projects for major browsers */
  projects: [
    { name: 'publisher-setup', testMatch: /auth\.setup\.ts/ },

    { name: 'consumer-setup', testMatch: /consumer-setup\.ts/, dependencies: ['publisher-setup'] },

    {
      name: 'publish',
      testMatch: /\/tests-e2e\/publish\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['publisher-setup']
    },

    {
      name: 'consumer',
      testMatch: /\/tests-e2e\/consumer\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:3100'
      },
      dependencies: ['consumer-setup']
    },

    {
      name: 'production',
      testMatch: /\/tests-e2e\/production\/check-all-published\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.CHECK_PROD_URL
      },
      // No dependencies - runs against production
      dependencies: []
    }
  ].filter((project) => {
    // Always exclude production project unless CHECK_PROD_URL env var is set
    if (project.name === 'production') {
      return !!process.env.CHECK_PROD_URL && !!process.env.CHECK_PROD_API;
    }
    return true;
  }),

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run start:ci',
    url: process.env.CONSUMER_URL,
    reuseExistingServer: !process.env.CI
  }
});
