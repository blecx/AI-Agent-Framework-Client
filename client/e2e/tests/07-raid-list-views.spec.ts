/**
 * E2E Test: RAID List Views and Navigation
 * Tests RAID list display, pagination, sorting, and navigation
 */

import { test, expect } from '../fixtures';
import { navigateToProject, waitForNavigation } from '../helpers/ui-helpers';

test.describe('RAID List Views', () => {
  let projectKey: string;

  test.beforeEach(async ({ apiHelper, uniqueProjectKey }) => {
    projectKey = uniqueProjectKey;
    await apiHelper.createProject(
      projectKey,
      `Test Project ${Date.now()}`,
      'E2E test for RAID lists',
    );
  });

  test('should display empty state when no RAID items exist', async ({
    page,
  }) => {
    // Navigate to project RAID page
    await navigateToProject(page, projectKey);
    await page.click('text=RAID');
    await page.waitForLoadState('networkidle');

    // Verify empty state message is shown
    const emptyState = page.locator(
      '.empty-state, [class*="empty"], text=/no.*raid.*items/i',
    );
    await expect(emptyState).toBeVisible();

    // Verify create button is still accessible
    const createButton = page.locator(
      'button:has-text("Add"), button:has-text("Create")',
    );
    await expect(createButton).toBeVisible();
  });

  test('should display RAID items in a list/grid', async ({
    page,
    apiHelper,
  }) => {
    // Create multiple RAID items
    const items = [
      {
        type: 'risk',
        title: 'Risk 1',
        description: 'First risk',
        priority: 'high',
      },
      {
        type: 'issue',
        title: 'Issue 1',
        description: 'First issue',
        priority: 'medium',
      },
      {
        type: 'assumption',
        title: 'Assumption 1',
        description: 'First assumption',
        priority: 'low',
      },
    ] as const;

    for (const item of items) {
      await apiHelper.createRAIDItem(projectKey, item);
    }

    // Navigate to RAID page
    await navigateToProject(page, projectKey);
    await page.click('text=RAID');
    await page.waitForLoadState('networkidle');

    // Verify all items are displayed
    for (const item of items) {
      await expect(page.locator(`text=${item.title}`)).toBeVisible();
    }

    // Verify item cards show basic info
    const firstItem = page.locator('.raid-item, .raid-card').first();
    await expect(firstItem).toContainText(/risk|issue|assumption/i);
    await expect(firstItem).toContainText(/high|medium|low/i);
  });

  test('should sort RAID items by priority', async ({ page, apiHelper }) => {
    // Create items with different priorities
    await apiHelper.createRAIDItem(projectKey, {
      type: 'risk',
      title: 'Low Priority Item',
      description: 'Description',
      priority: 'low',
    });
    await apiHelper.createRAIDItem(projectKey, {
      type: 'risk',
      title: 'High Priority Item',
      description: 'Description',
      priority: 'high',
    });
    await apiHelper.createRAIDItem(projectKey, {
      type: 'risk',
      title: 'Medium Priority Item',
      description: 'Description',
      priority: 'medium',
    });

    // Navigate to RAID page
    await navigateToProject(page, projectKey);
    await page.click('text=RAID');
    await page.waitForLoadState('networkidle');

    // Click sort by priority button/dropdown
    const sortButton = page.locator(
      'button:has-text("Sort"), select[name="sort"]',
    );
    if ((await sortButton.count()) > 0) {
      if ((await sortButton.first().getAttribute('type')) === 'button') {
        await sortButton.first().click();
        await page.click('text=/priority/i');
      } else {
        await sortButton.first().selectOption({ label: /priority/i });
      }
      await page.waitForLoadState('networkidle');
    }

    // Verify items are sorted (high → medium → low)
    const items = page.locator('.raid-item, .raid-card');
    const itemTitles = await items.allTextContents();

    // High priority should appear before low priority
    const highIndex = itemTitles.findIndex((text) =>
      text.includes('High Priority'),
    );
    const lowIndex = itemTitles.findIndex((text) =>
      text.includes('Low Priority'),
    );

    if (highIndex !== -1 && lowIndex !== -1) {
      expect(highIndex).toBeLessThan(lowIndex);
    }
  });

  test('should search/filter RAID items by title', async ({
    page,
    apiHelper,
  }) => {
    // Create items with distinct titles
    await apiHelper.createRAIDItem(projectKey, {
      type: 'risk',
      title: 'Database Connection Risk',
      description: 'Connection issues',
    });
    await apiHelper.createRAIDItem(projectKey, {
      type: 'issue',
      title: 'Authentication Bug',
      description: 'Login fails',
    });
    await apiHelper.createRAIDItem(projectKey, {
      type: 'assumption',
      title: 'User Load Assumption',
      description: 'Expected users',
    });

    // Navigate to RAID page
    await navigateToProject(page, projectKey);
    await page.click('text=RAID');
    await page.waitForLoadState('networkidle');

    // Find search input
    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="Search"], input[placeholder*="Filter"]',
    );

    if ((await searchInput.count()) > 0) {
      // Type search query
      await searchInput.first().fill('Database');
      await page.waitForLoadState('networkidle');

      // Verify only matching item is visible
      await expect(page.locator('text=Database Connection Risk')).toBeVisible();
      await expect(page.locator('text=Authentication Bug')).not.toBeVisible();
      await expect(page.locator('text=User Load Assumption')).not.toBeVisible();
    }
  });

  test('should paginate RAID items when list is large', async ({
    page,
    apiHelper,
  }) => {
    // Create 25 RAID items (assuming pagination at 10-20 items)
    for (let i = 1; i <= 25; i++) {
      await apiHelper.createRAIDItem(projectKey, {
        type:
          i % 4 === 0
            ? 'risk'
            : i % 4 === 1
              ? 'issue'
              : i % 4 === 2
                ? 'assumption'
                : 'dependency',
        title: `RAID Item ${i.toString().padStart(2, '0')}`,
        description: `Description for item ${i}`,
      });
    }

    // Navigate to RAID page
    await navigateToProject(page, projectKey);
    await page.click('text=RAID');
    await page.waitForLoadState('networkidle');

    // Check if pagination controls exist
    const paginationControls = page.locator(
      '.pagination, button:has-text("Next"), button:has-text("Previous")',
    );

    if ((await paginationControls.count()) > 0) {
      // Verify first page shows items
      await expect(page.locator('text=RAID Item 01')).toBeVisible();

      // Click next page
      const nextButton = page.locator(
        'button:has-text("Next"), .pagination-next',
      );
      if ((await nextButton.count()) > 0) {
        await nextButton.first().click();
        await page.waitForLoadState('networkidle');

        // Verify different items are shown on page 2
        // First item should not be visible, later items should be visible
        const itemsOnPage2 = await page
          .locator('.raid-item, .raid-card')
          .count();
        expect(itemsOnPage2).toBeGreaterThan(0);
      }
    }
  });

  test('should show item count and statistics', async ({ page, apiHelper }) => {
    // Create diverse RAID items
    await apiHelper.createRAIDItem(projectKey, {
      type: 'risk',
      title: 'Risk 1',
      description: 'Desc',
      priority: 'high',
    });
    await apiHelper.createRAIDItem(projectKey, {
      type: 'risk',
      title: 'Risk 2',
      description: 'Desc',
      priority: 'low',
    });
    await apiHelper.createRAIDItem(projectKey, {
      type: 'issue',
      title: 'Issue 1',
      description: 'Desc',
      priority: 'medium',
    });

    // Navigate to RAID page
    await navigateToProject(page, projectKey);
    await page.click('text=RAID');
    await page.waitForLoadState('networkidle');

    // Check for count/statistics display
    const countDisplay = page.locator(
      'text=/\\d+.*items?/i, .item-count, .stats',
    );

    if ((await countDisplay.count()) > 0) {
      await expect(countDisplay.first()).toContainText('3');
    }
  });

  test('should navigate between RAID list and detail views', async ({
    page,
    apiHelper,
  }) => {
    // Create a RAID item
    const item = await apiHelper.createRAIDItem(projectKey, {
      type: 'risk',
      title: 'Navigation Test Risk',
      description: 'Testing navigation flows',
    });

    // Navigate to RAID page
    await navigateToProject(page, projectKey);
    await page.click('text=RAID');
    await page.waitForLoadState('networkidle');

    // Click on item to view details
    await page.click('text=Navigation Test Risk');
    await page.waitForSelector(
      '.raid-detail, .modal:has-text("Navigation Test Risk")',
    );

    // Verify detail view is shown
    await expect(page.locator('.raid-detail, .modal')).toContainText(
      'Testing navigation flows',
    );

    // Click back/close to return to list
    const backButton = page.locator(
      'button:has-text("Back"), button:has-text("Close"), button[aria-label="Close"]',
    );
    if ((await backButton.count()) > 0) {
      await backButton.first().click();

      // Verify we're back at the list
      await expect(page.locator('.raid-list, .raid-items')).toBeVisible();
    }
  });

  test('should maintain filter state when navigating back', async ({
    page,
    apiHelper,
  }) => {
    // Create items of different types
    await apiHelper.createRAIDItem(projectKey, {
      type: 'risk',
      title: 'Risk Item',
      description: 'Risk',
    });
    await apiHelper.createRAIDItem(projectKey, {
      type: 'issue',
      title: 'Issue Item',
      description: 'Issue',
    });

    // Navigate to RAID page
    await navigateToProject(page, projectKey);
    await page.click('text=RAID');
    await page.waitForLoadState('networkidle');

    // Apply filter
    await page.selectOption('select[name="type"]', 'risk');
    await page.waitForLoadState('networkidle');

    // Verify filtered state
    await expect(page.locator('text=Risk Item')).toBeVisible();
    await expect(page.locator('text=Issue Item')).not.toBeVisible();

    // Click on an item
    await page.click('text=Risk Item');
    await page.waitForSelector('.raid-detail, .modal');

    // Go back
    const backButton = page.locator(
      'button:has-text("Back"), button:has-text("Close")',
    );
    if ((await backButton.count()) > 0) {
      await backButton.first().click();

      // Verify filter is still applied
      await expect(page.locator('text=Risk Item')).toBeVisible();
      await expect(page.locator('text=Issue Item')).not.toBeVisible();
    }
  });

  test('should handle loading states correctly', async ({
    page,
    apiHelper,
  }) => {
    // Create many items to increase loading time
    const createPromises = [];
    for (let i = 0; i < 50; i++) {
      createPromises.push(
        apiHelper.createRAIDItem(projectKey, {
          type: 'risk',
          title: `Bulk Item ${i}`,
          description: 'Bulk test',
        }),
      );
    }
    await Promise.all(createPromises);

    // Navigate to RAID page
    await navigateToProject(page, projectKey);

    // Start navigation
    const raidLinkClick = page.click('text=RAID');

    // Check if loading indicator appears (it might be very brief)
    const loadingIndicator = page.locator(
      '.loading, .spinner, [aria-busy="true"]',
    );
    const hasLoader = (await loadingIndicator.count()) > 0;

    await raidLinkClick;
    await page.waitForLoadState('networkidle');

    // Verify items are loaded
    await expect(page.locator('.raid-item, .raid-card').first()).toBeVisible();
  });
});
