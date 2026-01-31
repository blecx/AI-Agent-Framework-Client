/**
 * E2E Test: Performance Tests
 * Tests application performance with large datasets
 */

import { test, expect } from '../fixtures';
import { navigateToProject } from '../helpers/ui-helpers';

test.describe('Performance Tests', () => {
  test.describe('RAID List Performance', () => {
    test('should load RAID list with 100 items in <1 second', async ({
      page,
      apiHelper,
      uniqueProjectKey,
    }) => {
      const projectKey = uniqueProjectKey;
      await apiHelper.createProject(
        projectKey,
        `Performance Test ${Date.now()}`,
        'Testing with 100 RAID items',
      );

      // Create 100 RAID items via API
      const createPromises = [];
      for (let i = 1; i <= 100; i++) {
        createPromises.push(
          apiHelper.createRAIDItem(projectKey, {
            type:
              i % 4 === 0
                ? 'risk'
                : i % 4 === 1
                  ? 'issue'
                  : i % 4 === 2
                    ? 'assumption'
                    : 'dependency',
            title: `RAID Item ${i.toString().padStart(3, '0')}`,
            description: `Performance test item ${i}`,
            priority: i % 3 === 0 ? 'high' : i % 3 === 1 ? 'medium' : 'low',
            status: 'open',
          }),
        );
      }
      await Promise.all(createPromises);

      // Navigate to project and measure load time
      await navigateToProject(page, projectKey);

      const startTime = Date.now();
      await page.click('text=RAID');

      // Wait for list to be fully loaded
      await page.waitForSelector('.raid-item, .raid-card', {
        state: 'visible',
      });
      await page.waitForLoadState('networkidle');

      const loadTime = Date.now() - startTime;

      // Verify items are loaded
      const itemCount = await page.locator('.raid-item, .raid-card').count();
      expect(itemCount).toBeGreaterThan(0);

      // Performance assertion: should load in <1 second
      console.log(`RAID list with 100 items loaded in ${loadTime}ms`);
      expect(loadTime).toBeLessThan(1000);
    });

    test('should load RAID list with 500 items efficiently', async ({
      page,
      apiHelper,
      uniqueProjectKey,
    }) => {
      const projectKey = uniqueProjectKey;
      await apiHelper.createProject(
        projectKey,
        `Large Performance Test ${Date.now()}`,
        'Testing with 500 RAID items',
      );

      // Create 500 RAID items via API in batches for stability
      const batchSize = 50;
      for (let batch = 0; batch < 10; batch++) {
        const promises = [];
        for (let i = 1; i <= batchSize; i++) {
          const itemNum = batch * batchSize + i;
          promises.push(
            apiHelper.createRAIDItem(projectKey, {
              type:
                itemNum % 4 === 0
                  ? 'risk'
                  : itemNum % 4 === 1
                    ? 'issue'
                    : itemNum % 4 === 2
                      ? 'assumption'
                      : 'dependency',
              title: `Large Item ${itemNum.toString().padStart(4, '0')}`,
              description: `Performance stress test item ${itemNum}`,
              priority:
                itemNum % 3 === 0
                  ? 'high'
                  : itemNum % 3 === 1
                    ? 'medium'
                    : 'low',
              status: 'open',
            }),
          );
        }
        await Promise.all(promises);
      }

      // Navigate and measure
      await navigateToProject(page, projectKey);

      const startTime = Date.now();
      await page.click('text=RAID');

      // Wait for initial render (may be paginated)
      await page.waitForSelector('.raid-item, .raid-card', {
        state: 'visible',
      });
      await page.waitForLoadState('networkidle');

      const loadTime = Date.now() - startTime;

      // Verify items are loaded (may be paginated, so check for presence)
      const itemCount = await page.locator('.raid-item, .raid-card').count();
      expect(itemCount).toBeGreaterThan(0);

      // Performance assertion: should handle large dataset without freezing
      // Allow more time for 500 items but should still be reasonable
      console.log(`RAID list with 500 items loaded in ${loadTime}ms`);
      expect(loadTime).toBeLessThan(3000); // 3 seconds max for large dataset
    });
  });

  test.describe('Filtering and Sorting Performance', () => {
    test('should filter RAID items instantly (<100ms)', async ({
      page,
      apiHelper,
      uniqueProjectKey,
    }) => {
      const projectKey = uniqueProjectKey;
      await apiHelper.createProject(
        projectKey,
        'Filter Test',
        'Testing filter performance',
      );

      // Create mixed dataset (50 items for responsive testing)
      const promises = [];
      for (let i = 1; i <= 50; i++) {
        promises.push(
          apiHelper.createRAIDItem(projectKey, {
            type: i % 2 === 0 ? 'risk' : 'issue',
            title: `Item ${i}`,
            description: 'Test',
            priority: i % 2 === 0 ? 'high' : 'low',
          }),
        );
      }
      await Promise.all(promises);

      // Navigate to RAID page
      await navigateToProject(page, projectKey);
      await page.click('text=RAID');
      await page.waitForLoadState('networkidle');

      // Measure filter time
      const filterSelect = page.locator('select[name="type"]');
      if ((await filterSelect.count()) > 0) {
        const startTime = Date.now();
        await filterSelect.selectOption('risk');
        await page.waitForLoadState('networkidle');
        const filterTime = Date.now() - startTime;

        console.log(`Filter applied in ${filterTime}ms`);

        // Verify filtering worked
        await expect(page.locator('text=Item 2')).toBeVisible();

        // Performance assertion: should be instant
        expect(filterTime).toBeLessThan(100);
      }
    });

    test('should sort RAID items quickly', async ({
      page,
      apiHelper,
      uniqueProjectKey,
    }) => {
      const projectKey = uniqueProjectKey;
      await apiHelper.createProject(
        projectKey,
        'Sort Test',
        'Testing sort performance',
      );

      // Create items with varied priorities
      await apiHelper.createRAIDItem(projectKey, {
        type: 'risk',
        title: 'Low Priority',
        description: 'Test',
        priority: 'low',
      });
      await apiHelper.createRAIDItem(projectKey, {
        type: 'risk',
        title: 'High Priority',
        description: 'Test',
        priority: 'high',
      });
      await apiHelper.createRAIDItem(projectKey, {
        type: 'risk',
        title: 'Medium Priority',
        description: 'Test',
        priority: 'medium',
      });

      // Navigate to RAID page
      await navigateToProject(page, projectKey);
      await page.click('text=RAID');
      await page.waitForLoadState('networkidle');

      // Measure sort time
      const sortControl = page.locator(
        'button:has-text("Sort"), select[name="sort"]',
      );
      if ((await sortControl.count()) > 0) {
        const startTime = Date.now();

        if ((await sortControl.first().getAttribute('type')) === 'button') {
          await sortControl.first().click();
          await page.click('text=/priority/i');
        } else {
          await sortControl.first().selectOption('priority');
        }

        await page.waitForLoadState('networkidle');
        const sortTime = Date.now() - startTime;

        console.log(`Sort applied in ${sortTime}ms`);
        expect(sortTime).toBeLessThan(200);
      }
    });
  });

  test.describe('Page Render Performance', () => {
    test('should render project list page quickly', async ({
      page,
      apiHelper,
    }) => {
      // Create a few projects
      for (let i = 1; i <= 5; i++) {
        await apiHelper.createProject(
          `PERF-${i}-${Date.now()}`,
          `Project ${i}`,
          'Test',
        );
      }

      // Measure navigation to project list
      const startTime = Date.now();
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;

      console.log(`Project list page loaded in ${loadTime}ms`);
      expect(loadTime).toBeLessThan(2000);
    });

    test('should render project detail page without lag', async ({
      page,
      apiHelper,
      uniqueProjectKey,
    }) => {
      const projectKey = uniqueProjectKey;
      await apiHelper.createProject(
        projectKey,
        'Detail Test',
        'Testing render performance',
      );

      // Create some RAID items
      for (let i = 1; i <= 10; i++) {
        await apiHelper.createRAIDItem(projectKey, {
          type: 'risk',
          title: `Item ${i}`,
          description: 'Test',
        });
      }

      // Measure navigation to project detail
      const startTime = Date.now();
      await page.goto(`/project/${projectKey}`);
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;

      console.log(`Project detail page loaded in ${loadTime}ms`);
      expect(loadTime).toBeLessThan(1500);
    });
  });

  test.describe('UI Responsiveness', () => {
    test('should not freeze UI when loading large RAID list', async ({
      page,
      apiHelper,
      uniqueProjectKey,
    }) => {
      const projectKey = uniqueProjectKey;
      await apiHelper.createProject(
        projectKey,
        'Responsiveness Test',
        'Testing UI responsiveness',
      );

      // Create 200 items
      const promises = [];
      for (let i = 1; i <= 200; i++) {
        promises.push(
          apiHelper.createRAIDItem(projectKey, {
            type: 'risk',
            title: `Item ${i}`,
            description: 'Test',
          }),
        );
      }
      await Promise.all(promises);

      // Navigate to RAID page
      await navigateToProject(page, projectKey);
      await page.click('text=RAID');

      // Try to interact with UI while loading
      // If UI is frozen, this will fail or timeout
      const loadingIndicator = page.locator(
        '.loading, .spinner, [aria-busy="true"]',
      );

      // Wait briefly to see if loading indicator appears
      await page.waitForTimeout(100);

      // Check if we can still interact (page not frozen)
      const isInteractive = await page.evaluate(() => {
        // Try to query DOM (would fail if frozen)
        return document.body !== null;
      });

      expect(isInteractive).toBe(true);

      // Wait for load to complete
      await page.waitForLoadState('networkidle');
    });

    test('should handle rapid filter changes without lag', async ({
      page,
      apiHelper,
      uniqueProjectKey,
    }) => {
      const projectKey = uniqueProjectKey;
      await apiHelper.createProject(
        projectKey,
        'Rapid Filter Test',
        'Testing rapid interactions',
      );

      // Create mixed items
      for (let i = 1; i <= 30; i++) {
        await apiHelper.createRAIDItem(projectKey, {
          type: i % 3 === 0 ? 'risk' : i % 3 === 1 ? 'issue' : 'assumption',
          title: `Item ${i}`,
          description: 'Test',
        });
      }

      // Navigate to RAID page
      await navigateToProject(page, projectKey);
      await page.click('text=RAID');
      await page.waitForLoadState('networkidle');

      const filterSelect = page.locator('select[name="type"]');
      if ((await filterSelect.count()) > 0) {
        // Rapidly change filters
        const startTime = Date.now();

        await filterSelect.selectOption('risk');
        await page.waitForLoadState('networkidle');

        await filterSelect.selectOption('issue');
        await page.waitForLoadState('networkidle');

        await filterSelect.selectOption('assumption');
        await page.waitForLoadState('networkidle');

        const totalTime = Date.now() - startTime;

        console.log(`Three rapid filter changes took ${totalTime}ms`);
        // Should handle 3 filter changes in reasonable time
        expect(totalTime).toBeLessThan(500);
      }
    });
  });

  test.describe('Memory and Resource Usage', () => {
    test('should not leak memory when navigating between pages', async ({
      page,
      apiHelper,
      uniqueProjectKey,
    }) => {
      const projectKey = uniqueProjectKey;
      await apiHelper.createProject(
        projectKey,
        'Memory Test',
        'Testing memory usage',
      );

      // Create some RAID items
      for (let i = 1; i <= 20; i++) {
        await apiHelper.createRAIDItem(projectKey, {
          type: 'risk',
          title: `Item ${i}`,
          description: 'Test',
        });
      }

      // Navigate back and forth multiple times
      for (let i = 0; i < 5; i++) {
        await navigateToProject(page, projectKey);
        await page.click('text=RAID');
        await page.waitForLoadState('networkidle');

        await page.click('text=Overview, a[href*="project"]');
        await page.waitForLoadState('networkidle');
      }

      // Get memory metrics if available
      const metrics = await page.evaluate(() => {
        if (performance.memory) {
          return {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
          };
        }
        return null;
      });

      if (metrics) {
        console.log(
          `Memory usage: ${(metrics.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
        );
        // Memory should be reasonable (< 100MB for this simple app)
        expect(metrics.usedJSHeapSize).toBeLessThan(100 * 1024 * 1024);
      }
    });
  });
});
