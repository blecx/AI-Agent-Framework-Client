/**
 * Step 2 E2E Test Helpers
 * Utilities for artifact, proposal, and audit testing
 */

import { Page, expect } from '@playwright/test';

/**
 * Navigate to artifact editor for a specific artifact
 */
export async function navigateToArtifactEditor(
  page: Page,
  projectKey: string,
  artifactType: string,
  artifactId: string,
) {
  await page.goto(
    `/projects/${projectKey}/artifacts/${artifactType}/${artifactId}`,
  );
  await page.waitForLoadState('networkidle');

  // Wait for editor to load
  const editor = page.locator(
    '.artifact-editor, [data-testid="artifact-editor"]',
  );
  await expect(editor).toBeVisible({ timeout: 10000 });
}

/**
 * Fill artifact form field
 */
export async function fillArtifactField(
  page: Page,
  fieldName: string,
  value: string,
) {
  const field = page.locator(
    `[name="${fieldName}"], [data-field="${fieldName}"], #${fieldName}`,
  );
  await field.fill(value);
}

/**
 * Save artifact form
 */
export async function saveArtifact(page: Page) {
  const saveButton = page.locator(
    'button:has-text("Save"), button[type="submit"]',
  );
  await saveButton.click();

  // Wait for success indication
  const successIndicator = page.locator(
    '.toast, .success-message, [data-testid="success"]',
  );
  await expect(successIndicator).toBeVisible({ timeout: 10000 });
}

/**
 * Navigate to artifact list
 */
export async function navigateToArtifactList(page: Page, projectKey: string) {
  await page.goto(`/projects/${projectKey}/artifacts`);
  await page.waitForLoadState('networkidle');

  const listContainer = page.locator(
    '.artifact-list, [data-testid="artifact-list"]',
  );
  await expect(listContainer).toBeVisible({ timeout: 10000 });
}

/**
 * Filter artifacts by type
 */
export async function filterArtifactsByType(page: Page, artifactType: string) {
  const filterSelect = page.locator(
    'select[data-testid="artifact-type-filter"], .filter-select',
  );
  await filterSelect.selectOption(artifactType);
  await page.waitForLoadState('networkidle');
}

/**
 * Create proposal via UI
 */
export async function createProposalViaUI(
  page: Page,
  projectKey: string,
  title: string,
  changes: Record<string, unknown>,
) {
  // Navigate to propose panel
  await page.goto(`/project/${projectKey}`);
  await page.waitForLoadState('networkidle');

  // Click Propose Changes tab
  const proposeTab = page.locator('button:has-text("Propose Changes")');
  await proposeTab.click();

  // Wait for propose panel
  await page.waitForSelector('.propose-panel', {
    state: 'visible',
    timeout: 10000,
  });

  // Fill in form
  const titleInput = page.locator('input[name="title"], input#title');
  await titleInput.fill(title);

  const changesTextarea = page.locator(
    '[data-testid="proposal-changes-json"], textarea',
  );
  await changesTextarea.fill(JSON.stringify(changes, null, 2));

  // Submit
  const submitButton = page.locator(
    'button:has-text("Submit"), button:has-text("Create")',
  );

  // Setup response listener
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().includes('/proposals') &&
      response.request().method() === 'POST',
    { timeout: 30000 },
  );

  await submitButton.click();
  await responsePromise;

  // Wait for success
  const successToast = page.locator('.toast, .success-message');
  await expect(successToast).toBeVisible({ timeout: 10000 });
}

/**
 * Apply proposal via UI
 */
export async function applyProposalViaUI(page: Page, proposalId: string) {
  // Find proposal in list
  const proposalItem = page
    .locator(`[data-proposal-id="${proposalId}"], .proposal-item`)
    .first();
  await expect(proposalItem).toBeVisible({ timeout: 10000 });

  // Setup response listener
  const responsePromise = page
    .waitForResponse(
      (response) =>
        response.url().includes(`/proposals/${proposalId}/apply`) &&
        response.request().method() === 'POST',
      { timeout: 30000 },
    )
    .catch(() => null);

  // Click apply button
  const applyButton = proposalItem.locator('button:has-text("Apply")');
  await applyButton.click();

  // Handle confirmation dialog
  const confirmDialog = page.locator('.confirm-dialog, [role="dialog"]');
  const hasDialog = await confirmDialog
    .isVisible({ timeout: 2000 })
    .catch(() => false);

  if (hasDialog) {
    const confirmButton = confirmDialog.locator(
      'button:has-text("Confirm"), button:has-text("Yes")',
    );
    await confirmButton.click();
  }

  // Wait for response
  await responsePromise;

  // Verify success
  const successIndicator = page.locator('.toast, .success-message');
  await expect(successIndicator).toBeVisible({ timeout: 10000 });
}

