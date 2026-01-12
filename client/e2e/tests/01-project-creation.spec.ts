/**
 * E2E Test: Project Creation Workflow
 * Tests creating a project through the UI
 */

import { test, expect } from '../fixtures';
import { createProjectViaUI, waitForSuccessToast } from '../helpers/ui-helpers';

test.describe('Project Creation', () => {
  test('should create a new project successfully', async ({ page, apiHelper, uniqueProjectKey }) => {
    // Generate unique project data
    const projectData = {
      key: uniqueProjectKey,
      name: `Test Project ${Date.now()}`,
      description: 'E2E test project description',
    };

    // Navigate to home page
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check connection status shows connected
    const statusText = page.locator('.nav-status .status-text');
    await expect(statusText).toContainText(/connected/i, { timeout: 10000 });

    // Click on Projects link
    await page.click('nav a[href="/projects"]');
    await page.waitForURL(/\/projects/);

    // Click Create Project button
    await page.click('button:has-text("Create Project")');

    // Wait for form to appear
    await page.waitForSelector('.create-project-form', { state: 'visible' });

    // Fill in project details
    await page.fill('#projectKey', projectData.key);
    await page.fill('#projectName', projectData.name);
    await page.fill('#projectDescription', projectData.description);

    // Listen for API call
    const responsePromise = page.waitForResponse(
      (response) => response.url().includes('/projects') && response.request().method() === 'POST',
      { timeout: 30000 }
    );

    // Submit form
    await page.click('button[type="submit"]:has-text("Create Project")');

    // Wait for API response
    const response = await responsePromise;
    expect(response.status()).toBe(200);

    // Wait for success toast
    await waitForSuccessToast(page, 'created successfully');

    // Verify project appears in the list
    const projectCard = page.locator('.project-card', { hasText: projectData.name });
    await expect(projectCard).toBeVisible();

    // Verify project data is correct
    await expect(projectCard.locator('.project-key')).toContainText(projectData.key);

    // Verify via API that project was created
    const createdProject = await apiHelper.getProject(projectData.key);
    expect(createdProject.key).toBe(projectData.key);
    expect(createdProject.name).toBe(projectData.name);
    expect(createdProject.description).toBe(projectData.description);
  });

  test('should show validation error for missing required fields', async ({ page }) => {
    await page.goto('/projects');
    await page.waitForLoadState('networkidle');

    // Click Create Project button
    await page.click('button:has-text("Create Project")');

    // Wait for form
    await page.waitForSelector('.create-project-form', { state: 'visible' });

    // Try to submit without filling required fields
    await page.click('button[type="submit"]:has-text("Create Project")');

    // Form should not submit (HTML5 validation or error message)
    // Check that we're still on the same page with form visible
    await expect(page.locator('.create-project-form')).toBeVisible();
  });

  test('should navigate to project detail page after creation', async ({ page, uniqueProjectKey }) => {
    const projectData = {
      key: uniqueProjectKey,
      name: `Test Navigation ${Date.now()}`,
    };

    await page.goto('/projects');
    await page.waitForLoadState('networkidle');

    // Create project via UI
    await createProjectViaUI(page, projectData);

    // Click on the created project card
    const projectCard = page.locator('.project-card', { hasText: projectData.name });
    await projectCard.click();

    // Should navigate to project detail page
    await page.waitForURL(new RegExp(`/project/${projectData.key}`));

    // Verify project details are shown
    await expect(page.locator('h1')).toContainText(projectData.name);
    await expect(page.locator('.project-key')).toContainText(projectData.key);
  });
});
