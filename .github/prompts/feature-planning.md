# Feature Planning Prompt Template

Use this prompt to plan a new feature before creating issues.

---

## Prompt

I need to plan a new feature for the AI-Agent-Framework-Client. Please help me create a detailed plan with the following structure:

**Feature Name**: [Brief name of the feature]

**Goal**: [What problem does this solve? What value does it provide?]

**Scope**: 
- What's included:
  - [Bullet list of what will be done]
- What's NOT included (out of scope):
  - [Bullet list of what won't be done in this feature]

**Acceptance Criteria**:
- [ ] [Specific, measurable criteria 1]
- [ ] [Specific, measurable criteria 2]
- [ ] [Specific, measurable criteria 3]

**Constraints**:
- Technical: [Any technical limitations or requirements]
- Dependencies: [External dependencies, backend API changes needed]
- Timeline: [Any time constraints]
- Compatibility: [Browser support, Node version, API version compatibility]

**Cross-Repo Impact**:
- [ ] Does this require backend API changes? (If yes, describe in detail)
- [ ] Does this require coordination with `blecx/AI-Agent-Framework`?
- [ ] Are there API contract changes needed?

**Implementation Approach** (high-level):
1. [Step 1 - e.g., "Update API client to add new endpoint"]
2. [Step 2 - e.g., "Create new UI component"]
3. [Step 3 - e.g., "Integrate component with API"]

**Issue Breakdown** (to be created):
Based on the plan above, suggest 3-5 small issues that can each be completed in 1-2 hours:
1. Issue 1: [Title] - [Brief description]
2. Issue 2: [Title] - [Brief description]
3. Issue 3: [Title] - [Brief description]

**Validation Plan**:
- [ ] `cd client && npm run lint` passes
- [ ] `cd client && npm run build` succeeds
- [ ] Feature works in browser (manual test scenarios listed below)
- [ ] No console errors in browser DevTools
- [ ] Responsive design works (test at different screen sizes)

**Manual Test Scenarios**:
1. [Scenario 1 - e.g., "User clicks new button, modal opens"]
2. [Scenario 2 - e.g., "User submits form, API call succeeds"]
3. [Scenario 3 - e.g., "Error case: API fails, error message displays"]

---

## Usage Instructions

1. Copy the prompt section above
2. Fill in the placeholders with your feature details
3. Use Copilot to help generate the detailed plan
4. Review and refine the plan
5. Use the issue breakdown to create GitHub issues
6. Proceed to implementation using `implementation-issue.md` template for each issue
