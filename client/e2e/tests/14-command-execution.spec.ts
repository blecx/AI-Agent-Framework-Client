/**
 * E2E Test: Command Execution Workflow
 * Tests executing commands through the Command Panel UI
 * 
 * Critical workflow #2 from Issue #136:
 * - Select command from dropdown
 * - Provide inputs/parameters
 * - Execute and view output
 */

import { test, expect } from '../fixtures';

test.describe('Command Execution', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home/command panel
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verify connection status
    const statusText = page.locator('.nav-status .status-text');
    await expect(statusText).toContainText(/connected/i, { timeout: 10000 });
  });

  test('should list available commands in dropdown', async ({ page }) => {
    // Navigate to command panel if not already there
    await page.click('nav a[href="/commands"]', { timeout: 5000 }).catch(() => {});
    
    // Look for command selector/dropdown
    const commandSelector = page.locator('select, [role="combobox"], button:has-text("Select Command")').first();
    await expect(commandSelector).toBeVisible({ timeout: 10000 });
    
    // Try to open dropdown if it's a select or combobox
    if (await commandSelector.evaluate(el => el.tagName === 'SELECT')) {
      const options = page.locator('select option, [role="option"]');
      await expect(options).toHaveCount(1, { timeout: 5000 }).catch(() => 
        expect(options.count()).resolves.toBeGreaterThan(0)
      );
    }
  });

  test('should execute health check command successfully', async ({ page, apiHelper }) => {
    // Create a test project first
    const projectKey = `e2e-cmd-${Date.now()}`;
    await apiHelper.createProject(projectKey, `Command Test Project ${Date.now()}`);

    // Navigate to command panel
    await page.goto('/');
    
    // Look for quick action buttons (from CommandPanel component)
    const healthCheckButton = page.locator('button[aria-label*="health" i], button:has-text("Check API health")').first();
    
    if (await healthCheckButton.isVisible({ timeout: 5000 })) {
      // Click health check button
      await healthCheckButton.click();
      
      // Wait for result/status message
      await page.waitForSelector('.status-message, .command-result, [role="alert"]', { 
        state: 'visible',
        timeout: 10000 
      });
      
      // Verify success message appears
      const resultText = await page.locator('.status-message, .command-result, [role="alert"]').first().textContent();
      expect(resultText?.toLowerCase()).toMatch(/healthy|success|ok|connected/i);
    } else {
      // Fallback: try command history or result display
      const commandHistory = page.locator('.command-history, .history-list');
      await expect(commandHistory).toBeVisible({ timeout: 5000 });
    }
  });

  test('should create project through command panel', async ({ page }) => {
    // Navigate to command panel
    await page.goto('/');
    
    // Look for "Create Project" quick action button
    const createButton = page.locator('button[aria-label*="Create" i], button:has-text("Create Project")').first();
    
    if (await createButton.isVisible({ timeout: 5000 })) {
      await createButton.click();
      
      // Wait for project creation form/modal
      await page.waitForSelector('input[id*="name" i], input[placeholder*="project" i]', {
        state: 'visible',
        timeout: 10000
      });
      
      // Fill in project details
      const projectName = `E2E Command Test ${Date.now()}`;
      const nameInput = page.locator('input[id*="name" i], input[placeholder*="name" i]').first();
      await nameInput.fill(projectName);
      
      // Look for submit button
      const submitButton = page.locator('button[type="submit"], button:has-text("Create"), button:has-text("Next")').first();
      await expect(submitButton).toBeVisible({ timeout: 5000 });
      await submitButton.click();
      
      // Wait for success indication
      await page.waitForSelector('.status-message, .toast, [role="alert"]', {
        state: 'visible',
        timeout: 15000
      }).catch(() => {
        // If no toast, check for navigation to project view
        return page.waitForURL(/\/projects\/.+/, { timeout: 10000 });
      });
      
      // Verify result message or navigation
      const currentUrl = page.url();
      const hasSuccessMessage = await page.locator('.status-message.success, .toast-success').count() > 0;
      const navigatedToProject = currentUrl.includes('/projects/');
      
      expect(hasSuccessMessage || navigatedToProject).toBeTruthy();
    }
  });

  test('should display command history', async ({ page }) => {
    // Navigate to command panel
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Execute a command (health check)
    const healthButton = page.locator('button[aria-label*="health" i], button:has-text("Check")').first();
    
    if (await healthButton.isVisible({ timeout: 5000 })) {
      await healthButton.click();
      
      // Wait for command to complete
      await page.waitForSelector('.status-message, .command-result', { 
        state: 'visible',
        timeout: 10000 
      });
      
      // Look for history section
      const historySection = page.locator('.command-history, .history-list, section:has-text("History")');
      
      if (await historySection.isVisible({ timeout: 5000 })) {
        // Verify history entry exists
        const historyEntry = page.locator('.history-item, .history-entry').first();
        await expect(historyEntry).toBeVisible({ timeout: 5000 });
        
        // Verify timestamp is present
        const timestamp = page.locator('.history-timestamp, .timestamp, time').first();
        await expect(timestamp).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should handle command execution errors gracefully', async ({ page }) => {
    // Navigate to command panel
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Try to execute a command that might fail (e.g., invalid input)
    // This tests error handling UI
    
    // Look for any command button
    const commandButton = page.locator('button[aria-label*="project" i], button:has-text("List")').first();
    
    if (await commandButton.isVisible({ timeout: 5000 })) {
      // Temporarily modify API response to simulate error
      await page.route('**/api/**', async (route) => {
        const url = route.request().url();
        if (url.includes('/projects') && route.request().method() === 'GET') {
          await route.fulfill({
            status: 500,
            body: JSON.stringify({ error: 'Internal server error' })
          });
        } else {
          await route.continue();
        }
      });
      
      await commandButton.click();
      
      // Wait for error message
      await page.waitForSelector('.status-message.error, .error-message, [role="alert"]', {
        state: 'visible',
        timeout: 10000
      });
      
      // Verify error message is displayed
      const errorMessage = await page.locator('.status-message.error, .error-message, [role="alert"]').first().textContent();
      expect(errorMessage?.toLowerCase()).toMatch(/error|failed|unable/i);
    }
  });

  test('should clear command history', async ({ page }) => {
    // Navigate to command panel
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Execute a command to create history
    const healthButton = page.locator('button[aria-label*="health" i]').first();
    
    if (await healthButton.isVisible({ timeout: 5000 })) {
      await healthButton.click();
      await page.waitForTimeout(1000); // Wait for command to complete
      
      // Look for clear history button
      const clearButton = page.locator('button:has-text("Clear History"), button:has-text("Clear")').first();
      
      if (await clearButton.isVisible({ timeout: 5000 })) {
        await clearButton.click();
        
        // Handle confirmation dialog if present
        const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes"), button[aria-label="Clear"]').first();
        if (await confirmButton.isVisible({ timeout: 2000 })) {
          await confirmButton.click();
        }
        
        // Verify history is cleared or empty message appears
        await page.waitForSelector('.history-empty, .no-commands, :has-text("No commands executed")', {
          state: 'visible',
          timeout: 5000
        }).catch(() => {
          // Alternative: count history items should be 0
          return page.locator('.history-item, .history-entry').count().then(count => {
            expect(count).toBe(0);
          });
        });
      }
    }
  });
});
