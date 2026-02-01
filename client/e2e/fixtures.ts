/**
 * Playwright fixtures for E2E tests
 * Provides common setup and teardown functionality with SRP-compliant API clients
 */

import { test as base, expect } from '@playwright/test';
import { ApiClientFactory } from './helpers/api-client-factory';
import { E2EApiHelper } from './helpers/api-helpers';

type TestFixtures = {
  apiClient: ApiClientFactory;
  apiHelper: E2EApiHelper; // Kept for backward compatibility during migration
  uniqueProjectKey: string;
};

/**
 * Extended test with custom fixtures
 */
export const test = base.extend<TestFixtures>({
  // New SRP-compliant API client fixture
  // eslint-disable-next-line no-empty-pattern
  apiClient: async ({}, use) => {
    const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:8000';
    const client = new ApiClientFactory(apiBaseUrl);

    // Wait for API to be ready before running tests
    const isReady = await client.waitForReady(30000);
    if (!isReady) {
      throw new Error(
        'API is not ready. Please ensure the backend is running.',
      );
    }

    await use(client);

    // Cleanup after test - remove test projects
    await client.projects.cleanup('e2e-');
  },

  // Legacy API helper fixture - kept for backward compatibility
  // New tests should use apiClient instead
  // eslint-disable-next-line no-empty-pattern
  apiHelper: async ({}, use) => {
    const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:8000';
    const helper = new E2EApiHelper(apiBaseUrl);

    // Wait for API to be ready before running tests
    const isReady = await helper.waitForApi(30000);
    if (!isReady) {
      throw new Error(
        'API is not ready. Please ensure the backend is running.',
      );
    }

    await use(helper);

    // Cleanup after test - remove test projects
    await helper.cleanupTestProjects('e2e-');
  },

  // Unique project key fixture - ensures each test has a unique project
  // eslint-disable-next-line no-empty-pattern
  uniqueProjectKey: async ({}, use) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const key = `e2e-project-${timestamp}-${random}`;
    await use(key);
  },
});

export { expect };
