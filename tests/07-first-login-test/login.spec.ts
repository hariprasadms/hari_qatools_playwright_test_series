import { test, expect } from '@playwright/test';

// Lesson 07 - your first real test: login
// Demo user: demo@promptqa.test / Demo@1234

test('Login with valid credentials', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Skip tour' }).click(); // close the welcome popup
  await page.getByLabel('Email').fill('demo@promptqa.test');
  await page.getByLabel('Password').fill('Demo@1234');
  await page.getByRole('button', { name: 'Sign in' }).click();

  // after login we land on the home page and see the Logout button
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
  await page.getByRole('button', { name: 'Logout' }).click();

  // after logout: Sign in link is back, Logout button is gone
  await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Logout' })).toHaveCount(0);
});
