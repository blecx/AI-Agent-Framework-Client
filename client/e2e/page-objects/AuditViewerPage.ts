/**
 * Page Object: Audit Viewer
 * Handles audit results display and navigation
 */

import { Page, Locator } from '@playwright/test';

export class AuditViewerPage {
  readonly page: Page;
  readonly auditContainer: Locator;
  readonly auditResults: Locator;
  readonly runAuditButton: Locator;
  readonly severityFilter: Locator;
  readonly auditItems: Locator;
  readonly errorItems: Locator;
  readonly warningItems: Locator;
  readonly infoItems: Locator;
  readonly auditSummary: Locator;
  readonly errorCount: Locator;
  readonly warningCount: Locator;

  constructor(page: Page) {
    this.page = page;
    this.auditContainer = page.locator('.audit-viewer, .audit-results-container');
    this.auditResults = page.locator('.audit-results');
    this.runAuditButton = page.locator('button:has-text("Run Audit")');
    this.severityFilter = page.locator('select[name="severity"], .severity-filter');
    this.auditItems = page.locator('.audit-item');
    this.errorItems = page.locator('.audit-item[data-severity="error"], .audit-error');
    this.warningItems = page.locator('.audit-item[data-severity="warning"], .audit-warning');
    this.infoItems = page.locator('.audit-item[data-severity="info"], .audit-info');
    this.auditSummary = page.locator('.audit-summary');
    this.errorCount = page.locator('.error-count');
    this.warningCount = page.locator('.warning-count');
  }

  async goto(projectKey: string) {
    await this.page.goto(`/projects/${projectKey}/audit`);
    await this.page.waitForLoadState('networkidle');
  }

  async runAudit() {
    const responsePromise = this.page.waitForResponse(
      (response) => response.url().includes('/audit') && response.request().method() === 'POST',
      { timeout: 60000 } // Audits may take longer
    );
    await this.runAuditButton.click();
    return await responsePromise;
  }

  async waitForAuditResults() {
    await this.auditResults.waitFor({ state: 'visible', timeout: 60000 });
  }

  async filterBySeverity(severity: 'error' | 'warning' | 'info' | 'all') {
    await this.severityFilter.selectOption(severity);
    await this.page.waitForTimeout(500); // Allow filter to apply
  }

  async getAuditItemsCount(): Promise<number> {
    return await this.auditItems.count();
  }

  async getErrorCount(): Promise<number> {
    return await this.errorItems.count();
  }

  async getWarningCount(): Promise<number> {
    return await this.warningItems.count();
  }

  async getInfoCount(): Promise<number> {
    return await this.infoItems.count();
  }

  getAuditItem(index: number): Locator {
    return this.auditItems.nth(index);
  }

  async clickAuditItem(index: number) {
    const item = this.getAuditItem(index);
    await item.click();
  }

  async getAuditItemText(index: number): Promise<string> {
    const item = this.getAuditItem(index);
    return await item.textContent() || '';
  }

  async verifyAuditSummaryVisible() {
    await this.auditSummary.waitFor({ state: 'visible', timeout: 5000 });
  }

  async navigateToIssueLocation(itemIndex: number) {
    const item = this.getAuditItem(itemIndex);
    const navigateButton = item.locator('button:has-text("Navigate"), .navigate-to-issue');
    await navigateButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async getSummaryErrorCount(): Promise<number> {
    const text = await this.errorCount.textContent() || '0';
    return parseInt(text.match(/\d+/)?.[0] || '0', 10);
  }

  async getSummaryWarningCount(): Promise<number> {
    const text = await this.warningCount.textContent() || '0';
    return parseInt(text.match(/\d+/)?.[0] || '0', 10);
  }

  async verifyNoErrors() {
    const count = await this.getErrorCount();
    return count === 0;
  }
}
