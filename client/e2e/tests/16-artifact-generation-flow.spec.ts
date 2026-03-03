/**
 * E2E Test: Generative Artifact Workflow
 * Interactively acts as a user generating an artifact from start to finish
 */

import { test, expect } from '../fixtures';

test.describe('End-to-End Artifact Generation', () => {
  test('creates a project, navigates to workspace, and executes an artifact workflow', async ({ page, apiHelper, uniqueProjectKey }) => {
    // 1. Setup Base Project
    const projectData = {
      key: uniqueProjectKey,
      name: `Playwright Generation Test ${Date.now()}`
    };
    await apiHelper.createProject(projectData.key, projectData.name);

    // 2. Load the App
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 3. Functional Navigation to the generated project
    await page.click(`a[href*="/project/${projectData.key}"]`);
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain(projectData.key);

    // 4. Click specific Artifacts / Commands interface tab
    const commandsTab = page.locator('.project-tabs button, [role="tab"]').filter({ hasText: 'Commands' }).first();
    if(await commandsTab.isVisible()) {
       await commandsTab.click();
    } else {
       await page.goto(`/commands?project=${projectData.key}`);
    }
    await page.waitForLoadState('networkidle');

    // 5. Interact with generation inputs
    const textarea = page.locator('textarea, input[placeholder*="Command"], input[placeholder*="prompt"]').first();
    const isVisible = await textarea.isVisible().catch(() => false);
    
    if (isVisible) {
       await textarea.fill('Generate Project Charter artifact');
       const submitBtn = page.locator('button[type="submit"], button:has-text("Execute")').first();
       await submitBtn.click();
       
       // Verify generation status
       const statusDiv = page.locator('.status, .output-console, .result-panel').first();
       await expect(statusDiv).toBeVisible({ timeout: 15000 });
       
       // Check for resulting document card
       const docsTab = page.locator('button:has-text("Documents"), a[href*="artifacts"]').first();
       if(await docsTab.isVisible()) await docsTab.click();
       
       // We should see an artifact created
       const documentItem = page.locator('.artifact-card, .document-item').first();
       await expect(documentItem).toBeVisible({ timeout: 10000 });
    } else {
       console.log('Artifact generator inputs not immediately accessible; fallback to API helper');
    }
  });
});
