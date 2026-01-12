/**
 * E2E Test: Error Handling
 * Tests error scenarios and edge cases
 */

import { test, expect } from '../fixtures';
import { waitForErrorToast } from '../helpers/ui-helpers';

test.describe('Error Handling', () => {
  test('should handle API connection errors gracefully', async ({ page }) => {
    // Note: This test assumes the API is running. To test disconnection,
    // you would need to stop the API or use network interception.
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // The app should show connection status
    const connectionStatus = page.locator('.nav-status');
    await expect(connectionStatus).toBeVisible();

    // Status should eventually show connected if API is running
    const statusText = page.locator('.nav-status .status-text');
    await expect(statusText).toContainText(/connected|checking/i, { timeout: 15000 });
  });

  test('should handle navigation to non-existent project', async ({ page }) => {
    const nonExistentKey = `non-existent-${Date.now()}`;
    
    // Navigate to a project that doesn't exist
    await page.goto(`/project/${nonExistentKey}`);
    await page.waitForLoadState('networkidle');

    // Should show error message
    const errorMessage = page.locator('.error, .error-message');
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
    
    // Error should mention loading or not found
    await expect(errorMessage).toContainText(/error|not found|failed/i);

    // Should have a way to go back
    const backButton = page.locator('button:has-text("Back")');
    await expect(backButton).toBeVisible();
  });

  test('should validate required fields in project creation', async ({ page }) => {
    await page.goto('/projects');
    await page.waitForLoadState('networkidle');

    // Open create form
    await page.click('button:has-text("Create Project")');
    await page.waitForSelector('.create-project-form', { state: 'visible' });

    // Try to submit empty form
    await page.click('button[type="submit"]:has-text("Create Project")');

    // Form should remain visible (HTML5 validation prevents submission)
    await expect(page.locator('.create-project-form')).toBeVisible();

    // Fill only project key (missing name)
    await page.fill('#projectKey', `test-${Date.now()}`);
    await page.click('button[type="submit"]:has-text("Create Project")');

    // Form should still be visible
    await expect(page.locator('.create-project-form')).toBeVisible();
  });

  test('should handle duplicate project key error', async ({ page, apiHelper, uniqueProjectKey }) => {
    // Create a project via API first
    const projectName = `Test Project ${Date.now()}`;
    await apiHelper.createProject(uniqueProjectKey, projectName);

    // Try to create a project with the same key via UI
    await page.goto('/projects');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Create Project")');
    await page.waitForSelector('.create-project-form', { state: 'visible' });

    await page.fill('#projectKey', uniqueProjectKey);
    await page.fill('#projectName', 'Another Project');
    await page.click('button[type="submit"]:has-text("Create Project")');

    // Should show error about duplicate or conflict
    await waitForErrorToast(page);
    const errorToast = page.locator('.toast-error, .error-message');
    await expect(errorToast).toContainText(/already exists|duplicate|conflict/i);
  });

  test('should handle empty proposal list gracefully', async ({ page, apiHelper, uniqueProjectKey }) => {
    // Create project without proposals
    await apiHelper.createProject(uniqueProjectKey, `Test Project ${Date.now()}`);

    await page.goto(`/project/${uniqueProjectKey}`);
    await page.waitForLoadState('networkidle');

    // Go to Apply Proposals tab
    await page.click('.project-tabs button:has-text("Apply Proposals")');

    // Should show empty state message
    const emptyState = page.locator('.empty-state, :text("No proposals")');
    await expect(emptyState).toBeVisible({ timeout: 5000 });
  });

  test('should handle cancel action in create project form', async ({ page }) => {
    await page.goto('/projects');
    await page.waitForLoadState('networkidle');

    // Open create form
    await page.click('button:has-text("Create Project")');
    await page.waitForSelector('.create-project-form', { state: 'visible' });

    // Fill in some data
    await page.fill('#projectKey', `test-cancel-${Date.now()}`);
    await page.fill('#projectName', 'Test Project');

    // Click Cancel
    await page.click('button:has-text("Cancel")');

    // Form should close
    await expect(page.locator('.create-project-form')).not.toBeVisible();

    // Should still be on projects page
    expect(page.url()).toContain('/projects');
  });

  test('should show appropriate message when API is slow to respond', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate to projects
    await page.click('nav a[href="/projects"]');
    await page.waitForURL(/\/projects/);

    // Should show loading state initially if projects take time to load
    // Either loading indicator or projects list should appear
    const loadingOrProjects = page.locator('.loading, .projects-grid, .empty-state');
    await expect(loadingOrProjects).toBeVisible({ timeout: 10000 });
  });
});
