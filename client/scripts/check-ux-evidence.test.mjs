import test from "node:test";
import assert from "node:assert/strict";

import { validateUxEvidence } from "./check-ux-evidence.mjs";

test("non-UI changes do not require UX evidence", () => {
  const result = validateUxEvidence({
    body: "# Summary\n",
    changedFiles: ["client/scripts/check-docs.mjs"],
  });

  assert.equal(result.ok, true);
  assert.equal(result.uiTouched, false);
  assert.deepEqual(result.errors, []);
});

test("UI changes fail when UX section is missing", () => {
  const result = validateUxEvidence({
    body: "# Summary\n\n## Validation\n",
    changedFiles: ["client/src/App.tsx"],
  });

  assert.equal(result.ok, false);
  assert.equal(result.uiTouched, true);
  assert.match(result.errors.join("\n"), /UX \/ Navigation Review/);
});

test("UI changes fail when authority checkbox is missing", () => {
  const result = validateUxEvidence({
    body: `# Summary

## UX / Navigation Review
- [x] Responsive behavior validated on target breakpoints.
- [x] Keyboard navigation and a11y pass reviewed.
`,
    changedFiles: ["client/src/components/ProjectView.tsx"],
  });

  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /blecs-ux-authority/);
});

test("UI changes fail when requirement-gap disposition line is missing", () => {
  const result = validateUxEvidence({
    body: `# Summary

## UX / Navigation Review
- [x] blecs-ux-authority consulted: pass
- [x] Responsive behavior validated on target breakpoints.
- [x] Keyboard navigation and a11y pass reviewed.
`,
    changedFiles: ["client/src/components/ProjectView.tsx"],
  });

  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /requirement-gap disposition/i);
});

test("UI changes pass with complete UX evidence", () => {
  const result = validateUxEvidence({
    body: `# Summary

## UX / Navigation Review
- [x] blecs-ux-authority consulted: pass
- [x] Requirement-gap disposition: none (non-blocking)
- [x] Responsive behavior validated on desktop/tablet/mobile breakpoints.
- [x] Navigation + keyboard/a11y checks passed with evidence in manual test section.
`,
    changedFiles: ["client/src/components/ReadinessPanel.tsx", "client/src/index.css"],
  });

  assert.equal(result.ok, true);
  assert.deepEqual(result.errors, []);
});

test("navigation-affecting changes fail without multi-role and conflict-flow evidence", () => {
  const result = validateUxEvidence({
    body: `# Summary

## UX / Navigation Review
- [x] blecs-ux-authority consulted: pass
- [x] Requirement-gap disposition: none (non-blocking)
- [x] Responsive behavior validated on desktop/tablet/mobile breakpoints.
- [x] Navigation + keyboard/a11y checks passed with evidence in manual test section.
`,
    changedFiles: ["client/src/components/AppNavigation.tsx"],
  });

  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /multi-role journey/i);
  assert.match(result.errors.join("\n"), /conflict-resolution flow/i);
});

test("navigation-affecting changes pass with advanced journey/conflict evidence", () => {
  const result = validateUxEvidence({
    body: `# Summary

## UX / Navigation Review
- [x] blecs-ux-authority consulted: pass
- [x] Requirement-gap disposition: none (non-blocking)
- [x] Multi-role workflow journey validated (planner/reviewer/approver mapped)
- [x] Conflict-resolution flow validated (reachable with clear next actions)
- [x] Responsive behavior validated on desktop/tablet/mobile breakpoints.
`,
    changedFiles: ["client/src/components/navigationModel.ts"],
  });

  assert.equal(result.ok, true);
  assert.deepEqual(result.errors, []);
});
