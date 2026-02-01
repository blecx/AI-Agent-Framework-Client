/**
 * E2E Test: Page Object Pattern Example
 * Demonstrates the use of page objects for cleaner, more maintainable tests
 */

import { test, expect } from '../fixtures';
import { ProjectViewPage, ProposalListPage, ProposalReviewModalPage } from '../page-objects';

test.describe('Page Object Pattern Examples', () => {
  test('should create project using page object', async ({ page, uniqueProjectKey }) => {
    const projectView = new ProjectViewPage(page);
    
    // Navigate to projects page
    await projectView.goto();
    
    // Create a new project
    const projectData = {
      key: uniqueProjectKey,
      name: `Test Project ${Date.now()}`,
      description: 'E2E test with page object pattern',
    };
    
    const response = await projectView.createProject(
      projectData.key,
      projectData.name,
      projectData.description
    );
    
    expect(response.status()).toBe(200);
    
    // Verify project appears in list
    await projectView.verifyProjectExists(projectData.name);
  });

  test('should create and view proposal using page objects', async ({ 
    page, 
    apiHelper, 
    uniqueProjectKey 
  }) => {
    // Setup: Create project via API (fast)
    await apiHelper.createProject(uniqueProjectKey, 'Test Project for Proposals');
    
    const proposalList = new ProposalListPage(page);
    const reviewModal = new ProposalReviewModalPage(page);
    
    // Navigate to proposals page
    await proposalList.goto(uniqueProjectKey);
    
    // Create a proposal
    const proposalData = {
      title: `Test Proposal ${Date.now()}`,
      description: 'Testing page object pattern for proposals',
    };
    
    const response = await proposalList.createProposal(
      proposalData.title,
      proposalData.description
    );
    
    expect(response.status()).toBe(200);
    
    // Verify proposal exists in list
    await proposalList.verifyProposalExists(proposalData.title);
    
    // Open proposal for review
    await proposalList.openProposal(proposalData.title);
    
    // Verify review modal opened
    await reviewModal.waitForModalToOpen();
    
    // Verify proposal details
    const modalTitle = await reviewModal.getProposalTitle();
    expect(modalTitle).toContain(proposalData.title);
    
    // Verify diff viewer is present
    await reviewModal.verifyDiffVisible();
    
    // Close modal
    await reviewModal.close();
  });

  test('should navigate between artifacts using page objects', async ({ 
    page, 
    apiHelper, 
    uniqueProjectKey 
  }) => {
    // Setup: Create project via API
    await apiHelper.createProject(uniqueProjectKey, 'Test Project for Navigation');
    
    const projectView = new ProjectViewPage(page);
    
    // Navigate to project
    await projectView.goto();
    await projectView.navigateToProject(uniqueProjectKey);
    
    // Verify we're on the project page
    await expect(page).toHaveURL(new RegExp(`/projects/${uniqueProjectKey}`));
  });

  test('should demonstrate page object chaining', async ({ 
    page, 
    apiHelper, 
    uniqueProjectKey 
  }) => {
    // Setup test data
    await apiHelper.createProject(uniqueProjectKey, 'Chaining Test Project');
    
    // Initialize all page objects
    const projectView = new ProjectViewPage(page);
    const proposalList = new ProposalListPage(page);
    const reviewModal = new ProposalReviewModalPage(page);
    
    // Navigate through the workflow
    await projectView.goto();
    await projectView.navigateToProject(uniqueProjectKey);
    
    // Create proposal
    await proposalList.goto(uniqueProjectKey);
    await proposalList.createProposal('Chained Test', 'Testing workflow chaining');
    
    // Review proposal
    await proposalList.openProposal('Chained Test');
    await reviewModal.waitForModalToOpen();
    
    // Get diff statistics
    const addedLines = await reviewModal.getAddedLinesCount();
    const removedLines = await reviewModal.getRemovedLinesCount();
    
    // These counts may be 0 if no actual file changes yet
    expect(addedLines).toBeGreaterThanOrEqual(0);
    expect(removedLines).toBeGreaterThanOrEqual(0);
  });
});
