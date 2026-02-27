# AI Agent Framework - React Client

**Chat-First Hybrid PM Application** for ISO 21500-based Project Management.

## 🎯 Overview

This client implements a **hybrid approach** combining AI-guided artifact creation with traditional UI:

- **Primary Interface:** AI chat for creating complex artifacts (project plans, RAID items, workflows)
- **Secondary Interface:** Web UI for viewing, editing, and quick-adds
- **AI-Guided Creation:** Templates guide AI conversations to ensure ISO 21500 compliance
- **Optional Forms:** Quick-add forms for simple RAID items as alternative to chat

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Client (Vite)                      │
├──────────────────────┬──────────────────────────────────────┤
│   Chat Interface     │         UI Interface                  │
│  (Primary Creation)  │    (Viewing + Quick-Adds)             │
├──────────────────────┼──────────────────────────────────────┤
│ • Natural language   │ • Project list/detail                 │
│ • Template-guided    │ • RAID register (list/detail/filters) │
│ • ISO 21500 prompts  │ • Quick-add forms (optional)          │
│ • Proposal workflow  │ • Artifact browsing                   │
└──────────────────────┴──────────────────────────────────────┘
                             │
                             ↓
              ┌──────────────────────────┐
              │   FastAPI Backend        │
              │   (ISO 21500 Templates)  │
              └──────────────────────────┘
```

## 🚀 Features

### Chat Interface (Primary)

- **AI-Guided Artifact Creation**: Create project plans, RAID items, workflows via natural language
- **ISO 21500 Templates**: Backend templates guide AI to ensure compliance
- **Propose → Review → Apply**: Workflow for reviewing AI-generated artifacts before applying
- **Step 2 Feature**: Templates guide AI conversations to generate proper ISO 21500 artifacts

### UI Interface (Secondary)

- **RAID Register**:
  - List view with filters (type, status, priority, owner, date range)
  - Detail/edit view with type-specific fields
  - Badge components for visual type/status/priority indicators
  - Optional quick-add modal for simple RAID items
- **Project Management**:
  - Project selector and context
  - Browse artifacts created via chat
- **Responsive Design**: Works on desktop and mobile

### Navigation Accessibility Baseline

- Collapsible navigation sections expose `aria-expanded` and `aria-controls` on toggle buttons.
- Artifact group controls preserve accessible expand/collapse semantics and clear focus-visible states.
- Navigation and grouping motion polish includes `prefers-reduced-motion` fallbacks.

## 🛠️ Tech Stack

- **React 19** + **TypeScript 5.9** - Modern React with strict typing
- **Vite 7** - Fast build tool with HMR
- **TanStack Query v5** - Data fetching and caching
- **React Router v7** - URL-based state management
- **Vitest** - Unit testing framework
- **Playwright** - E2E testing
- **ESLint 9** - Code quality

## 📦 Installation

```bash
npm install
```

## 🏃 Running

### Development

```bash
npm run dev
```

Opens at `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview  # Preview production build
```

### Testing

```bash
npm run lint                    # Lint code
npm run test                    # Run unit tests
npm run test -- --run           # Run tests once
npm run test -- --coverage      # With coverage
npm run e2e                     # Run E2E tests (requires backend)
```

## 🔄 Usage Examples

### Chat Interface

```
User: Create a risk for the project about database migration
AI:   [Proposes RAID item with ISO 21500 format]
User: apply
AI:   [Applies to backend, shows confirmation]
```

### UI Interface

1. **View RAID Items**: Navigate to RAID tab → Browse list
2. **Filter RAID**: Use filter panel (type/status/priority/owner/date)
3. **Edit RAID**: Click item → Edit form → Save
4. **Quick-Add** (Optional): Click "Add RAID Item" → Fill form → Create

## 📁 Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── raid/              # RAID-specific components
│   │   │   ├── RAIDBadge.tsx  # Type/status/priority badges
│   │   │   ├── RAIDFilters.tsx # Filter panel
│   │   │   └── RAIDCreateModal.tsx # Quick-add form
│   │   ├── ui/                # Reusable UI primitives
│   │   ├── ProjectView.tsx    # Main project view
│   │   ├── RAIDList.tsx       # RAID list with filters
│   │   ├── RAIDDetail.tsx     # RAID detail/edit
│   │   └── CommandPanel.tsx   # Chat interface
│   ├── services/
│   │   └── apiClient.ts       # API service layer
│   ├── state/                 # State management (React Context + useReducer)
│   ├── types/                 # TypeScript types
│   └── test/
│       ├── unit/              # Unit tests (121 passing, 23 test files)
│       └── e2e/               # Playwright E2E tests
├── e2e/                       # E2E test setup
├── package.json
├── vite.config.ts
└── vitest.config.ts
```

## 🧪 Testing

### Unit Tests (141 passing, 23 test files) ✅

All tests passing as of 2026-01-31

