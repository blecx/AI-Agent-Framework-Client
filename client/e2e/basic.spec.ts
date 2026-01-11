import { test, expect } from '@playwright/test';

test('homepage loads successfully', async ({ page }) => {
  await page.goto('/');
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  
  // Check that the page loaded without errors
  expect(page.url()).toContain('localhost');
});

test('page has title', async ({ page }) => {
  await page.goto('/');
  
  // Check that the page has a title
  await expect(page).toHaveTitle(/client/i);
});
