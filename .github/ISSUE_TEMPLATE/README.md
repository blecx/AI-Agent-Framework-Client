# GitHub Issue Templates

This directory contains issue templates for the AI-Agent-Framework-Client repository.

## Available Templates

### 🐛 Bug Report (`bug_report.yml`)
Use this template when reporting bugs or unexpected behavior.

**What it collects:**
- Clear bug description and reproduction steps
- Expected vs actual behavior
- Environment details (browser, Node.js, Docker versions)
- Logs and screenshots
- Validation checklist (lint/build status)
- Cross-repo coordination (backend API involvement)

**When to use:**
- Application crashes or errors
- Unexpected behavior
- Performance issues
- UI/UX problems

### ✨ Feature Request (`feature_request.yml`)
Use this template when proposing new features or enhancements.

**What it collects:**
- Clear goal and problem statement
- In-scope and out-of-scope items
- Acceptance criteria (testable checklist)
- UX/design notes
- Cross-repo coordination (backend API changes needed?)
- Suggested issue breakdown (1-2 hour slices)
- Validation expectations

**When to use:**
- Proposing new functionality
- Requesting enhancements to existing features
- Suggesting UX improvements
- Planning larger initiatives (use issue breakdown section)

### ⚙️ Configuration (`config.yml`)
This file configures the issue template behavior.

**Current settings:**
- `blank_issues_enabled: false` - Requires using templates for quality control
- **Contact links** - Provides quick access to:
  - Documentation (README, Quick Start, Development Guide)
  - Copilot Instructions (workflow and conventions)
  - Backend API issues (blecx/AI-Agent-Framework)
  - Community discussions

## Design Principles

These templates are designed to be:

1. **LLM-Friendly**
   - Clear, explicit prompts
   - Structured data collection
   - Minimal ambiguity
   - Easy for Copilot to understand and process

2. **Workflow-Aligned**
   - Supports **Plan → Issues → PRs** workflow
   - Encourages small, focused issues (1-2 hours)
   - Emphasizes one issue per PR
   - Includes cross-repo coordination checks

3. **Repository-Specific**
   - References `client/` directory for npm commands
   - Includes validation commands (`npm run lint`, `npm run build`)
   - Acknowledges dependency on backend API
   - Mentions Vite build-time environment variables

4. **Quality-Focused**
   - Required fields for critical information
   - Built-in validation checklists
   - Encourages breaking work into small pieces
   - Prevents scope creep with explicit scope boundaries

## Cross-Repo Coordination

Both templates include **Cross-Repo Coordination** sections because this client depends on the **AI-Agent-Framework** backend API (`blecx/AI-Agent-Framework`).

**Key coordination points:**
- Determine if backend changes are needed
- Link related backend issues/PRs
- Follow proper implementation order:
  1. Backend API issue → Backend PR → Backend merge
  2. Client issue → Client PR → Client merge

**Key files for API integration:**
- `client/src/services/api.ts` - API client methods
- `client/src/services/apiClient.ts` - Base API configuration
- Backend: `blecx/AI-Agent-Framework` endpoints

## Validation Commands

All templates reference these standard validation commands:

```bash
# From repository root
cd client

# Lint (must pass with 0 errors)
npm run lint

# Build (must succeed)
npm run build

# Development server
npm run dev
```

**Important:** All npm commands MUST be run from the `client/` directory.

## Best Practices

When creating issues:

1. **Search first** - Avoid duplicate issues
2. **Use templates** - They ensure complete information
3. **Be specific** - Clear reproduction steps and acceptance criteria
4. **Keep scope small** - 1-2 hours of work per issue
5. **Link related items** - Reference other issues, PRs, or plans
6. **Check backend impact** - Coordinate with AI-Agent-Framework if needed
7. **Follow workflow** - Plan → Issues → PRs

## Template Maintenance

When updating templates:

1. Validate YAML syntax: `python3 -c "import yaml; yaml.safe_load(open('template.yml'))"`
2. Test in GitHub's issue creation UI
3. Ensure alignment with `.github/copilot-instructions.md`
4. Update this README if template structure changes
5. Keep language consistent with `PULL_REQUEST_TEMPLATE.md`

## References

- [GitHub Issue Forms Documentation](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-issue-forms)
- Repository workflow: `.github/copilot-instructions.md`
- PR template: `.github/PULL_REQUEST_TEMPLATE.md`
- Main documentation: `README.md`, `QUICKSTART.md`, `docs/DEVELOPMENT.md`
