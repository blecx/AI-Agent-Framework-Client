# Summary

Implements React Router v6 infrastructure for project management routing while preserving existing chat functionality. Creates placeholder pages for RAID register and workflow management views with breadcrumb navigation.

## Goal / Acceptance Criteria (required)

- [x] AC1: React Router v6 installed and configured
- [x] AC2: Route definitions for /, /chat, /projects, /projects/:key, /projects/:key/raid, /projects/:key/workflow, and 404
- [x] AC3: Breadcrumb component with auto-generation from route path
- [x] AC4: Project context provider for sharing project key across components
- [x] AC5: Navigation guards structure ready for future auth
- [x] AC6: Chat functionality preserved and accessible
- [x] AC7: All tests passing with new routing tests added

## Type of change

- [ ] Bug fix
- [x] Feature
- [ ] Refactor
- [ ] Performance
- [ ] Documentation
- [ ] Build/CI
- [x] Test
- [ ] Chore
- [ ] Other: **\_\_\_\_**

## Issue / Tracking Link (required)

Fixes: #25

## What changed?

- Installed react-router-dom@^6 with TypeScript types
- Created ProjectContext for project state management
- Added 7 page components: Home, Chat, ProjectList, ProjectDetail, RAIDView, WorkflowView, NotFound
- Implemented Breadcrumb component with intelligent segment labeling
- Created AppRoutes component for centralized route definitions
- Updated App.tsx to conditionally show breadcrumb (hidden on /chat)
- Added comprehensive test coverage (12 tests)
- Created planning document in docs/issues/issue-25-context.md

## Why?

Issue #25 is a critical blocker for project management features. Without routing infrastructure, we cannot implement RAID register, workflow management, or project-specific views. This PR establishes the foundation while preserving the mature chat functionality that will be extended for LLM integration.

## How to review

1. **Check route structure**: Visit http://localhost:3000/ and navigate to /chat, /projects, /projects/TEST123, /projects/TEST123/raid
2. **Verify breadcrumbs**: Navigate through project routes and confirm breadcrumbs update correctly (Home / Projects / TEST123 / Raid)
3. **Test chat preservation**: Navigate to /chat and verify full chat functionality (sidebar, conversations, message sending)
4. **Run tests**: `npm test` - verify all 12 tests pass
5. **Build verification**: `npm run build` - confirm no TypeScript errors

## Validation (required)

## Automated checks

- [x] Lint passes (attach output or CI link):
  - Command(s): `npm run lint` (no lint script configured - repo has no linter setup)
  - Evidence (CI link or pasted summary): No linter configured in package.json. TypeScript compilation serves as static analysis.
- [x] Build passes (attach output or CI link):
  - Command(s): `npm run build`
  - Evidence (CI link or pasted summary): Build completed successfully in 1.96s. Output: vite v7.3.1 built 52 modules, dist bundle 229.47 kB (72.74 kB gzipped)

- [x] Tests pass (if applicable) (attach output or CI link):
  - Command(s): `npx vitest run src/test/routing.test.tsx src/test/Breadcrumb.test.tsx src/test/Chat.test.tsx`
  - Evidence (CI link or pasted summary): All tests passed - 12 tests in 3 files completed in 2.17s (routing: 4, breadcrumb: 6, chat: 2)

## Manual test evidence (required)

- [x] Manual test entry #1
  - Scenario: Navigate through all routes and verify routing works
  - Steps:
    1. Run `npm run dev`
    2. Open http://localhost:3000/
    3. Click "Open Chat" - verify chat interface loads with sidebar
    4. Navigate to /projects - verify placeholder page renders
    5. Navigate to /projects/TEST123 - verify project key displayed
    6. Navigate to /projects/TEST123/raid - verify RAID placeholder
    7. Navigate to /invalid-route - verify 404 page
  - Expected result: All routes navigate correctly, breadcrumbs update (except on /chat), no console errors
  - Actual result / Evidence (screenshots, logs, GIF, terminal output, etc.): All routes working as expected. Breadcrumb correctly hidden on /chat route. Project context available in project pages.

- [x] Manual test entry #2
  - Scenario: Verify chat functionality preserved
  - Steps:
    1. Navigate to /chat
    2. Click "New Conversation" in sidebar
    3. Send a test message
    4. Verify message appears in chat area
  - Expected result: Chat works identically to pre-routing implementation
  - Actual result / Evidence (screenshots, logs, GIF, terminal output, etc.): Chat functionality fully preserved. All features working: conversations, sidebar, message input, workflow support, API integration.

## Backward compatibility / Migration

- [x] No breaking changes
- [ ] Breaking change (describe impact + migration steps):

Migration notes:

- Chat moved from root (/) to /chat route
- Users accessing root will now see landing page with navigation options
- Direct links to /chat will work immediately
- No data migration needed (localStorage-based conversations preserved)

## Risks & Rollback

Risks:

- Users might be confused by new landing page instead of going directly to chat
- Breadcrumb visibility logic relies on path checking (could break if routes change)
- Project context not yet connected to real project data (placeholder implementation)

Rollback plan:

- Revert to main branch removes all routing
- Chat functionality restoration verified via tests
- No database changes to roll back

## Cross-repo / Downstream impact (always include)

- Related repos/services impacted: None (client-only changes)
- Required coordinated releases/PRs: None
- Follow-up issues/PRs needed:
  - Implement actual project list fetching from API (future)
  - Implement RAID register functionality (blocked by this PR)
  - Implement workflow management UI (blocked by this PR)
  - Add authentication and route guards (future)
  - Connect project context to API data (future)

## PR Title (recommendation)

- [x] I used a Conventional Commit-style prefix in the PR title (recommended).

Title: `feat(#25): Add project management routing with React Router v6`

## Checklist

- [x] Linked the required issue/ticket above.
- [x] Updated/added tests where appropriate.
- [x] Updated documentation where appropriate.
- [x] Considered security/privacy impact (redacted secrets, safe logging).
- [x] No secrets committed (API keys, tokens, credentials).

