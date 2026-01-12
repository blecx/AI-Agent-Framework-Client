/**
 * E2E Test: Apply Proposal Workflow
 * Tests applying proposals through the UI
 */

import { test, expect } from '../fixtures';
import { generateProposalData } from '../helpers/test-data';
import { waitForSuccessToast, switchToTab } from '../helpers/ui-helpers';

test.describe('Apply Proposal', () => {
  test('should apply a proposal successfully', async ({ page, apiHelper, uniqueProjectKey }) => {
    // Setup: Create project and proposal via API
    const projectData = {
      key: uniqueProjectKey,
      name: `Test Project ${Date.now()}`,
    };
    await apiHelper.createProject(projectData.key, projectData.name);

    const proposalData = generateProposalData(projectData.key);
    const proposal = await apiHelper.createProposal(projectData.key, proposalData);

    // Navigate to project
    await page.goto(`/project/${projectData.key}`);
    await page.waitForLoadState('networkidle');

    // Switch to Apply Proposals tab
    await switchToTab(page, 'Apply Proposals');

    // Wait for proposals list to load
    await page.waitForSelector('.apply-panel', { state: 'visible' });

    // Find the proposal in the list
    const proposalItem = page.locator('.proposal-item, [data-proposal-id]').first();
    await expect(proposalItem).toBeVisible({ timeout: 10000 });

    // Click apply button
    const applyButton = proposalItem.locator('button:has-text("Apply")');
    await applyButton.click();

    // Handle confirmation dialog if it appears
    const confirmDialog = page.locator('.confirm-dialog, [role="dialog"]');
    const isDialogVisible = await confirmDialog.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (isDialogVisible) {
      await page.click('button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Apply")');
    }

    // Listen for API call
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes(`/proposals/${proposal.id}/apply`) &&
        response.request().method() === 'POST',
      { timeout: 30000 }
    );

    await responsePromise;

    // Wait for success toast
    await waitForSuccessToast(page, 'applied');

    // Verify the proposal status changed via API
    const updatedProposals = await apiHelper.getProposals(projectData.key);
    const appliedProposal = updatedProposals.find((p: { id: string }) => p.id === proposal.id);
    expect(appliedProposal.status).toBe('applied');
  });

  test('should reject a proposal', async ({ page, apiHelper, uniqueProjectKey }) => {
    // Setup: Create project and proposal via API
    await apiHelper.createProject(uniqueProjectKey, `Test Project ${Date.now()}`);
    const proposalData = generateProposalData(uniqueProjectKey);
    const proposal = await apiHelper.createProposal(uniqueProjectKey, proposalData);

    // Navigate to Apply tab
    await page.goto(`/project/${uniqueProjectKey}`);
    await page.waitForLoadState('networkidle');
    await switchToTab(page, 'Apply Proposals');

    // Wait for proposals list
    await page.waitForSelector('.apply-panel', { state: 'visible' });

    // Find and click reject button
    const proposalItem = page.locator('.proposal-item, [data-proposal-id]').first();
    const rejectButton = proposalItem.locator('button:has-text("Reject")');
    await rejectButton.click();

    // Handle confirmation dialog
    const confirmDialog = page.locator('.confirm-dialog, [role="dialog"]');
    const isDialogVisible = await confirmDialog.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (isDialogVisible) {
      await page.click('button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Reject")');
    }

    // Wait for success
    await waitForSuccessToast(page, 'rejected');

    // Verify via API
    const updatedProposals = await apiHelper.getProposals(uniqueProjectKey);
    const rejectedProposal = updatedProposals.find((p: { id: string }) => p.id === proposal.id);
    expect(rejectedProposal.status).toBe('rejected');
  });

  test('should show empty state when no proposals exist', async ({ page, apiHelper, uniqueProjectKey }) => {
    // Setup: Create project without proposals
    await apiHelper.createProject(uniqueProjectKey, `Test Project ${Date.now()}`);

    // Navigate to Apply tab
    await page.goto(`/project/${uniqueProjectKey}`);
    await page.waitForLoadState('networkidle');
    await switchToTab(page, 'Apply Proposals');

    // Should show empty state
    const emptyState = page.locator('.empty-state, :text("No proposals")');
    await expect(emptyState).toBeVisible({ timeout: 5000 });
  });
});
