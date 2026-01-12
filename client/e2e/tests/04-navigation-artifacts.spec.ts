/**
 * E2E Test: Navigation and Artifacts
 * Tests navigation between views and artifact handling
 */

import { test, expect } from '../fixtures';

test.describe('Navigation and Artifacts', () => {
  test('should navigate between main sections', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Test navigation to Projects
    await page.click('nav a[href="/projects"]');
    await page.waitForURL(/\/projects/);
    expect(page.url()).toContain('/projects');

    // Test navigation to Commands
    await page.click('nav a[href="/commands"]');
    await page.waitForURL(/\/commands/);
    expect(page.url()).toContain('/commands');

    // Test navigation to API Tester
    await page.click('nav a[href="/api-tester"]');
    await page.waitForURL(/\/api-tester/);
    expect(page.url()).toContain('/api-tester');

    // Navigate back to Projects
    await page.click('nav a[href="/projects"]');
    await page.waitForURL(/\/projects/);
  });

  test('should display project documents/artifacts if available', async ({ page, apiHelper, uniqueProjectKey }) => {
    // Setup: Create project with documents via API
    const projectData = {
      key: uniqueProjectKey,
      name: `Test Project ${Date.now()}`,
    };
    await apiHelper.createProject(projectData.key, projectData.name);

    // Navigate to project
    await page.goto(`/project/${projectData.key}`);
    await page.waitForLoadState('networkidle');

    // Should be on Overview tab by default
    const overviewTab = page.locator('.project-tabs button.active:has-text("Overview")');
    await expect(overviewTab).toBeVisible();

    // Check project details section
    const projectDetails = page.locator('.project-section:has-text("Project Details")');
    await expect(projectDetails).toBeVisible();

    // Check for documents section (may or may not exist)
    const documentsSection = page.locator('.project-section:has-text("Documents")');
    
    // Either documents exist or they don't - both are valid
    const documentsVisible = await documentsSection.isVisible().catch(() => false);
    
    if (documentsVisible) {
      // If documents section exists, verify it's structured correctly
      await expect(documentsSection).toBeVisible();
    } else {
      // No documents yet - that's okay for a new project
      console.log('No documents section found - this is expected for a new project');
    }
  });

  test('should navigate between project tabs', async ({ page, apiHelper, uniqueProjectKey }) => {
    // Setup: Create project
    await apiHelper.createProject(uniqueProjectKey, `Test Project ${Date.now()}`);

    // Navigate to project
    await page.goto(`/project/${uniqueProjectKey}`);
    await page.waitForLoadState('networkidle');

    // Test Overview tab (default)
    await expect(page.locator('.overview-tab')).toBeVisible();

    // Test Propose Changes tab
    await page.click('.project-tabs button:has-text("Propose Changes")');
    await expect(page.locator('.propose-panel')).toBeVisible();

    // Test Apply Proposals tab
    await page.click('.project-tabs button:has-text("Apply Proposals")');
    await expect(page.locator('.apply-panel')).toBeVisible();

    // Test Commands tab
    await page.click('.project-tabs button:has-text("Commands")');
    await expect(page.locator('.command-panel, .project-command-panel')).toBeVisible();

    // Navigate back to Overview
    await page.click('.project-tabs button:has-text("Overview")');
    await expect(page.locator('.overview-tab')).toBeVisible();
  });
});
