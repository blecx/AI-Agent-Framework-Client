# Copilot Prompt Templates

This directory contains reusable prompt templates to help maintain consistent development workflow for the AI-Agent-Framework-Client project.

## Available Templates

### 1. [Feature Planning](feature-planning.md)

**When to use**: Before starting any new feature development.

**Purpose**: Create a comprehensive plan with goal, scope, acceptance criteria, and issue breakdown.

**Output**: Feature plan document that can be referenced throughout implementation.

**Time**: 10-15 minutes

---

### 2. [Implementation Issue](implementation-issue.md)

**When to use**: When breaking down feature plan into individual GitHub issues.

**Purpose**: Create detailed, actionable issues with clear acceptance criteria and testing steps.

**Output**: GitHub issue ready to be assigned and worked on (1-2 hours of work).

**Time**: 5-10 minutes per issue

---

### 3. [PR Description](pr-description.md)

**When to use**: When opening a pull request for completed work.

**Purpose**: Document changes, validation performed, and testing results comprehensively.

**Output**: Complete PR description with validation checklist and test results.

**Time**: 10-15 minutes

---

### 4. [Cross-Repo Coordination](cross-repo-coordination.md)

**When to use**: When changes require coordination with the backend API (`blecx/AI-Agent-Framework`).

**Purpose**: Plan API contract changes and coordinate timeline between repos.

**Output**: Coordination plan with compatibility matrix and testing strategy.

**Time**: 15-20 minutes

---

### 5. [PR Review Rubric](pr-review-rubric.md)

**When to use**: When reviewing a PR manually or running a review agent.

**Purpose**: Ensure the stated goal/acceptance criteria are actually implemented, validated, and safe to merge.

**Output**: Pass/fail against acceptance criteria with evidence, plus an approve vs request-changes recommendation.

---

## Workflow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Feature Planning (feature-planning.md)                  │
│    - Define goal, scope, acceptance criteria               │
│    - Identify cross-repo dependencies                       │
│    - Break down into issues                                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Issue Creation (implementation-issue.md)                │
│    - Create small, focused issues (1-2 hours each)         │
│    - Include acceptance criteria and testing plan          │
│    - Link to feature plan                                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Implementation                                           │
│    - Work on one issue at a time                            │
│    - Keep changes minimal and focused                       │
│    - Test as you go                                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. PR Creation (pr-description.md)                         │
│    - Complete validation checklist                          │
│    - Document testing performed                             │
│    - Link to issue(s) resolved                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Code Review & Merge                                      │
│    - Prefer squash merge for clean history                  │
│    - Ensure strong traceability                             │
└─────────────────────────────────────────────────────────────┘
```

## Cross-Repo Coordination Flow

When changes affect both client and backend API:

```
┌────────────────────────────────────────────────────────────┐
│ 1. Identify API Changes Needed                            │
│    (Use cross-repo-coordination.md)                        │
└────────────────────┬───────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────┐
│ 2. Create Backend Issue (blecx/AI-Agent-Framework)        │
│    - Document API contract changes                         │
│    - Define request/response formats                       │
└────────────────────┬───────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────┐
│ 3. Implement Backend PR                                    │
│    - Merge to main                                         │
│    - Update API docs                                       │
└────────────────────┬───────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────┐
│ 4. Create Client Issue (this repo)                        │
│    - Reference backend issue/PR                            │
│    - Use implementation-issue.md template                  │
└────────────────────┬───────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────┐
│ 5. Implement Client PR                                     │
│    - Update API client methods                             │
│    - Update UI components                                  │
│    - Test against new backend                              │
└────────────────────────────────────────────────────────────┘
```

## Quick Start

### For New Features

```bash
# 1. Use feature planning template
cat .github/prompts/feature-planning.md

# 2. Create issues from plan
# Use implementation-issue.md for each issue

# 3. Implement one issue at a time
git checkout -b feature/issue-123-description

# 4. Open PR with pr-description.md template
```

### For Cross-Repo Changes

```bash
# 1. Plan coordination
cat .github/prompts/cross-repo-coordination.md

# 2. Create backend issue first
# In blecx/AI-Agent-Framework repo

# 3. Wait for backend PR merge

# 4. Create client issue and PR
# In this repo
```

## Tips for Using Templates

1. **Don't skip the planning step** - 15 minutes of planning saves hours of rework
2. **Keep issues small** - If an issue takes more than 2 hours, break it down further
3. **Fill out all sections** - Each section serves a purpose for traceability
4. **Link everything** - Plan → Issues → PRs → Commits should all reference each other
5. **Test thoroughly** - Complete all validation steps before opening PR

## Validation Commands

**ALWAYS run these before committing:**

```bash
cd client
npm run lint         # Must pass with 0 errors
npm run build        # Must succeed
```

**For UI changes, also test in browser:**

```bash
cd client
npm run dev          # Open http://localhost:5173
# Manual testing with DevTools open (F12)
```

## Need Help?

- **Workflow questions**: See `.github/copilot-instructions.md`
- **Build/test issues**: See `docs/DEVELOPMENT.md`
- **API integration**: See `docs/DEVELOPMENT.md#api-endpoints-reference`
- **Production deployment**: See `docs/PRODUCTION.md`

## Contributing to Templates

If you find these templates helpful and want to suggest improvements:

1. Create an issue describing the improvement
2. Follow the workflow above (yes, meta!)
3. Submit PR with updated template(s)
