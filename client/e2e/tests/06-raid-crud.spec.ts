/**
 * E2E Test: RAID CRUD Operations
 * Tests creating, reading, updating, and deleting RAID items through the UI
 */

import { test, expect } from '../fixtures';
import {
  navigateToProject,
  waitForSuccessToast,
  waitForErrorToast,
} from '../helpers/ui-helpers';

test.describe('RAID CRUD Operations', () => {
  let projectKey: string;
  let projectName: string;

  // Setup: Create a project before all tests
  test.beforeEach(async ({ apiHelper, uniqueProjectKey }) => {
    projectKey = uniqueProjectKey;
    projectName = `Test Project ${Date.now()}`;

    // Create project via API
    await apiHelper.createProject(
      projectKey,
      projectName,
      'E2E test project for RAID operations',
    );
  });

  test('should create a new RAID risk item', async ({ page, apiHelper }) => {
    // Navigate to project
    await navigateToProject(page, projectKey);

    // Click on RAID tab/link
    await page.click('text=RAID');
    await page.waitForLoadState('networkidle');

    // Click Create/Add RAID Item button
    await page.click('button:has-text("Add"), button:has-text("Create RAID")');

    // Wait for form modal to appear
    await page.waitForSelector('.raid-form, .modal:has-text("Create RAID")', {
      state: 'visible',
    });

    // Fill in RAID item details
    await page.selectOption('select#type, select[name="type"]', 'risk');
    await page.fill('input#title, input[name="title"]', 'Test Risk Item');
    await page.fill(
      'textarea#description, textarea[name="description"]',
      'This is a test risk for E2E testing',
    );
    await page.selectOption('select#priority, select[name="priority"]', 'high');
    await page.fill('input#owner, input[name="owner"]', 'e2e-tester');

    // Submit the form
    await page.click(
      'button[type="submit"]:has-text("Create"), button:has-text("Save")',
    );

    // Wait for success toast
    await waitForSuccessToast(page);

    // Verify the RAID item appears in the list
    const raidItem = page.locator('.raid-item, .raid-card', {
      hasText: 'Test Risk Item',
    });
    await expect(raidItem).toBeVisible({ timeout: 10000 });

    // Verify item details are correct
    await expect(raidItem).toContainText('risk');
    await expect(raidItem).toContainText('high');

    // Verify via API that item was created
    const raidList = await apiHelper.getRAIDItems(projectKey);
    const createdItem = raidList.items.find(
      (item: { title: string }) => item.title === 'Test Risk Item',
    );
    expect(createdItem).toBeDefined();
    expect(createdItem.type).toBe('risk');
    expect(createdItem.priority).toBe('high');
  });

  test('should view RAID item details', async ({ page, apiHelper }) => {
    // Create a RAID item via API first
    const raidItem = await apiHelper.createRAIDItem(projectKey, {
      type: 'issue',
      title: 'Test Issue for Viewing',
      description: 'Detailed description of the test issue',
      priority: 'medium',
      owner: 'test-owner',
    });

    // Navigate to project RAID page
    await navigateToProject(page, projectKey);
    await page.click('text=RAID');
    await page.waitForLoadState('networkidle');

    // Click on the RAID item to view details
    await page.click(`text=${raidItem.title}`);

    // Wait for details panel/modal to appear
    await page.waitForSelector('.raid-detail, .modal:has-text("Test Issue")', {
      state: 'visible',
    });

    // Verify all details are displayed
    await expect(page.locator('.raid-detail, .modal')).toContainText(
      'Test Issue for Viewing',
    );
    await expect(page.locator('.raid-detail, .modal')).toContainText(
      'Detailed description of the test issue',
    );
    await expect(page.locator('.raid-detail, .modal')).toContainText('issue');
    await expect(page.locator('.raid-detail, .modal')).toContainText('medium');
    await expect(page.locator('.raid-detail, .modal')).toContainText(
      'test-owner',
    );
  });

  test('should update a RAID item', async ({ page, apiHelper }) => {
    // Create a RAID item via API
    const raidItem = await apiHelper.createRAIDItem(projectKey, {
      type: 'assumption',
      title: 'Original Assumption Title',
      description: 'Original description',
      priority: 'low',
      owner: 'original-owner',
    });

    // Navigate to project RAID page
    await navigateToProject(page, projectKey);
    await page.click('text=RAID');
    await page.waitForLoadState('networkidle');

    // Click on the RAID item
    await page.click(`text=${raidItem.title}`);

    // Wait for details and click Edit button
    await page.waitForSelector('.raid-detail, .modal');
    await page.click('button:has-text("Edit")');

    // Wait for edit form
    await page.waitForSelector('.raid-form, form:has-text("Edit")', {
      state: 'visible',
    });

    // Update fields
    await page.fill(
      'input#title, input[name="title"]',
      'Updated Assumption Title',
    );
    await page.fill(
      'textarea#description, textarea[name="description"]',
      'Updated description with new details',
    );
    await page.selectOption('select#priority, select[name="priority"]', 'high');
    await page.fill('input#owner, input[name="owner"]', 'updated-owner');

    // Save changes
    await page.click(
      'button[type="submit"]:has-text("Save"), button:has-text("Update")',
    );

    // Wait for success toast
    await waitForSuccessToast(page);

    // Verify updates appear in UI
    await expect(page.locator('.raid-detail, .modal')).toContainText(
      'Updated Assumption Title',
    );
    await expect(page.locator('.raid-detail, .modal')).toContainText(
      'Updated description with new details',
    );
    await expect(page.locator('.raid-detail, .modal')).toContainText('high');

    // Verify via API
    const updatedItem = await apiHelper.getRAIDItem(projectKey, raidItem.id);
    expect(updatedItem.title).toBe('Updated Assumption Title');
    expect(updatedItem.description).toBe(
      'Updated description with new details',
    );
    expect(updatedItem.priority).toBe('high');
  });

  test('should delete a RAID item', async ({ page, apiHelper }) => {
    // Create a RAID item via API
    const raidItem = await apiHelper.createRAIDItem(projectKey, {
      type: 'dependency',
      title: 'Item to Delete',
      description: 'This item will be deleted',
      priority: 'medium',
    });

    // Navigate to project RAID page
    await navigateToProject(page, projectKey);
    await page.click('text=RAID');
    await page.waitForLoadState('networkidle');

    // Verify item exists
    await expect(page.locator('text=Item to Delete')).toBeVisible();

    // Click on the item
    await page.click('text=Item to Delete');

    // Wait for details and click Delete button
    await page.waitForSelector('.raid-detail, .modal');
    await page.click('button:has-text("Delete")');

    // Confirm deletion in confirmation dialog
    await page.waitForSelector(
      '.confirm-dialog, [role="dialog"]:has-text("Delete")',
    );
    await page.click(
      '.confirm-dialog button:has-text("Delete"), button:has-text("Confirm")',
    );

    // Wait for success toast
    await waitForSuccessToast(page);

    // Verify item is removed from list
    await expect(page.locator('text=Item to Delete')).not.toBeVisible({
      timeout: 5000,
    });

    // Verify via API that item was deleted
    const raidList = await apiHelper.getRAIDItems(projectKey);
    const deletedItem = raidList.items.find(
      (item: { id: string }) => item.id === raidItem.id,
    );
    expect(deletedItem).toBeUndefined();
  });

  test('should filter RAID items by type', async ({ page, apiHelper }) => {
    // Create multiple RAID items of different types
    await apiHelper.createRAIDItem(projectKey, {
      type: 'risk',
      title: 'Test Risk',
      description: 'Risk description',
    });
    await apiHelper.createRAIDItem(projectKey, {
      type: 'issue',
      title: 'Test Issue',
      description: 'Issue description',
    });
    await apiHelper.createRAIDItem(projectKey, {
      type: 'assumption',
      title: 'Test Assumption',
      description: 'Assumption description',
    });

    // Navigate to project RAID page
    await navigateToProject(page, projectKey);
    await page.click('text=RAID');
    await page.waitForLoadState('networkidle');

    // Verify all items are visible initially
    await expect(page.locator('text=Test Risk')).toBeVisible();
    await expect(page.locator('text=Test Issue')).toBeVisible();
    await expect(page.locator('text=Test Assumption')).toBeVisible();

    // Apply filter for "risk" type
    await page.selectOption(
      'select[name="type"], select:has-text("Type")',
      'risk',
    );
    await page.waitForLoadState('networkidle');

    // Verify only risk is visible
    await expect(page.locator('text=Test Risk')).toBeVisible();
    await expect(page.locator('text=Test Issue')).not.toBeVisible();
    await expect(page.locator('text=Test Assumption')).not.toBeVisible();

    // Apply filter for "issue" type
    await page.selectOption(
      'select[name="type"], select:has-text("Type")',
      'issue',
    );
    await page.waitForLoadState('networkidle');

    // Verify only issue is visible
    await expect(page.locator('text=Test Issue')).toBeVisible();
    await expect(page.locator('text=Test Risk')).not.toBeVisible();
    await expect(page.locator('text=Test Assumption')).not.toBeVisible();
  });

  test('should filter RAID items by priority', async ({ page, apiHelper }) => {
    // Create items with different priorities
    await apiHelper.createRAIDItem(projectKey, {
      type: 'risk',
      title: 'High Priority Risk',
      description: 'Critical risk',
      priority: 'high',
    });
    await apiHelper.createRAIDItem(projectKey, {
      type: 'issue',
      title: 'Low Priority Issue',
      description: 'Minor issue',
      priority: 'low',
    });

    // Navigate to project RAID page
    await navigateToProject(page, projectKey);
    await page.click('text=RAID');
    await page.waitForLoadState('networkidle');

    // Apply filter for high priority
    await page.selectOption(
      'select[name="priority"], select:has-text("Priority")',
      'high',
    );
    await page.waitForLoadState('networkidle');

    // Verify only high priority item is visible
    await expect(page.locator('text=High Priority Risk')).toBeVisible();
    await expect(page.locator('text=Low Priority Issue')).not.toBeVisible();
  });

  test('should show validation error for missing required fields', async ({
    page,
  }) => {
    // Navigate to project
    await navigateToProject(page, projectKey);
    await page.click('text=RAID');
    await page.waitForLoadState('networkidle');

    // Open create form
    await page.click('button:has-text("Add"), button:has-text("Create RAID")');
    await page.waitForSelector('.raid-form, .modal', { state: 'visible' });

    // Try to submit without filling required fields
    await page.click(
      'button[type="submit"]:has-text("Create"), button:has-text("Save")',
    );

    // Check for validation errors
    const errorMessage = page.locator(
      '.error, .validation-error, [class*="error"]',
    );
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test('should handle network errors gracefully', async ({
    page,
    apiHelper,
  }) => {
    // Create a RAID item
    await apiHelper.createRAIDItem(projectKey, {
      type: 'risk',
      title: 'Network Test Risk',
      description: 'Testing network error handling',
    });

    // Navigate to project RAID page
    await navigateToProject(page, projectKey);
    await page.click('text=RAID');
    await page.waitForLoadState('networkidle');

    // Simulate network failure by going offline
    await page.context().setOffline(true);

    // Try to create a new item (should fail)
    await page.click('button:has-text("Add"), button:has-text("Create RAID")');
    await page.waitForSelector('.raid-form, .modal', { state: 'visible' });
    await page.selectOption('select#type, select[name="type"]', 'issue');
    await page.fill('input#title, input[name="title"]', 'Offline Test');
    await page.fill(
      'textarea#description, textarea[name="description"]',
      'This should fail',
    );
    await page.click(
      'button[type="submit"]:has-text("Create"), button:has-text("Save")',
    );

    // Verify error is shown
    await waitForErrorToast(page);

    // Restore network
    await page.context().setOffline(false);
  });
});