Run tests:

```bash
npm test              # Watch mode
npm test -- --run     # Run once
```

**Test Breakdown:**

- **RAID Components**: 76 tests (5 test files) - **COMPLETE** ✅
  - RAIDBadge: 25 tests (type/status/priority variants)
  - RAIDFilters: 14 tests (filter logic, URL sync)
  - RAIDList: 8 tests (list rendering, filtering)
  - RAIDDetail: 17 tests (edit, validation, API)
  - RAIDCreateModal: 12 tests (form validation, submission)
- **UI Components**: 11 tests (Button, Modal, Table, EmptyState, Skeleton)
- **State Management**: 20 tests (projects, RAID, workflow, preferences)
- **API Services**: 13 tests (error handling, retries)
- **Type Validation**: 4 tests (RAID types, workflow types)
- **Accessibility**: 5 tests (ARIA, keyboard nav)
- **Smoke Tests**: 4 tests (API integration)
- **Other**: 8 tests (ErrorBoundary, App, notifications)

**Test Quality:**

- All API calls properly mocked
- React Testing Library used throughout
- Comprehensive component coverage
- Duration: ~6.75s for full suite

### E2E Tests (Playwright)

- Project creation workflow
- Proposal → Review → Apply flow
- Navigation and artifact browsing
- Error handling

## 🔧 Configuration

### Environment Variables

```bash
# .env
VITE_API_URL=http://localhost:8000  # Backend API URL
```

### API Backend

Requires [AI-Agent-Framework](https://github.com/blecx/AI-Agent-Framework) backend running on port 8000.

## 📚 Key Concepts

### Chat-First Hybrid Approach

- **Complex Artifacts → Chat**: Project plans, workflows, detailed RAID items with context
- **Simple Artifacts → UI**: Quick RAID item adds, browsing, editing
- **AI Guidance**: Templates ensure ISO 21500 compliance without user needing to know standard
- **Step 2 Integration**: Templates guide AI conversations to generate proper artifacts

### Propose → Apply Workflow

1. User requests artifact via chat
2. AI generates proposal using ISO 21500 templates
3. User reviews proposal
4. User applies → Backend creates artifact
5. UI updates to show new artifact

### RAID Register

- **R**isks, **A**ssumptions, **I**ssues, **D**ependencies
- Type-specific fields (risks have impact/likelihood/mitigation)
- Filterable by type, status, priority, owner, date range
- URL-synchronized filters for bookmarking

### Audit Results Viewer

- **Audit Results**: View artifact compliance issues with severity filtering
- **Severity Levels**: Error (red), Warning (yellow), Info (blue)
- **Issue Details**: Shows artifact name, field, and validation message
- **Quick Fix Links**: Jump directly to artifact editor with field pre-focused
- **Run Audit**: Trigger new audit scan to validate all artifacts
- **Filtering**: Filter by severity level (all, errors, warnings, info)
- **Summary**: Visual summary showing count of issues by severity
- **Timestamp**: Shows when audit was last run

### Understanding Two Different Workflows

⚠️ **Important Distinction**: This application manages **two separate workflow concepts**:

#### 1. **AI Conversation Workflow** (Future: Step 2+)

- **Purpose**: Tracks the AI agent's conversation state during artifact creation
- **Example Steps**: "Gathering requirements" → "Validating inputs" → "Generating proposal" → "Awaiting approval"
- **Visibility**: Shows user where they are in the AI-guided creation process
- **Component**: Future `WorkflowPanel` or conversation stepper UI
- **Scope**: Chat interface only

#### 2. **ISO 21500 Project Workflow** (Future: Issue #39)

- **Purpose**: Tracks the project's lifecycle state according to ISO 21500 standard
- **States**: Initiation → Planning → Execution → Monitoring & Controlling → Closing → Closed
- **Visibility**: Shows current project phase for governance and compliance
- **Component**: Future `WorkflowStageIndicator` component
- **Scope**: Project-level state, affects both chat and UI interfaces
- **API**: `/api/v1/projects/{key}/workflow/state` and `/audit-events`

**Why Both Exist:**

- **Conversation Workflow** = "Where am I in this AI-guided task?"
- **Project Workflow** = "What phase is my project in according to ISO 21500?"

These are independent: a project in the "Execution" phase (ISO 21500) may have many AI conversations, each with their own conversation workflow steps.

## 🤝 Contributing

1. Follow existing patterns (React hooks, TypeScript strict mode)
2. Write tests for new components (Vitest + Testing Library)
3. Run `npm run lint` before committing
4. Update this README for new features

## 📄 License

Part of the AI-Agent-Framework project.

## 🔗 Related Documentation

- [Parent Project README](../../README.md)
- [Development Guide](../docs/DEVELOPMENT.md)
- [Testing Guide](../docs/TESTING.md)
- [E2E Testing](./e2e/README.md)
