/**
 * Page Object: Proposal Review Modal
 * Handles proposal diff visualization and review actions
 */

import { Page, Locator } from '@playwright/test';

export class ProposalReviewModalPage {
  readonly page: Page;
  readonly modal: Locator;
  readonly proposalTitle: Locator;
  readonly proposalDescription: Locator;
  readonly diffViewer: Locator;
  readonly addedLines: Locator;
  readonly removedLines: Locator;
  readonly approveButton: Locator;
  readonly rejectButton: Locator;
  readonly applyButton: Locator;
  readonly closeButton: Locator;
  readonly statusBadge: Locator;

  constructor(page: Page) {
    this.page = page;
    this.modal = page.locator('.proposal-review-modal, .proposal-detail-modal');
    this.proposalTitle = this.modal.locator('.proposal-title, h2');
    this.proposalDescription = this.modal.locator('.proposal-description');
    this.diffViewer = this.modal.locator('.diff-viewer, .proposal-diff');
    this.addedLines = this.diffViewer.locator('.diff-line-add, .line-added');
    this.removedLines = this.diffViewer.locator('.diff-line-remove, .line-removed');
    this.approveButton = this.modal.locator('button:has-text("Approve")');
    this.rejectButton = this.modal.locator('button:has-text("Reject")');
    this.applyButton = this.modal.locator('button:has-text("Apply")');
    this.closeButton = this.modal.locator('button:has-text("Close"), .close-button');
    this.statusBadge = this.modal.locator('.proposal-status, .status-badge');
  }

  async waitForModalToOpen() {
    await this.modal.waitFor({ state: 'visible', timeout: 10000 });
  }

  async close() {
    await this.closeButton.click();
    await this.modal.waitFor({ state: 'hidden', timeout: 5000 });
  }

  async approve() {
    const responsePromise = this.page.waitForResponse(
      (response) => response.url().includes('/proposals/') && 
                    response.url().includes('/approve') &&
                    (response.request().method() === 'POST' || response.request().method() === 'PATCH'),
      { timeout: 30000 }
    );
    await this.approveButton.click();
    return await responsePromise;
  }

  async reject() {
    const responsePromise = this.page.waitForResponse(
      (response) => response.url().includes('/proposals/') && 
                    response.url().includes('/reject') &&
                    (response.request().method() === 'POST' || response.request().method() === 'PATCH'),
      { timeout: 30000 }
    );
    await this.rejectButton.click();
    return await responsePromise;
  }

  async apply() {
    const responsePromise = this.page.waitForResponse(
      (response) => response.url().includes('/proposals/') && 
                    response.url().includes('/apply') &&
                    response.request().method() === 'POST',
      { timeout: 30000 }
    );
    await this.applyButton.click();
    return await responsePromise;
  }

  async getProposalTitle(): Promise<string> {
    return await this.proposalTitle.textContent() || '';
  }

  async getProposalDescription(): Promise<string> {
    return await this.proposalDescription.textContent() || '';
  }

  async verifyDiffVisible() {
    await this.diffViewer.waitFor({ state: 'visible', timeout: 5000 });
  }

  async getAddedLinesCount(): Promise<number> {
    return await this.addedLines.count();
  }

  async getRemovedLinesCount(): Promise<number> {
    return await this.removedLines.count();
  }

  async getStatus(): Promise<string> {
    return await this.statusBadge.textContent() || '';
  }

  async verifyButtonState(button: 'approve' | 'reject' | 'apply', expectedState: 'enabled' | 'disabled') {
    const locator = button === 'approve' ? this.approveButton :
                    button === 'reject' ? this.rejectButton :
                    this.applyButton;
    
    if (expectedState === 'enabled') {
      await locator.waitFor({ state: 'visible' });
      const isEnabled = await locator.isEnabled();
      return isEnabled;
    } else {
      const isDisabled = await locator.isDisabled();
      return isDisabled;
    }
  }
}
