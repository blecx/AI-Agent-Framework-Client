/**
 * E2E Test: Visual Regression Testing
 * Tests visual consistency across key screens
 */

import { test, expect } from '../fixtures';
import { ProjectViewPage, ProposalListPage, AuditViewerPage } from '../page-objects';

test.describe('Visual Regression Tests', () => {
  test.use({ viewport: { width: 1280, height: 720 } }); // Consistent viewport

  test('should match baseline for project list page', async ({ page }) => {
    const projectView = new ProjectViewPage(page);
    
    await projectView.goto();
    await page.waitForLoadState('networkidle');
    
    // Take screenshot and compare with baseline
    await expect(page).toHaveScreenshot('project-list-page.png', {
      maxDiffPixels: 100, // Allow small differences
      threshold: 0.2,     // 20% threshold
    });
  });

  test('should match baseline for project creation modal', async ({ page }) => {
    const projectView = new ProjectViewPage(page);
    
    await projectView.goto();
    await projectView.openCreateProjectDialog();
    
    // Screenshot of create project form
    await expect(page.locator('.create-project-form')).toHaveScreenshot('create-project-modal.png', {
      maxDiffPixels: 50,
    });
  });

  test('should match baseline for empty proposals page', async ({ 
    page, 
    apiHelper, 
    uniqueProjectKey 
  }) => {
    // Setup: Create empty project
    await apiHelper.createProject(uniqueProjectKey, 'Visual Test Project');
    
    const proposalList = new ProposalListPage(page);
    await proposalList.goto(uniqueProjectKey);
    await page.waitForLoadState('networkidle');
    
    // Screenshot of empty proposals list
    await expect(page).toHaveScreenshot('proposals-empty-page.png', {
      maxDiffPixels: 100,
    });
  });

  test('should match baseline for proposal list with items', async ({ 
    page, 
    apiHelper, 
    uniqueProjectKey 
  }) => {
    // Setup: Create project with proposals
    await apiHelper.createProject(uniqueProjectKey, 'Visual Test Project');
    
    const proposalList = new ProposalListPage(page);
    await proposalList.goto(uniqueProjectKey);
    
    // Create a few proposals
    await proposalList.createProposal('Test Proposal 1', 'First test proposal');
    await page.waitForTimeout(500);
    await proposalList.createProposal('Test Proposal 2', 'Second test proposal');
    await page.waitForTimeout(500);
    
    // Reload to show list
    await proposalList.goto(uniqueProjectKey);
    await page.waitForLoadState('networkidle');
    
    // Screenshot of proposals list with items
    await expect(page).toHaveScreenshot('proposals-with-items.png', {
      maxDiffPixels: 200, // More tolerance for dynamic content
      mask: [page.locator('.timestamp, .date')], // Mask timestamps
    });
  });

  test('should match baseline for audit viewer page', async ({ 
    page, 
    apiHelper, 
    uniqueProjectKey 
  }) => {
    // Setup: Create project
    await apiHelper.createProject(uniqueProjectKey, 'Visual Test Project');
    
    const auditView = new AuditViewerPage(page);
    await auditView.goto(uniqueProjectKey);
    await page.waitForLoadState('networkidle');
    
    // Screenshot of audit viewer (initial state)
    await expect(page).toHaveScreenshot('audit-viewer-initial.png', {
      maxDiffPixels: 100,
    });
  });

  test('should capture navigation menu consistently', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Screenshot of navigation menu
    const nav = page.locator('nav');
    await expect(nav).toHaveScreenshot('navigation-menu.png', {
      maxDiffPixels: 30,
    });
  });

  test('should match baseline for responsive mobile view', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    
    const projectView = new ProjectViewPage(page);
    await projectView.goto();
    await page.waitForLoadState('networkidle');
    
    // Screenshot mobile view
    await expect(page).toHaveScreenshot('project-list-mobile.png', {
      maxDiffPixels: 150,
    });
  });

  test('should match baseline for tablet view', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    
    const projectView = new ProjectViewPage(page);
    await projectView.goto();
    await page.waitForLoadState('networkidle');
    
    // Screenshot tablet view
    await expect(page).toHaveScreenshot('project-list-tablet.png', {
      maxDiffPixels: 150,
    });
  });

  test('should capture error state consistently', async ({ page, apiHelper, uniqueProjectKey }) => {
    // Setup: Create project
    await apiHelper.createProject(uniqueProjectKey, 'Error Test Project');
    
    const proposalList = new ProposalListPage(page);
    await proposalList.goto(uniqueProjectKey);
    
    // Try to create invalid proposal to trigger error
    await proposalList.openCreateProposalDialog();
    await proposalList.submitProposalButton.click(); // Submit without filling
    
    await page.waitForTimeout(500); // Wait for error message
    
    // Screenshot error state
    await expect(page.locator('.create-proposal-form, .proposal-modal')).toHaveScreenshot('proposal-form-error.png', {
      maxDiffPixels: 50,
    });
  });

  test('should match baseline for dark mode if available', async ({ page }) => {
    // Check if dark mode toggle exists
    const darkModeToggle = page.locator('[data-theme-toggle], .theme-toggle');
    const exists = await darkModeToggle.count() > 0;
    
    if (exists) {
      await darkModeToggle.click();
      await page.waitForTimeout(500); // Wait for transition
      
      const projectView = new ProjectViewPage(page);
      await projectView.goto();
      
      await expect(page).toHaveScreenshot('project-list-dark-mode.png', {
        maxDiffPixels: 150,
      });
    } else {
      test.skip();
    }
  });
});
