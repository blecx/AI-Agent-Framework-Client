/**
 * Test data generation helpers for E2E tests
 * Ensures each test has unique, non-conflicting data
 */

/**
 * Generate a unique project key for testing
 * Uses timestamp and random string to avoid conflicts
 */
export function generateProjectKey(prefix: string = 'test'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Generate unique project data
 */
export function generateProjectData(suffix?: string) {
  const uniqueId = suffix || Date.now().toString();
  return {
    key: generateProjectKey('e2e-project'),
    name: `E2E Test Project ${uniqueId}`,
    description: `Test project created by E2E tests at ${new Date().toISOString()}`,
  };
}

/**
 * Generate unique proposal data
 */
export function generateProposalData() {
  const timestamp = Date.now();
  return {
    title: `E2E Test Proposal ${timestamp}`,
    description: `Test proposal created at ${new Date().toISOString()}`,
    changes: {
      files: [
        {
          path: `test-file-${timestamp}.txt`,
          type: 'add',
          content: `Test content created at ${new Date().toISOString()}`,
        },
      ],
    },
  };
}

/**
 * Generate unique command data
 */
export function generateCommandData() {
  return {
    command: 'assess_gaps',
    args: ['--test-mode'],
  };
}

/**
 * Wait helper with timeout
 */
export async function waitWithTimeout(
  conditionFn: () => Promise<boolean>,
  timeoutMs: number = 10000,
  intervalMs: number = 500
): Promise<boolean> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeoutMs) {
    if (await conditionFn()) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  return false;
}
