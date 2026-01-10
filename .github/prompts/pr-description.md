# PR Description Prompt Template

Use this prompt to draft a comprehensive PR description with validation steps.

---

## Prompt

Create a PR description for changes to AI-Agent-Framework-Client:

**PR Title**: [Action verb] [specific change] (resolves #[issue-number])
- Example: "Add timeout handling to API client (resolves #123)"
- Example: "Create ProjectSettings component (resolves #456)"

**Description**:

## Summary
[2-3 sentences: What was changed and why]

## Changes Made
- [Bullet list of specific changes]
- [Include file paths and brief description of changes]

## Fixes
Resolves #[issue-number]
Related to #[other-issue-number]

## Validation Performed

### Pre-commit Validation ✅
- [ ] `cd client && npm run lint` - PASSED (0 errors, 0 warnings)
- [ ] `cd client && npm run build` - SUCCEEDED (dist/ generated)
- [ ] `client/dist/` contains index.html + assets/ (if applicable)

### Manual Testing ✅
**Test Environment:**
- Node.js version: [e.g., v20.19.6]
- API running: `curl http://localhost:8000/health` returns `{"status":"healthy"}`
- Client dev server: `npm run dev` at http://localhost:5173

**Test Scenarios:**
1. [Scenario 1]
   - Action: [What I did]
   - Expected: [What should happen]
   - Result: ✅ [What actually happened]

2. [Scenario 2]
   - Action: [What I did]
   - Expected: [What should happen]
   - Result: ✅ [What actually happened]

3. Error case: [Error scenario]
   - Action: [What I did to trigger error]
   - Expected: [Expected error handling]
   - Result: ✅ [Error handled correctly]

**Browser Testing:**
- [ ] No console errors in DevTools
- [ ] No TypeScript errors
- [ ] Network requests successful (checked Network tab)
- [ ] Responsive design works (tested at 1920px, 1024px, 375px)

### Cross-Repo Compatibility (if applicable)
- [ ] Works with current API version (no backend changes needed)
- OR
- [ ] Coordinated with backend PR: [link to blecx/AI-Agent-Framework PR]
- [ ] Tested with backend API version: [version/commit]

## Screenshots/Videos (if UI changes)
[Include screenshots showing before/after or demonstrating new feature]

## Deployment Notes
- [ ] No environment variable changes needed
- OR
- [ ] Environment variables affected: [List variables and whether rebuild required]

## Breaking Changes
- [ ] No breaking changes
- OR
- [ ] Breaking changes: [Describe impact and migration path]

## Additional Notes
[Any other context, known limitations, follow-up work needed]

---

## Usage Instructions

1. Copy the prompt section above
2. Fill in all the validation details (actually run the tests!)
3. Check all applicable checkboxes
4. Include screenshots for UI changes
5. Ensure strong traceability: Issue → PR → Commit
6. Request squash merge to maintain clean history
