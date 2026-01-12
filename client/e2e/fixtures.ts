/**
 * Playwright fixtures for E2E tests
 * Provides common setup and teardown functionality
 */

import { test as base, expect } from '@playwright/test';
import { E2EApiHelper } from './helpers/api-helpers';

type TestFixtures = {
  apiHelper: E2EApiHelper;
  uniqueProjectKey: string;
};

/**
 * Extended test with custom fixtures
 */
export const test = base.extend<TestFixtures>({
  // API helper fixture - provides direct API access
  apiHelper: async ({}, use) => {
    const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:8000';
    const helper = new E2EApiHelper(apiBaseUrl);
    
    // Wait for API to be ready before running tests
    const isReady = await helper.waitForApi(30000);
    if (!isReady) {
      throw new Error('API is not ready. Please ensure the backend is running.');
    }
    
    await use(helper);
    
    // Cleanup after test - remove test projects
    await helper.cleanupTestProjects('e2e-');
  },

  // Unique project key fixture - ensures each test has a unique project
  uniqueProjectKey: async ({}, use) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const key = `e2e-project-${timestamp}-${random}`;
    await use(key);
  },
});

export { expect };