/**
 * Reject proposal via UI
 */
export async function rejectProposalViaUI(
  page: Page,
  proposalId: string,
  reason: string,
) {
  // Setup dialog handler for reject reason prompt
  page.on('dialog', async (dialog) => {
    if (dialog.type() === 'prompt') {
      await dialog.accept(reason);
    } else {
      await dialog.accept();
    }
  });

  // Find proposal in list
  const proposalItem = page
    .locator(`[data-proposal-id="${proposalId}"], .proposal-item`)
    .first();
  await expect(proposalItem).toBeVisible({ timeout: 10000 });

  // Setup response listener
  const responsePromise = page
    .waitForResponse(
      (response) =>
        response.url().includes(`/proposals/${proposalId}/reject`) &&
        response.request().method() === 'POST',
      { timeout: 30000 },
    )
    .catch(() => null);

  // Click reject button
  const rejectButton = proposalItem.locator('button:has-text("Reject")');
  await rejectButton.click();

  await responsePromise;

  // Verify rejection status
  const rejectedStatus = page.locator(
    '[data-status="rejected"], .status-rejected, text=/rejected/i',
  );
  await expect(rejectedStatus.first()).toBeVisible({ timeout: 10000 });
}

/**
 * Navigate to audit viewer
 */
export async function navigateToAuditViewer(page: Page, projectKey: string) {
  await page.goto(`/projects/${projectKey}/audit`);
  await page.waitForLoadState('networkidle');

  const auditViewer = page.locator(
    '.audit-viewer, [data-testid="audit-viewer"]',
  );
  await expect(auditViewer).toBeVisible({ timeout: 10000 });
}

/**
 * Filter audit results by severity
 */
export async function filterAuditBySeverity(
  page: Page,
  severity: 'all' | 'error' | 'warning' | 'info',
) {
  const severityFilter = page.locator(
    'select[data-testid="severity-filter"], .severity-filter select',
  );
  await severityFilter.selectOption(severity);
  await page.waitForTimeout(500); // Allow UI to update
}

/**
 * Get audit item count
 */
export async function getAuditItemCount(page: Page): Promise<number> {
  const auditItems = page.locator('.audit-item, [data-testid="audit-item"]');
  return await auditItems.count();
}

/**
 * Click audit item link (to navigate to referenced artifact)
 */
export async function clickAuditItemLink(page: Page, index: number = 0) {
  const auditItems = page.locator('.audit-item, [data-testid="audit-item"]');
  const item = auditItems.nth(index);

  const link = item.locator('a, button').first();
  await link.click();
  await page.waitForLoadState('networkidle');
}

/**
 * Verify proposal appears in list
 */
export async function verifyProposalInList(
  page: Page,
  projectKey: string,
  proposalTitle: string,
) {
  await page.goto(`/project/${projectKey}`);
  await page.waitForLoadState('networkidle');

  // Navigate to apply proposals tab
  const applyTab = page.locator('button:has-text("Apply Proposals")');
  await applyTab.click();

  await page.waitForSelector('.apply-panel', {
    state: 'visible',
    timeout: 10000,
  });

  // Check for proposal title
  const titleElement = page.locator(`text=/${proposalTitle}/i`);
  await expect(titleElement).toBeVisible({ timeout: 10000 });
}

/**
 * Wait for artifact to be saved
 */
export async function waitForArtifactSave(page: Page) {
  // Wait for save API call to complete
  const responsePromise = page
    .waitForResponse(
      (response) =>
        response.url().includes('/artifacts') &&
        (response.request().method() === 'POST' ||
          response.request().method() === 'PUT'),
      { timeout: 30000 },
    )
    .catch(() => null);

  await responsePromise;

  // Verify success indication
  const successIndicator = page.locator(
    '.toast, .success-message, [data-testid="success"]',
  );
  await expect(successIndicator).toBeVisible({ timeout: 10000 });
}

/**
 * Get proposal status
 */
export async function getProposalStatus(
  page: Page,
  proposalId: string,
): Promise<string> {
  const proposalItem = page
    .locator(`[data-proposal-id="${proposalId}"], .proposal-item`)
    .first();
  const statusBadge = proposalItem.locator(
    '[data-status], .status-badge, .proposal-status',
  );

  return (
    (await statusBadge.getAttribute('data-status')) ||
    (await statusBadge.textContent()) ||
    'unknown'
  );
}
