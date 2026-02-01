/**
 * Page Object: Artifact Editor
 * Handles artifact viewing and editing operations
 */

import { Page, Locator } from '@playwright/test';

export class ArtifactEditorPage {
  readonly page: Page;
  readonly editorContainer: Locator;
  readonly artifactTitle: Locator;
  readonly artifactContent: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly editButton: Locator;
  readonly artifactList: Locator;

  constructor(page: Page) {
    this.page = page;
    this.editorContainer = page.locator('.artifact-editor');
    this.artifactTitle = page.locator('.artifact-title');
    this.artifactContent = page.locator('.artifact-content, textarea[name="content"]');
    this.saveButton = page.locator('button:has-text("Save")');
    this.cancelButton = page.locator('button:has-text("Cancel")');
    this.editButton = page.locator('button:has-text("Edit")');
    this.artifactList = page.locator('.artifacts-list');
  }

  async gotoProjectArtifacts(projectKey: string) {
    await this.page.goto(`/projects/${projectKey}/artifacts`);
    await this.page.waitForLoadState('networkidle');
  }

  async selectArtifact(artifactName: string) {
    const artifactLink = this.page.locator(`.artifact-link:has-text("${artifactName}")`);
    await artifactLink.click();
    await this.editorContainer.waitFor({ state: 'visible' });
  }

  async startEditing() {
    await this.editButton.click();
    await this.artifactContent.waitFor({ state: 'visible' });
  }

  async editContent(content: string) {
    await this.artifactContent.clear();
    await this.artifactContent.fill(content);
  }

  async saveChanges() {
    const responsePromise = this.page.waitForResponse(
      (response) => response.url().includes('/artifacts') && 
                    (response.request().method() === 'PUT' || response.request().method() === 'PATCH'),
      { timeout: 30000 }
    );
    await this.saveButton.click();
    return await responsePromise;
  }

  async cancelEditing() {
    await this.cancelButton.click();
  }

  async getArtifactContent(): Promise<string> {
    return await this.artifactContent.textContent() || '';
  }

  async verifyArtifactTitle(expectedTitle: string) {
    await this.artifactTitle.waitFor({ state: 'visible' });
    const title = await this.artifactTitle.textContent();
    return title?.includes(expectedTitle) || false;
  }

  getArtifactListItem(artifactName: string): Locator {
    return this.page.locator(`.artifact-item:has-text("${artifactName}")`);
  }
}
