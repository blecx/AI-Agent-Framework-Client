/**
 * Page Object: Project View
 * Handles project list, creation, and navigation
 */

import { Page, Locator } from '@playwright/test';

export class ProjectViewPage {
  readonly page: Page;
  readonly createProjectButton: Locator;
  readonly projectKeyInput: Locator;
  readonly projectNameInput: Locator;
  readonly projectDescriptionInput: Locator;
  readonly submitButton: Locator;
  readonly projectsList: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createProjectButton = page.locator('button:has-text("Create Project")');
    this.projectKeyInput = page.locator('#projectKey');
    this.projectNameInput = page.locator('#projectName');
    this.projectDescriptionInput = page.locator('#projectDescription');
    this.submitButton = page.locator('button[type="submit"]:has-text("Create Project")');
    this.projectsList = page.locator('.project-list');
  }

  async goto() {
    await this.page.goto('/projects');
    await this.page.waitForLoadState('networkidle');
  }

  async openCreateProjectDialog() {
    await this.createProjectButton.click();
    await this.page.waitForSelector('.create-project-form', { state: 'visible' });
  }

  async fillProjectForm(key: string, name: string, description: string) {
    await this.projectKeyInput.fill(key);
    await this.projectNameInput.fill(name);
    await this.projectDescriptionInput.fill(description);
  }

  async submitProjectForm() {
    const responsePromise = this.page.waitForResponse(
      (response) => response.url().includes('/projects') && response.request().method() === 'POST',
      { timeout: 30000 }
    );
    await this.submitButton.click();
    return await responsePromise;
  }

  async createProject(key: string, name: string, description: string) {
    await this.openCreateProjectDialog();
    await this.fillProjectForm(key, name, description);
    return await this.submitProjectForm();
  }

  async navigateToProject(projectKey: string) {
    const projectCard = this.page.locator('.project-card', { hasText: projectKey });
    await projectCard.click();
    await this.page.waitForURL(new RegExp(`/projects/${projectKey}`));
  }

  getProjectCard(projectName: string): Locator {
    return this.page.locator('.project-card', { hasText: projectName });
  }

  async verifyProjectExists(projectName: string) {
    const card = this.getProjectCard(projectName);
    await card.waitFor({ state: 'visible', timeout: 10000 });
  }
}
