# Issue #27 – State management layer

**Issue:** <https://github.com/blecx/AI-Agent-Framework-Client/issues/27>

## Goal

Provide a consistent state management layer for Projects, RAID, and Workflow that is accessible across the app via hooks, includes loading/error state handling, and supports persisted UI preferences.

## Scope

- Add lightweight, dependency-free state management using **React Context + `useReducer`** (no Zustand dependency).
- Provide per-domain hooks and actions for:
  - Projects state
  - RAID state
  - Workflow state
  - UI preferences (persisted to `localStorage`)
- Wire the provider(s) at the app root so state is available throughout.
- Add unit tests for state logic and persistence.

## Non-goals

- Building full CRUD UI for Projects/RAID/Workflow (tracked by later issues).
- Backend API changes.

## Design choice

**React Context + reducer** keeps the change small and avoids adding a new runtime dependency. If later performance needs arise, we can migrate to Zustand without changing the consumer hook APIs.

## Acceptance criteria mapping

- **State accessible throughout app via hooks**: export `useProjectsState`, `useRaidState`, `useWorkflowState`, `useUiPreferences`.
- **Loading/error states managed consistently**: standardized `AsyncSlice<T>` shape (`status`, `data`, `error`), where `status` is one of `'idle' | 'loading' | 'success' | 'error'`.
- **State updates trigger re-renders correctly**: reducer-based immutable updates.
- **Unit tests pass**: vitest tests for reducer/actions and `localStorage` persistence.

## Target files

- `client/src/state/*` (new): state types, reducers, providers, hooks
- `client/src/App.tsx`: wrap app with providers
- `client/src/test/unit/state/*` (new): unit tests

## Validation

From repo root:

- `cd client && npm run test`
- `cd client && npm run build`
