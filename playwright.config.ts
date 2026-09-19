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

  // whole test must finish in 30 seconds
  timeout: 120_000,

  // every expect keeps checking for up to 5 seconds
  expect: { timeout: 5_000 },

  // console output + HTML report
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    // app under test - lets us write page.goto('/')
    baseURL: 'https://playground.qatools.dev',

    // every click / fill gets 10 seconds, every goto gets 15 seconds
    actionTimeout: 10_000,
    navigationTimeout: 15_000,

    // keep traces available while learning and debugging
    trace: 'on',

    // take a screenshot when a test fails
    screenshot: 'only-on-failure',
  },

  // browsers to run on
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
