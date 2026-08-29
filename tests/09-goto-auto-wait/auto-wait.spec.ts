import { test, expect } from '@playwright/test';

// Lesson 09 - page.goto and the waiting you get for FREE
//
// In old tools you wrote sleep(5000) "just to be safe".
// In Playwright you never need it, because waiting is built in:
//
//   1. page.goto()  waits until the page has loaded
//   2. click / fill  wait until the element is on screen and ready
//   3. expect(...)   keeps checking until it is true (up to 5 seconds)
//
// Notice: there is not a single wait or sleep in this file.

test('goto waits for the page, actions wait for the elements', async ({ page }) => {
  // goto does not return until the page has loaded
  await page.goto('/');
  
  await page.waitForTimeout(3000);

  await page.getByRole('button', { name: 'Skip tour' }).click();

  // click waits for the link to be visible and clickable, then clicks it
  await page.getByRole('link', { name: 'Electronics' }).click();

  // the new page takes time to load - expect keeps checking until it is there
  await expect(page).toHaveURL(/category=Electronics/);
  await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Wireless Headphones' })).toBeVisible();
});

test('login without any sleep', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Skip tour' }).click();

  // fill waits for each input to be ready - no sleep between steps
  await page.getByLabel('Email').fill('demo@promptqa.test');
  await page.getByLabel('Password').fill('Demo@1234');
  await page.getByRole('button', { name: 'Sign in' }).click();

  // after Sign in the page changes - expect waits for the Logout button to show up
  await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
});

// Playwright waits for you, but you can change HOW LONG it waits.
// Three levels: config file -> one test -> one line.
// Tip: keep the defaults. If one step is slow, set the timeout on that line only.

test('override the wait time when needed', async ({ page }) => {
  // whole test: 60 seconds instead of the default 30 (from playwright.config.ts)
  test.setTimeout(60_000);

  // one line: goto gets 20 seconds
  await page.goto('/', { timeout: 20_000 });

  // one line: click gets 10 seconds to find and click the button
  await page.getByRole('button', { name: 'Skip tour' }).click({ timeout: 10_000 });

  // one line: expect keeps checking for 15 seconds instead of the default 5
  await expect(page.getByRole('heading', { name: 'Featured products' })).toBeVisible({ timeout: 15_000 });
});
