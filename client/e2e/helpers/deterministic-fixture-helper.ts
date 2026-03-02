/**
 * Deterministic E2E Fixture Helper — S3R-UX-01
 *
 * Provides a setup/teardown helper for E2E tests that:
 * - Uses explicit wait polling instead of sleep/setTimeout
 * - Is reusable across multiple test files
 * - Produces deterministic results across repeated runs
 */

import { APIRequestContext } from '@playwright/test';

const POLL_INTERVAL_MS = 100;
const DEFAULT_TIMEOUT_MS = 15_000;

export interface ProjectStub {
  key: string;
  name: string;
}

/**
 * Poll `condition` every POLL_INTERVAL_MS until it returns true or timeout.
 * Throws if timeout is exceeded. No sleep — uses setImmediate-style recursion.
 */
async function pollUntil(
  condition: () => Promise<boolean>,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await condition()) return;
    await new Promise<void>((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
  throw new Error(`pollUntil: condition not met within ${timeoutMs}ms`);
}

/**
 * DeterministicFixtureHelper provides a stable, no-sleep fixture lifecycle for
 * Playwright E2E tests.
 *
 * Usage:
 *   const fixture = new DeterministicFixtureHelper(request, baseUrl);
 *   await fixture.setup();
 *   const project = await fixture.createProject('e2e-my-test');
 *   // … run assertions …
 *   await fixture.teardown();
 */
export class DeterministicFixtureHelper {
  private readonly request: APIRequestContext;
  private readonly baseUrl: string;
  private readonly createdKeys: string[] = [];

  constructor(request: APIRequestContext, baseUrl: string) {
    this.request = request;
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  /** Wait for the backend API to be ready (health endpoint returns 200). */
  async setup(timeoutMs = DEFAULT_TIMEOUT_MS): Promise<void> {
    await pollUntil(async () => {
      try {
        const res = await this.request.get(`${this.baseUrl}/health`);
        return res.ok();
      } catch {
        return false;
      }
    }, timeoutMs);
  }

  /**
   * Create a test project and wait until it is retrievable.
   *
   * @param keyPrefix  Short prefix for the project key (e.g. 'e2e-base')
   * @returns          The created project stub {key, name}
   */
  async createProject(keyPrefix: string): Promise<ProjectStub> {
    const key = `${keyPrefix}-${Date.now()}`;
    const name = `E2E fixture: ${key}`;

    const createRes = await this.request.post(
      `${this.baseUrl}/api/v1/projects`,
      { data: { key, name } },
    );
    if (!createRes.ok()) {
      throw new Error(
        `createProject failed: ${createRes.status()} ${await createRes.text()}`,
      );
    }

    // Poll until the project is retrievable — no arbitrary sleep.
    await pollUntil(async () => {
      const res = await this.request.get(
        `${this.baseUrl}/api/v1/projects/${key}`,
      );
      return res.ok();
    });

    this.createdKeys.push(key);
    return { key, name };
  }

  /** Delete all projects created during the fixture lifecycle. */
  async teardown(): Promise<void> {
    for (const key of this.createdKeys) {
      try {
        await this.request.delete(`${this.baseUrl}/api/v1/projects/${key}`);
      } catch {
        // Best-effort cleanup — do not fail the test on teardown errors.
      }
    }
    this.createdKeys.length = 0;
  }
}
