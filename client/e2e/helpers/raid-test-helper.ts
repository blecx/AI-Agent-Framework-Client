/**
 * RAID Test Helper - Single Responsibility: Common RAID Test Operations
 * Reusable utilities for RAID E2E tests
 */

import { Page } from '@playwright/test';

export class RAIDTestHelper {
  /**
   * Navigate to project RAID list
   */
  static async navigateToRAIDList(page: Page, projectKey: string): Promise<void> {
    await page.goto(`/projects/${projectKey}`);
    await page.click('text=RAID');
    await page.waitForSelector('[data-testid="raid-list"]', { timeout: 5000 });
  }

  /**
   * Fill RAID item form
   */
  static async fillRAIDForm(
    page: Page,
    data: {
      type?: string;
      title: string;
      description: string;
      priority?: string;
      status?: string;
      owner?: string;
    },
  ): Promise<void> {
    if (data.type) {
      await page.selectOption('[name="type"]', data.type);
    }
    await page.fill('[name="title"]', data.title);
    await page.fill('[name="description"]', data.description);
    
    if (data.priority) {
      await page.selectOption('[name="priority"]', data.priority);
    }
    if (data.status) {
      await page.selectOption('[name="status"]', data.status);
    }
    if (data.owner) {
      await page.fill('[name="owner"]', data.owner);
    }
  }

  /**
   * Open create RAID dialog
   */
  static async openCreateDialog(page: Page): Promise<void> {
    await page.click('[data-testid="create-raid-button"]');
    await page.waitForSelector('[data-testid="raid-form"]');
  }

  /**
   * Submit RAID form
   */
  static async submitForm(page: Page): Promise<void> {
    await page.click('[data-testid="submit-raid-button"]');
  }

  /**
   * Wait for success toast
   */
  static async waitForSuccessToast(page: Page): Promise<void> {
    await page.waitForSelector('.toast-success', { timeout: 5000 });
  }

  /**
   * Get RAID items from list
   */
  static async getRAIDItems(page: Page) {
    return await page.locator('[data-testid="raid-item"]').all();
  }

  /**
   * Complete create workflow: open dialog, fill form, submit
   */
  static async createRAIDItem(
    page: Page,
    data: {
      type?: string;
      title: string;
      description: string;
      priority?: string;
      status?: string;
      owner?: string;
    },
  ): Promise<void> {
    await this.openCreateDialog(page);
    await this.fillRAIDForm(page, data);
    await this.submitForm(page);
    await this.waitForSuccessToast(page);
  }
}
