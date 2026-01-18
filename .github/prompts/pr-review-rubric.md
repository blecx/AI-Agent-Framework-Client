# PR Review Rubric (AI-Agent-Framework-Client)

Use this rubric for both human and agent-based PR reviews.

## Inputs

- PR description (goal, acceptance criteria, validation steps)
- Diff / changed files list
- CI output (if available)

## Required output format

1. Summary (2-4 bullets)
2. Goal / Acceptance Criteria Verification
   - AC1: pass/fail + evidence (file/lines)
   - AC2: pass/fail + evidence
3. Standards & Safety Checks
   - No secrets committed (.env, tokens): pass/fail
   - TypeScript/Vite build succeeds: pass/fail
   - ESLint passes: pass/fail
4. Correctness / UX
   - broken flows, edge cases, loading/error states
5. Tests
   - unit tests (vitest) + E2E (playwright) coverage; gaps
   - API smoke/contract test result (if applicable)
6. Breaking Changes / Backend Impact
   - requires backend API change? yes/no + details
7. Recommendation
   - APPROVE / REQUEST CHANGES
   - required changes (max 5), ordered by severity

## Review rules

- Be strict about acceptance criteria and evidence.
- Call out missing validation evidence.
- Prefer small diffs (<200 LOC) and one issue per PR.
- If UI behavior changes without tests, request tests or strong manual evidence.
