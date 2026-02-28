<!--
Thank you for your contribution!

This template is intentionally structured to be LLM-friendly:
- Clear, explicit prompts
- Checkbox-driven requirements
- Minimal ambiguity

Please keep content concise and actionable.
-->

# Summary

<!-- What is changing and why? Provide 2–6 sentences. -->

## Goal / Acceptance Criteria (required)

<!--
REQUIRED: Explicitly state what “done” means.
Keep it verifiable. If there is no prior issue with AC, add AC here.
-->

- [ ] AC1:
- [ ] AC2:
- [ ] AC3:

## Type of change

<!-- Check all that apply. -->

- [ ] Bug fix
- [ ] Feature
- [ ] Refactor
- [ ] Performance
- [ ] Documentation
- [ ] Build/CI
- [ ] Test
- [ ] Chore
- [ ] Other: **\_\_\_\_**

## Issue / Tracking Link (required)

<!--
REQUIRED: Link the issue/ticket this PR addresses.
Use one of:
- GitHub issue: Fixes #123 / Closes #123
- Full URL to issue/ticket
- If no issue exists, create one first.
-->

Fixes: **\_\_\_\_**

## What changed?

<!-- Bullet list of key changes. Keep it scannable. -->

-
-
-

## Why?

<!-- What problem does this solve? What user impact? -->

## How to review

<!-- Steps for reviewers to validate the change. Prefer deterministic, numbered steps. -->

1.
2.
3.

## Validation (required)

## Automated checks

<!--
REQUIRED: Confirm lint/build/test have been run and are passing.
If the repo uses specific commands, paste them and their results.
-->

- [ ] Lint passes (attach output or CI link):
  - Command(s): **\_\_\_\_**
  - Evidence (CI link or pasted summary): **\_\_\_\_**
- [ ] Build passes (attach output or CI link):
  - Command(s): **\_\_\_\_**
  - Evidence (CI link or pasted summary): **\_\_\_\_**
- [ ] Tests pass (if applicable) (attach output or CI link):
  - Command(s): **\_\_\_\_**
  - Evidence (CI link or pasted summary): **\_\_\_\_**

## Manual test evidence (required)

<!--
REQUIRED: Provide at least ONE manual test entry.
If manual testing is truly not applicable, explain why and what alternative validation was used.
-->

- [ ] Manual test entry #1
  - Scenario: **\_\_\_\_**
  - Steps:
    1. ***
    2. ***
    3. ***
  - Expected result: **\_\_\_\_**
  - Actual result / Evidence (screenshots, logs, GIF, terminal output, etc.): **\_\_\_\_**

## UX / Navigation Review

<!--
Required only for UI/UX-affecting changes (client/src, styles, JSX/TSX).
For non-UI changes, write: "N/A (non-UI change)".
Canonical guidance:
- https://github.com/blecx/AI-Agent-Framework/blob/main/.github/prompts/modules/ux/delegation-policy.md
- https://github.com/blecx/AI-Agent-Framework/blob/main/.github/agents/blecs-ux-authority.agent.md
-->

- [ ] N/A (non-UI scope)
- [ ] blecs-ux-authority consulted: pass/fail documented (required)
- [ ] Requirement-gap disposition documented: blocking/non-blocking, resolved/deferred, or none
- [ ] Multi-role workflow journey validated (planner/reviewer/approver)
- [ ] Conflict-resolution flow validated with clear next actions
- [ ] Responsive behavior validated (desktop/tablet/mobile)
- [ ] Navigation + keyboard/a11y checks validated

## Backward compatibility / Migration

- [ ] No breaking changes
- [ ] Breaking change (describe impact + migration steps):

Migration notes:

-

## Risks & Rollback

<!-- Call out risk areas and how to revert/mitigate. -->

Risks:

-

Rollback plan:

-

## Cross-repo / Downstream impact (always include)

<!--
Always present: This repo interacts with other repos/services.
If none, explicitly state "None".
-->

- Related repos/services impacted: **\_\_\_\_**
- Required coordinated releases/PRs: **\_\_\_\_**
- Follow-up issues/PRs needed: **\_\_\_\_**

## PR Title (recommendation)

<!--
Recommended (not required): Use a Conventional Commit-style prefix in the PR title.
Examples:
- feat: add streaming client support
- fix: handle null session token
- refactor: simplify agent registry
- docs: update setup instructions
- chore: bump dependencies
-->

- [ ] I used a Conventional Commit-style prefix in the PR title (recommended).

## Checklist

- [ ] Linked the required issue/ticket above.
- [ ] Updated/added tests where appropriate.
- [ ] Updated documentation where appropriate.
- [ ] Considered security/privacy impact (redacted secrets, safe logging).
- [ ] No secrets committed (API keys, tokens, credentials).
