import { test, expect } from '@playwright/test';

// Lesson 08 - what async and await actually do
//
// async = "this function is allowed to wait"
//         You can only use await inside an async function.
//         That is why every test starts with: async ({ page }) => { ... }
//
// await = "wait here until the browser is done, then continue"
//         Every Playwright call that talks to the browser (goto, click, fill,
//         title, expect on an element) takes time and returns a Promise.
//         A Promise is not the result - it is a "ticket" for a result that
//         will come later. await turns the ticket into the real result.
//
// Rule: if the line talks to the browser, put await in front.

test('without await you get a Promise, not the value', async ({ page }) => {
  await page.goto('/');

  // No await here. The browser has not answered yet, so "title" is only a
  // Promise (a ticket), not the page title text.
  const title = page.title();
  console.log('without await:', title); // prints: Promise { <pending> }

  // With await. The code stops on this line until the browser sends the title
  // back, so "realTitle" is the actual text.
  const realTitle = await page.title();
  console.log('with await:', realTitle); // prints: QATools Playground — ...

  // realTitle is plain text now, so a normal expect works (no await needed here,
  // because this check does not talk to the browser).
  expect(realTitle).toContain('QATools Playground');
});

test('actions run in order because of await', async ({ page }) => {
  // Each await makes the next line wait for the previous one to finish.
  // Without await, "fill" could run before the page is open, and "click"
  // could run before the fields are filled.
  await page.goto('/login');
  await page.getByRole('button', { name: 'Skip tour' }).click();
  await page.getByLabel('Email').fill('demo@promptqa.test');
  await page.getByLabel('Password').fill('Demo@1234');
  await page.getByRole('button', { name: 'Sign in' }).click();

  // expect on a page element also needs await, because it talks to the browser.
  // It keeps checking until the Logout button appears (or 5 seconds pass).
  // Forget the await here and the test can finish before the check is done.
  await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
});
