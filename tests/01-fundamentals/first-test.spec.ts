import { test, expect } from '@playwright/test';

// Lesson 01 - open the app and check it loaded
test('Launch the application and verify it loaded', async ({ page }) => {
  // open the app
  await page.goto('https://playground.qatools.dev/');

  // check the page title
  await expect(page).toHaveTitle(/QATools Playground/);

  // check the URL
  await expect(page).toHaveURL('https://playground.qatools.dev/');
});
