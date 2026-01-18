# Issue #25: Add Project Management Routing

**Priority:** 🔴 Critical - BLOCKER  
**Estimated:** 3-4 hours  
**Branch:** `issue/25-project-management-routing`  
**Started:** 2026-01-18

## Issue Description

Set up routing for RAID and workflow management pages. This is infrastructure work to enable project-specific navigation.

**GitHub Issue:** https://github.com/blecx/AI-Agent-Framework-Client/issues/25

**Dependencies:**

- ⚠️ **DEPENDS ON:** Issue #1 (API service layer) - ✅ RESOLVED

## Current State

### Application Architecture

- **Framework:** React 19.2.3 with TypeScript 5.9.3
- **Build Tool:** Vite 7.3.1
- **Entry Point:** `src/main.tsx` → renders `<App />` in StrictMode
- **Main Component:** `src/App.tsx` (218 lines)
  - Currently a single-page chat application
  - No routing infrastructure exists
  - Uses local state management (no React Context yet)

### Current App.tsx Structure

```tsx
function App() {
  // State: conversations, currentConversationId, isLoading, error, currentWorkflow
  // Services: ApiService, WorkflowService, HistoryService
  // Components: <Sidebar>, <ChatArea>, <ChatInput>, <WorkflowPanel>
  // Layout: Fixed sidebar + main content area
}
```

### Existing Services (src/services/)

