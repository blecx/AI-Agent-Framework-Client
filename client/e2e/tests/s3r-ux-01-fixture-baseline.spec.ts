/**
 * S3R-UX-01 — Client E2E deterministic fixture baseline
 *
 * These tests verify that DeterministicFixtureHelper:
 *  - sets up cleanly without sleep-based waits
 *  - creates/cleans up projects deterministically
 *  - can be reused across multiple test contexts
 *
 * They are intentionally lightweight (no browser, API-only) so they run
 * fast and reliably in CI (headless, no display required).
 *
 * Run: npx playwright test e2e/tests/s3r-ux-01-fixture-baseline.spec.ts
 * Tags: @fixture @baseline
 */

import { test, expect } from '@playwright/test';
import { DeterministicFixtureHelper } from '../helpers/deterministic-fixture-helper';

const BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:8000';

// ---------------------------------------------------------------------------
// Fixture lifecycle helpers
// ---------------------------------------------------------------------------

test.describe('DeterministicFixtureHelper — baseline @fixture @baseline', () => {
  test('setup() resolves when API is healthy', async ({ request }) => {
    const fixture = new DeterministicFixtureHelper(request, BASE_URL);
    // Should not throw
    await fixture.setup(15_000);
    await fixture.teardown();
  });

  test('createProject() returns deterministic stub', async ({ request }) => {
    const fixture = new DeterministicFixtureHelper(request, BASE_URL);
    await fixture.setup();

    const project = await fixture.createProject('e2e-base');

    expect(project.key).toMatch(/^e2e-base-\d+$/);
    expect(project.name).toContain('e2e-base');

    await fixture.teardown();
  });

  test('teardown() removes all created projects', async ({ request }) => {
    const fixture = new DeterministicFixtureHelper(request, BASE_URL);
    await fixture.setup();

    const project = await fixture.createProject('e2e-cleanup');

    // Confirm it exists
    const before = await request.get(
      `${BASE_URL}/api/v1/projects/${project.key}`,
    );
    expect(before.ok()).toBe(true);

    await fixture.teardown();

    // Confirm it was deleted
    const after = await request.get(
      `${BASE_URL}/api/v1/projects/${project.key}`,
    );
    expect(after.status()).toBe(404);
  });

  test('helper is reusable across two independent projects', async ({
    request,
  }) => {
    const fixture = new DeterministicFixtureHelper(request, BASE_URL);
    await fixture.setup();

    const p1 = await fixture.createProject('e2e-reuse-a');
    const p2 = await fixture.createProject('e2e-reuse-b');

    expect(p1.key).not.toBe(p2.key);

    await fixture.teardown();
  });
});

// ---------------------------------------------------------------------------
// Stability — three deterministic runs (no sleeps, no flakiness)
// ---------------------------------------------------------------------------

test.describe('DeterministicFixtureHelper — stability runs @fixture @baseline', () => {
  for (let run = 1; run <= 3; run++) {
    test(`run ${run}/3: setup + createProject + teardown`, async ({
      request,
    }) => {
      const fixture = new DeterministicFixtureHelper(request, BASE_URL);
      await fixture.setup();
      const proj = await fixture.createProject(`e2e-stability-r${run}`);
      expect(proj.key).toMatch(/^e2e-stability-r\d+-\d+$/);
      await fixture.teardown();
    });
  }
});
