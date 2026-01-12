/**
 * E2E Test: Proposal Workflow
 * Tests proposing changes through the UI
 */

import { test, expect } from '../fixtures';
import { generateProposalData } from '../helpers/test-data';
import { waitForSuccessToast, switchToTab } from '../helpers/ui-helpers';

test.describe('Proposal Creation', () => {
  test('should create a proposal successfully', async ({ page, apiHelper, uniqueProjectKey }) => {
    // Setup: Create project via API
    const projectData = {
      key: uniqueProjectKey,
      name: `Test Project ${Date.now()}`,
      description: 'Project for proposal test',
    };
    await apiHelper.createProject(projectData.key, projectData.name, projectData.description);

    // Navigate to project
    await page.goto(`/project/${projectData.key}`);
    await page.waitForLoadState('networkidle');

    // Switch to Propose Changes tab
    await switchToTab(page, 'Propose Changes');

    // Wait for propose panel to load
    await page.waitForSelector('.propose-panel', { state: 'visible' });

    // Generate proposal data
    const proposalData = generateProposalData();

    // Fill in proposal details
    await page.fill('input[placeholder*="title" i], input#title, input[name="title"]', proposalData.title);
    await page.fill(
      'textarea[placeholder*="description" i], textarea#description, textarea[name="description"]',
      proposalData.description
    );

    // Fill in changes JSON
    const changesTextarea = page.locator('textarea').last();
    await changesTextarea.fill(JSON.stringify(proposalData.changes, null, 2));

    // Listen for API call
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes(`/projects/${projectData.key}/proposals`) &&
        response.request().method() === 'POST',
      { timeout: 30000 }
    );

    // Submit proposal
    await page.click('button[type="submit"]:has-text("Submit"), button:has-text("Create Proposal")');

    // Wait for API response
    const response = await responsePromise;
    expect(response.status()).toBe(200);

    // Wait for success message
    await waitForSuccessToast(page, 'Proposal created');

    // Verify proposal ID is shown
    const successMessage = page.locator('.success-message, .toast');
    await expect(successMessage).toBeVisible();

    // Verify via API that proposal was created
    const proposals = await apiHelper.getProposals(projectData.key);
    expect(proposals.length).toBeGreaterThan(0);
    
    const createdProposal = proposals.find((p: { title: string }) => p.title === proposalData.title);
    expect(createdProposal).toBeDefined();
    expect(createdProposal.description).toBe(proposalData.description);
  });

  test('should handle invalid JSON in changes field', async ({ page, apiHelper, uniqueProjectKey }) => {
    // Setup: Create project via API
    await apiHelper.createProject(uniqueProjectKey, `Test Project ${Date.now()}`);

    // Navigate to project propose tab
    await page.goto(`/project/${uniqueProjectKey}`);
    await page.waitForLoadState('networkidle');
    await switchToTab(page, 'Propose Changes');

    // Fill in title and description
    await page.fill('input[placeholder*="title" i], input#title', 'Test Proposal');
    await page.fill('textarea[placeholder*="description" i], textarea#description', 'Test description');

    // Fill in invalid JSON
    const changesTextarea = page.locator('textarea').last();
    await changesTextarea.fill('{invalid json}');

    // Try to submit
    await page.click('button[type="submit"]:has-text("Submit"), button:has-text("Create Proposal")');

    // Should show error message about invalid JSON
    const errorMessage = page.locator('.error-message, .toast-error');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
    await expect(errorMessage).toContainText(/json/i);
  });
});
