# Implementation Issue Prompt Template

Use this prompt to draft a detailed implementation issue from your feature plan.

---

## Prompt

Create a detailed implementation issue for the AI-Agent-Framework-Client with the following structure:

**Issue Title**: [Action verb] [specific component/feature] [context]
- Example: "Add timeout handling to health check API call"
- Example: "Create ProjectSettings component for configuration"

**Description**:

### Goal
[1-2 sentences: What needs to be done and why]

### Acceptance Criteria
- [ ] [Specific, testable criteria 1]
- [ ] [Specific, testable criteria 2]
- [ ] [Specific, testable criteria 3]
- [ ] Lint passes: `cd client && npm run lint`
- [ ] Build succeeds: `cd client && npm run build`

### Files to Modify/Create
- `client/src/[path/to/file.tsx]` - [What changes to make]
- `client/src/[path/to/file.css]` - [What changes to make]
- [Additional files as needed]

### Implementation Details
[Specific technical guidance:]
- API endpoints involved: [List endpoints from `client/src/services/api.ts`]
- Components affected: [List components]
- Types/interfaces needed: [List TypeScript types to add/modify]
- Error handling: [How to handle errors]

### Cross-Repo Dependencies
- [ ] No backend API changes needed
- OR
- [ ] Backend API changes required: [Link to backend issue in blecx/AI-Agent-Framework]
  - Endpoint: [Describe endpoint change]
  - Timeline: [When will backend changes be available]

### Testing Plan
**Manual Testing Steps:**
1. Start API: `cd ../AI-Agent-Framework && docker compose up -d`
2. Start client: `cd client && npm run dev`
3. Navigate to: [URL or component]
4. Test scenario: [Describe user actions]
5. Expected result: [What should happen]

**Validation Checklist:**
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] No console errors in browser
- [ ] Feature works as expected in browser
- [ ] Error cases handled gracefully

### Related Issues
- Depends on: #[issue number]
- Blocks: #[issue number]
- Part of: [Link to feature plan/parent issue]

### Estimated Time
[1-2 hours] (Keep issues small!)

---

## Usage Instructions

1. Copy the prompt section above
2. Fill in the specific details for your issue
3. Create the issue in GitHub
4. Reference the issue number in your PR when implementing
5. Use `pr-description.md` template when ready to open PR
