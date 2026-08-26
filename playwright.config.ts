import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // where the tests live
  testDir: './tests',

  // run tests in parallel
  fullyParallel: true,

  // on CI: fail if test.only is left in, retry twice, run one worker
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // console output + HTML report
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    // app under test - lets us write page.goto('/')
    baseURL: 'https://playground.qatools.dev',

    // record a trace when a test is retried
    trace: 'on-first-retry',

    // take a screenshot when a test fails
    screenshot: 'only-on-failure',
  },

  // browsers to run on
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    // { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
