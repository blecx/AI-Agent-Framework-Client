/**
 * Page Object: Proposal List
 * Handles proposal list view and proposal creation
 */

import { Page, Locator } from '@playwright/test';

export class ProposalListPage {
  readonly page: Page;
  readonly proposalsList: Locator;
  readonly createProposalButton: Locator;
  readonly proposalTitleInput: Locator;
  readonly proposalDescriptionInput: Locator;
  readonly submitProposalButton: Locator;
  readonly filterDropdown: Locator;
  readonly searchInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.proposalsList = page.locator('.proposals-list');
    this.createProposalButton = page.locator('button:has-text("Create Proposal")');
    this.proposalTitleInput = page.locator('#proposalTitle, input[name="title"]');
    this.proposalDescriptionInput = page.locator('#proposalDescription, textarea[name="description"]');
    this.submitProposalButton = page.locator('button[type="submit"]:has-text("Create")');
    this.filterDropdown = page.locator('select[name="status"]');
    this.searchInput = page.locator('input[placeholder*="Search"]');
  }

  async goto(projectKey: string) {
    await this.page.goto(`/projects/${projectKey}/proposals`);
    await this.page.waitForLoadState('networkidle');
  }

  async openCreateProposalDialog() {
    await this.createProposalButton.click();
    await this.page.waitForSelector('.create-proposal-form, .proposal-modal', { state: 'visible' });
  }

  async fillProposalForm(title: string, description: string) {
    await this.proposalTitleInput.fill(title);
    await this.proposalDescriptionInput.fill(description);
  }

  async submitProposal() {
    const responsePromise = this.page.waitForResponse(
      (response) => response.url().includes('/proposals') && response.request().method() === 'POST',
      { timeout: 30000 }
    );
    await this.submitProposalButton.click();
    return await responsePromise;
  }

  async createProposal(title: string, description: string) {
    await this.openCreateProposalDialog();
    await this.fillProposalForm(title, description);
    return await this.submitProposal();
  }

  async filterByStatus(status: string) {
    await this.filterDropdown.selectOption(status);
    await this.page.waitForLoadState('networkidle');
  }

  async searchProposals(searchTerm: string) {
    await this.searchInput.fill(searchTerm);
    await this.page.waitForTimeout(500); // Debounce
  }

  getProposalItem(proposalTitle: string): Locator {
    return this.page.locator(`.proposal-item:has-text("${proposalTitle}")`);
  }

  async openProposal(proposalTitle: string) {
    const proposalItem = this.getProposalItem(proposalTitle);
    await proposalItem.click();
    await this.page.waitForSelector('.proposal-review-modal, .proposal-detail', { state: 'visible' });
  }

  async verifyProposalExists(proposalTitle: string) {
    const item = this.getProposalItem(proposalTitle);
    await item.waitFor({ state: 'visible', timeout: 10000 });
  }

  async getProposalCount(): Promise<number> {
    const items = await this.page.locator('.proposal-item').count();
    return items;
  }
}
