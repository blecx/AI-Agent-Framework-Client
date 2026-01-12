/**
 * UI interaction helpers for E2E tests
 * Provides reusable functions for common UI interactions
 */

import { Page, expect } from '@playwright/test';

/**
 * Wait for navigation to complete
 */
export async function waitForNavigation(page: Page, url: string | RegExp) {
  await page.waitForURL(url);
  await page.waitForLoadState('networkidle');
}

/**
 * Navigate to projects page
 */
export async function navigateToProjects(page: Page) {
  await page.click('nav a[href="/projects"]');
  await waitForNavigation(page, /\/projects/);
}

/**
 * Navigate to a specific project
 */
export async function navigateToProject(page: Page, projectKey: string) {
  await page.goto(`/project/${projectKey}`);
  await page.waitForLoadState('networkidle');
}

/**
 * Wait for toast message to appear
 */
export async function waitForToast(page: Page, expectedText?: string) {
  const toast = page.locator('.toast');
  await toast.waitFor({ state: 'visible', timeout: 10000 });
  
  if (expectedText) {
    await expect(toast).toContainText(expectedText);
  }
  
  return toast;
}

/**
 * Wait for success toast
 */
export async function waitForSuccessToast(page: Page, expectedText?: string) {
  const toast = page.locator('.toast.success, .toast.toast-success');
  await toast.waitFor({ state: 'visible', timeout: 10000 });
  
  if (expectedText) {
    await expect(toast).toContainText(expectedText);
  }
  
  return toast;
}

/**
 * Wait for error toast
 */
export async function waitForErrorToast(page: Page, expectedText?: string) {
  const toast = page.locator('.toast.error, .toast.toast-error');
  await toast.waitFor({ state: 'visible', timeout: 10000 });
  
  if (expectedText) {
    await expect(toast).toContainText(expectedText);
  }
  
  return toast;
}

/**
 * Fill form field by label
 */
export async function fillFormField(page: Page, label: string, value: string) {
  const input = page.locator(`input:below(:text("${label}"))`).first();
  await input.fill(value);
}

/**
 * Click button by text
 */
export async function clickButton(page: Page, text: string) {
  await page.click(`button:has-text("${text}")`);
}

/**
 * Wait for API call to complete
 */
export async function waitForApiCall(
  page: Page,
  urlPattern: string | RegExp,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET'
) {
  return await page.waitForResponse(
    (response) =>
      response.url().match(urlPattern) !== null &&
      response.request().method() === method,
    { timeout: 30000 }
  );
}

/**
 * Check connection status in navigation
 */
export async function checkConnectionStatus(page: Page, expectedStatus: 'connected' | 'disconnected' | 'checking') {
  const statusIndicator = page.locator('.nav-status .status-text');
  await expect(statusIndicator).toContainText(expectedStatus, { ignoreCase: true });
}

/**
 * Create project via UI
 */
export async function createProjectViaUI(
  page: Page,
  projectData: { key: string; name: string; description?: string }
) {
  // Navigate to projects page
  await navigateToProjects(page);
  
  // Click create project button
  await clickButton(page, 'Create Project');
  
  // Wait for form to appear
  await page.waitForSelector('.create-project-form', { state: 'visible' });
  
  // Fill in project details
  await page.fill('#projectKey', projectData.key);
  await page.fill('#projectName', projectData.name);
  
  if (projectData.description) {
    await page.fill('#projectDescription', projectData.description);
  }
  
  // Submit form
  const responsePromise = waitForApiCall(page, /\/projects$/, 'POST');
  await page.click('button[type="submit"]:has-text("Create Project")');
  await responsePromise;
  
  // Wait for success toast
  await waitForSuccessToast(page);
}

/**
 * Switch to a tab in project view
 */
export async function switchToTab(page: Page, tabName: string) {
  await page.click(`.project-tabs button:has-text("${tabName}")`);
  await page.waitForTimeout(500); // Small wait for tab content to render
}