- `apiService.ts` - HTTP client for backend API (✅ from Issue #1)
- `workflowService.ts` - Workflow state management
- `historyService.ts` - Conversation history (localStorage)

### Current Dependencies

```json
{
  "dependencies": {
    "axios": "^1.13.2",
    "react": "^19.2.3",
    "react-dom": "^19.2.3"
  }
}
```

**⚠️ CRITICAL:** No routing library installed - need to add React Router v6

### No Existing Routing

- Single-page application
- No route definitions
- No URL-based navigation
- No project context provider
- No navigation guards

## Required Changes

### 1. Add React Router v6 Dependency

```bash
npm install react-router-dom@^6
npm install --save-dev @types/react-router-dom
```

### 2. Create Project Context Provider

New file: `src/contexts/ProjectContext.tsx`

- Manage current project state
- Provide project key to child components
- Handle project switching

### 3. Implement Route Structure

Target routes from issue:

- `/` - Home/Dashboard
- `/projects` - Project list
- `/projects/:key` - Project detail
- `/projects/:key/raid` - RAID register view
- `/projects/:key/workflow` - Workflow management

**Note:** Issue description mentions `/projects/:key/raid` and `/projects/:key/workflow`, but tracking file acceptance criteria include more routes:

- `/projects/:key` - Project detail
- `/projects/:key/raid` - RAID register

Let me check if there are more routes needed...

### 4. Update App Architecture

```
main.tsx
  └─ <BrowserRouter>
       └─ <ProjectProvider>
            └─ <Routes>
                 ├─ "/" → Home
                 ├─ "/projects" → ProjectList
                 ├─ "/projects/:key" → ProjectDetail
                 ├─ "/projects/:key/raid" → RAIDView
                 ├─ "/projects/:key/workflow" → WorkflowView
                 └─ "*" → NotFound
```

### 5. Create Placeholder Pages

Need to create:

- `src/pages/Home.tsx`
- `src/pages/ProjectList.tsx`
- `src/pages/ProjectDetail.tsx`
- `src/pages/RAIDView.tsx`
- `src/pages/WorkflowView.tsx`
- `src/pages/NotFound.tsx`

### 6. Add Navigation Components

- Update `Sidebar` component with route links
- OR create new `Navigation` component
- Add breadcrumb navigation (from tracking file criteria)

### 7. Protected Routes (if needed)

- Evaluate if auth guards needed
- Issue mentions "Add route guards if needed"
- For now: placeholder structure, can enhance later

## Technical Approach

### Strategy: Incremental Migration

**Phase A: Install and Setup (30 min)**

1. Install React Router v6 + types
2. Wrap app in `<BrowserRouter>`
3. Create basic route structure
4. Verify routing works

**Phase B: Create Placeholder Pages (30 min)**

1. Create all 6 page components
2. Simple placeholder content
3. Test navigation between routes

**Phase C: Project Context (45 min)**

1. Create ProjectContext with provider
2. Add project key state management
3. Integrate with routes
4. Test context availability

**Phase D: Navigation UI (45 min)**

1. Add navigation links to Sidebar OR create Navigation component
2. Implement breadcrumb component
3. Style active route indicators
4. Test all navigation flows

**Phase E: Route Guards & Polish (30 min)**

1. Add basic route guard structure (if needed)
2. Handle 404 cases
3. Test edge cases
4. Final verification

### Key Design Decisions

1. **React Router v6:** Latest stable, modern API with hooks
2. **BrowserRouter vs HashRouter:** Use BrowserRouter (requires nginx config for production)
3. **Nested Routes:** Use nested route structure for `/projects/:key/*`
4. **Context vs Redux:** Start with Context API (simpler, sufficient for now)
5. **Breadcrumbs:** Create reusable component, auto-generate from route config

### Potential Risks

1. **Vite proxy config:** May need to update for client-side routing (check vite.config.ts)
2. **Nginx config:** Production deployment needs fallback to index.html (check nginx.conf)
3. **Existing App.tsx complexity:** Need to carefully migrate chat UI to home route
4. **Breaking changes:** Existing functionality must continue to work

## Implementation Plan

### Step 1: Install Dependencies (5 min)

```bash
cd /home/sw/work/AI-Agent-Framework/_external/AI-Agent-Framework-Client
npm install react-router-dom@^6
npm install --save-dev @types/react-router-dom
```

**Verification:** Check package.json updated, node_modules installed

### Step 2: Create Project Context (15 min)

**File:** `src/contexts/ProjectContext.tsx`

```tsx
import { createContext, useContext, useState, ReactNode } from 'react';

interface ProjectContextType {
  currentProjectKey: string | null;
  setCurrentProjectKey: (key: string | null) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [currentProjectKey, setCurrentProjectKey] = useState<string | null>(
    null,
  );

  return (
    <ProjectContext.Provider
      value={{ currentProjectKey, setCurrentProjectKey }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within ProjectProvider');
  }
  return context;
}
```

**Test:** Create context, verify exports

### Step 3: Create Placeholder Pages (30 min)

**Files to create:**

`src/pages/Home.tsx`:

```tsx
export function Home() {
  return (
    <div>
      <h1>Home</h1>
      <p>Welcome to AI Agent Framework</p>
      {/* TODO: Migrate existing chat UI here or keep separate */}
    </div>
  );
}
```

`src/pages/ProjectList.tsx`:

```tsx
export function ProjectList() {
  return (
    <div>
      <h1>Projects</h1>
      <p>Project list placeholder</p>
    </div>
  );
}
```

`src/pages/ProjectDetail.tsx`:

```tsx
import { useParams } from 'react-router-dom';
import { useProject } from '../contexts/ProjectContext';

export function ProjectDetail() {
  const { key } = useParams<{ key: string }>();
  const { setCurrentProjectKey } = useProject();

  useEffect(() => {
    setCurrentProjectKey(key || null);
  }, [key, setCurrentProjectKey]);

  return (
    <div>
      <h1>Project: {key}</h1>
      <p>Project detail placeholder</p>
    </div>
  );
}
```

`src/pages/RAIDView.tsx`:

```tsx
import { useParams } from 'react-router-dom';
import { useProject } from '../contexts/ProjectContext';

export function RAIDView() {
  const { key } = useParams<{ key: string }>();
  const { currentProjectKey } = useProject();

  return (
    <div>
      <h1>RAID Register - {key}</h1>
      <p>RAID view placeholder</p>
    </div>
  );
}
```

`src/pages/WorkflowView.tsx`:

```tsx
import { useParams } from 'react-router-dom';
import { useProject } from '../contexts/ProjectContext';

export function WorkflowView() {
  const { key } = useParams<{ key: string }>();

  return (
    <div>
      <h1>Workflow - {key}</h1>
      <p>Workflow view placeholder</p>
    </div>
  );
}
```

`src/pages/NotFound.tsx`:

```tsx
import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div>
      <h1>404 - Page Not Found</h1>
      <Link to="/">Go Home</Link>
    </div>
  );
}
```

**Test:** Import each page, verify they render

### Step 4: Setup Routing in main.tsx (10 min)

**Update:** `src/main.tsx`

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
```

**Test:** App still renders without errors

### Step 5: Create Routes Component (15 min)

**New file:** `src/AppRoutes.tsx`

```tsx
import { Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { ProjectList } from './pages/ProjectList';
import { ProjectDetail } from './pages/ProjectDetail';
import { RAIDView } from './pages/RAIDView';
import { WorkflowView } from './pages/WorkflowView';
import { NotFound } from './pages/NotFound';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/projects" element={<ProjectList />} />
      <Route path="/projects/:key" element={<ProjectDetail />} />
      <Route path="/projects/:key/raid" element={<RAIDView />} />
      <Route path="/projects/:key/workflow" element={<WorkflowView />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
```

**Test:** Import in App.tsx, verify routing works

### Step 6: Update App.tsx to Use Routing (20 min)

**Update:** `src/App.tsx`

Major changes:

1. Wrap in ProjectProvider
2. Use AppRoutes instead of direct components
3. Keep existing layout structure (Sidebar + content area)
4. Move chat UI to Home route OR keep as separate route

**Decision needed:**

- Option A: Keep existing chat as "/" route
- Option B: Move chat to "/chat" and create new home page
- **RECOMMENDED:** Option B for cleaner separation

### Step 7: Create Breadcrumb Component (20 min)

**New file:** `src/components/Breadcrumb.tsx`

```tsx
import { Link, useLocation } from 'react-router-dom';

export function Breadcrumb() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  return (
    <nav aria-label="Breadcrumb">
      <ol>
        <li>
          <Link to="/">Home</Link>
        </li>
        {pathSegments.map((segment, index) => {
          const path = '/' + pathSegments.slice(0, index + 1).join('/');
          const isLast = index === pathSegments.length - 1;

          return (
            <li key={path}>
              {isLast ? segment : <Link to={path}>{segment}</Link>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
```

**Test:** Render on different routes, verify correct breadcrumbs

### Step 8: Add Navigation to Sidebar (15 min)

**Update:** `src/components/Sidebar.tsx`

Add navigation links:

```tsx
import { NavLink } from 'react-router-dom';

// In Sidebar component:
<nav>
  <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')}>
    Home
  </NavLink>
  <NavLink to="/projects">Projects</NavLink>
  {/* Add more links as needed */}
</nav>;
```

**Test:** Click links, verify navigation works

### Step 9: Optional Route Guards (10 min)

**If needed:** Create ProtectedRoute component

```tsx
import { Navigate } from 'react-router-dom';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = true; // TODO: Implement actual auth check

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
```

**For now:** Skip this unless auth is immediately needed

### Step 10: Write Tests (30 min)

**Files to create:**

`src/test/routing.test.tsx`:

- Test route navigation
- Test 404 handling
- Test project context

`src/test/Breadcrumb.test.tsx`:

- Test breadcrumb rendering
- Test link generation

**Test commands:**

```bash
npm test src/test/routing.test.tsx
npm test src/test/Breadcrumb.test.tsx
```

## Acceptance Criteria Checklist

From tracking file:

- [ ] React Router v6 setup
- [ ] Route definitions (/, /projects, /projects/:key, /projects/:key/raid, etc.)
- [ ] Protected routes (auth required) - **OR route guard structure**
- [ ] Navigation guards
- [ ] Breadcrumb component
- [ ] 404 Not Found page

From issue description:

- [ ] Routes are accessible and render placeholder pages
- [ ] Navigation works between routes
- [ ] Project context is available to child components

## Verification Plan

### Manual Testing

1. **Navigate to each route:**
   - http://localhost:5173/
   - http://localhost:5173/projects
   - http://localhost:5173/projects/TEST123
   - http://localhost:5173/projects/TEST123/raid
   - http://localhost:5173/projects/TEST123/workflow
   - http://localhost:5173/invalid-route (should show 404)

2. **Test navigation:**
   - Click sidebar links
   - Verify active route styling
   - Check breadcrumbs update correctly

3. **Test project context:**
   - Navigate to /projects/TEST123
   - Verify project key available in context
   - Navigate to /projects/TEST123/raid
   - Verify same project key still available

### Automated Tests

```bash
npm test
npm run build  # Verify no TypeScript errors
```

## Files to Create

**New directories:**

- `src/contexts/`
- `src/pages/`

**New files:**

1. `src/contexts/ProjectContext.tsx`
2. `src/pages/Home.tsx`
3. `src/pages/ProjectList.tsx`
4. `src/pages/ProjectDetail.tsx`
5. `src/pages/RAIDView.tsx`
6. `src/pages/WorkflowView.tsx`
7. `src/pages/NotFound.tsx`
8. `src/AppRoutes.tsx`
9. `src/components/Breadcrumb.tsx`
10. `src/test/routing.test.tsx`
11. `src/test/Breadcrumb.test.tsx`

**Files to modify:**

1. `package.json` (add dependencies)
2. `src/main.tsx` (add BrowserRouter)
3. `src/App.tsx` (integrate routing)
4. `src/components/Sidebar.tsx` (add navigation links)

**Files to check:**

1. `vite.config.ts` (ensure client-side routing supported)
2. `nginx.conf` (ensure SPA fallback configured)

## Total Estimated Time

- Step 1: Install Dependencies - 5 min
- Step 2: Create Project Context - 15 min
- Step 3: Create Placeholder Pages - 30 min
- Step 4: Setup Routing in main.tsx - 10 min
- Step 5: Create Routes Component - 15 min
- Step 6: Update App.tsx - 20 min
- Step 7: Create Breadcrumb Component - 20 min
- Step 8: Add Navigation to Sidebar - 15 min
- Step 9: Optional Route Guards - 10 min (skip for now)
- Step 10: Write Tests - 30 min

**Total: ~2.5 hours** (within 3-4 hour estimate)

Additional time for:

- Testing and debugging: 30-60 min
- Quality checks: 30 min
- Buffer: 30 min

**Realistic total: 3.5-4 hours** ✅ Matches estimate
