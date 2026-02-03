# State Management Patterns

This document describes state management patterns and best practices used in the AI-Agent-Framework-Client React application.

## Table of Contents

- [Overview](#overview)
- [Decision Tree](#decision-tree)
- [useState Pattern](#usestate-pattern)
- [useReducer Pattern](#usereducer-pattern)
- [Context API Pattern](#context-api-pattern)
- [Custom Hooks Pattern](#custom-hooks-pattern)
- [State Lifting Pattern](#state-lifting-pattern)
- [Best Practices](#best-practices)

## Overview

State management in React involves choosing the right tool for the right job. This codebase uses:

1. **Local Component State** (`useState`) - Simple, isolated component state
2. **Reducer State** (`useReducer`) - Complex state logic with multiple transitions
3. **Global State** (Context API) - Shared state across component tree
4. **Custom Hooks** - Reusable state logic patterns

## Decision Tree

```
┌─────────────────────────────────────┐
│ Do you need to share state across   │
│ multiple components?                 │
└───────────┬─────────────────────────┘
            │
     ┌──────┴──────┐
     │ YES         │ NO
     │             │
     ▼             ▼
┌─────────────┐  ┌────────────────────────┐
│ Context API │  │ Is state logic complex  │
│ (Global)    │  │ with many transitions?  │
└─────────────┘  └───────────┬────────────┘
                             │
                      ┌──────┴──────┐
                      │ YES         │ NO
                      │             │
                      ▼             ▼
                 ┌──────────┐   ┌──────────┐
                 │useReducer│   │ useState │
                 └──────────┘   └──────────┘
```

**Additional Considerations:**

- **Custom Hook?** If state logic is reusable across components, extract to custom hook
- **State Lifting?** If sibling components need shared state, lift to common parent
- **Server State?** Consider React Query or SWR (not implemented yet)

## useState Pattern

Use `useState` for simple, isolated component state.

### When to Use useState

- Simple boolean flags (isLoading, isOpen, isVisible)
- Single primitive values (count, text, selectedId)
- Independent state variables with no complex relationships
- State that doesn't require complex update logic

### Example: Simple Toggle State

```tsx
import { useState } from 'react';

function ToggleButton() {
  const [isActive, setIsActive] = useState(false);

  return (
    <button onClick={() => setIsActive(!isActive)}>
      {isActive ? 'Active' : 'Inactive'}
    </button>
  );
}
```

### Example: Online Status Hook (from codebase)

From `src/hooks/useOnlineStatus.ts`:

```tsx
import { useState, useEffect } from 'react';

export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
```

**Why useState here?**
- Single boolean value
- Simple state transitions (online/offline)
- No complex update logic

## useReducer Pattern

Use `useReducer` for complex state logic with multiple state transitions.

### When to Use useReducer

- Complex state objects with interdependent properties
- Multiple ways to update the same state
- State transitions that depend on previous state
- State logic that needs to be testable in isolation
- When `useState` with multiple setters becomes hard to manage

### Example: Form State with Multiple Actions

```tsx
import { useReducer } from 'react';

type State = {
  title: string;
  description: string;
  status: 'draft' | 'submitted' | 'error';
  errors: string[];
};

type Action =
  | { type: 'SET_FIELD'; field: keyof State; value: string }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_SUCCESS' }
  | { type: 'SUBMIT_ERROR'; errors: string[] }
  | { type: 'RESET' };

function formReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'SUBMIT_START':
      return { ...state, status: 'submitted', errors: [] };
    case 'SUBMIT_SUCCESS':
      return { title: '', description: '', status: 'draft', errors: [] };
    case 'SUBMIT_ERROR':
      return { ...state, status: 'error', errors: action.errors };
    case 'RESET':
      return { title: '', description: '', status: 'draft', errors: [] };
    default:
      return state;
  }
}

function ComplexForm() {
  const [state, dispatch] = useReducer(formReducer, {
    title: '',
    description: '',
    status: 'draft',
    errors: [],
  });

  const handleSubmit = async () => {
    dispatch({ type: 'SUBMIT_START' });
    try {
      // API call here
      dispatch({ type: 'SUBMIT_SUCCESS' });
    } catch (error) {
      dispatch({ type: 'SUBMIT_ERROR', errors: ['Failed to submit'] });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={state.title}
        onChange={(e) =>
          dispatch({ type: 'SET_FIELD', field: 'title', value: e.target.value })
        }
      />
      {/* ... more fields ... */}
    </form>
  );
}
```

**Why useReducer here?**
- Multiple related state values (title, description, status, errors)
- Complex state transitions (draft → submitting → success/error)
- Predictable state updates via actions
- Easier to test reducer function in isolation

## Context API Pattern

Use Context API to share state across multiple components without prop drilling.

### When to Use Context

- State needed by many components at different nesting levels
- Global application state (current user, theme, selected project)
- Avoid prop drilling through many intermediate components
- State that changes infrequently

### Example: Project Context (from codebase)

From `src/contexts/ProjectContext.tsx`:

```tsx
import { createContext, useContext, useState, ReactNode } from 'react';

const STORAGE_KEY = 'ai-agent-framework:current-project';

interface ProjectContextType {
  currentProjectKey: string | null;
  setCurrentProjectKey: (key: string | null) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  // Initialize from localStorage
  const [currentProjectKey, setCurrentProjectKeyState] = useState<string | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? stored : null;
    } catch (error) {
      console.warn('Failed to load project from localStorage:', error);
      return null;
    }
  });

  // Persist to localStorage when project changes
  const setCurrentProjectKey = (key: string | null) => {
    setCurrentProjectKeyState(key);
    try {
      if (key) {
        localStorage.setItem(STORAGE_KEY, key);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.warn('Failed to save project to localStorage:', error);
    }
  };

  return (
    <ProjectContext.Provider value={{ currentProjectKey, setCurrentProjectKey }}>
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

**Usage in components:**

```tsx
import { useProject } from '../contexts/ProjectContext';

function ProjectHeader() {
  const { currentProjectKey, setCurrentProjectKey } = useProject();

  return (
    <div>
      <h2>Current Project: {currentProjectKey || 'None'}</h2>
      <button onClick={() => setCurrentProjectKey('PROJ-001')}>
        Select Project
      </button>
    </div>
  );
}
```

**Key patterns in this example:**
- Lazy initialization from localStorage
- Custom hook (`useProject`) for accessing context
- Error boundary (throws if used outside provider)
- Side effects (localStorage sync) in setter

## Custom Hooks Pattern

Extract reusable state logic into custom hooks.

### When to Create Custom Hooks

- State logic used in multiple components
- Complex state patterns that can be abstracted
- State + side effects that form a cohesive unit
- Want to hide implementation details from consumers

### Example: Optimistic Update Hook (from codebase)

From `src/hooks/useOptimisticUpdate.ts`:

```tsx
import { useState, useCallback } from 'react';
import { toast } from '../components/ui/Toast';

export interface OptimisticUpdateOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error, rollbackData: T) => void;
  successMessage?: string;
  errorMessage?: string;
}

export function useOptimisticUpdate<T>(
  options: OptimisticUpdateOptions<T> = {}
) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isOptimistic, setIsOptimistic] = useState(false);

  const update = useCallback(
    async (optimisticData: T, updateFn: (data: T) => Promise<T>) => {
      setIsOptimistic(true);
      setIsUpdating(true);

      try {
        const result = await updateFn(optimisticData);
        setIsOptimistic(false);
        setIsUpdating(false);

        if (options.onSuccess) {
          options.onSuccess(result);
        }
        if (options.successMessage) {
          toast.success(options.successMessage);
        }

        return result;
      } catch (error) {
        setIsOptimistic(false);
        setIsUpdating(false);

        if (options.onError) {
          options.onError(error as Error, optimisticData);
        }
        if (options.errorMessage) {
          toast.error(options.errorMessage);
        }

        return null;
      }
    },
    [options]
  );

  return { update, isUpdating, isOptimistic };
}
```

**Usage:**

```tsx
function RaidItem({ item }) {
  const { update, isOptimistic } = useOptimisticUpdate({
    successMessage: 'Item updated',
    errorMessage: 'Failed to update item',
  });

  const handleUpdate = async (newData) => {
    await update(newData, async (data) => {
      const response = await api.updateItem(item.id, data);
      return response.data;
    });
  };

  return (
    <div className={isOptimistic ? 'updating' : ''}>
      {/* ... render item ... */}
    </div>
  );
}
```

**Why this is a good custom hook:**
- Encapsulates complex async state logic
- Reusable across different components and data types
- Handles loading states, errors, and callbacks
- Provides clean API for consumers

## State Lifting Pattern

When sibling components need to share state, lift the state to their common parent.

### When to Lift State

- Two or more sibling components need the same state
- Child component needs to update parent's state
- State needs to be synchronized across components
- Before reaching for Context API (try lifting first)

### Example: Parent-Child State Sharing

```tsx
// ❌ BAD: State in sibling, other sibling can't access
function ComponentA() {
  const [selectedId, setSelectedId] = useState(null);
  return <ItemList onSelect={setSelectedId} />;
}

function ComponentB() {
  // Can't access selectedId from ComponentA!
  return <ItemDetails id={???} />;
}

// ✅ GOOD: State lifted to parent
function ParentComponent() {
  const [selectedId, setSelectedId] = useState(null);

  return (
    <div>
      <ComponentA selectedId={selectedId} onSelect={setSelectedId} />
      <ComponentB selectedId={selectedId} />
    </div>
  );
}

function ComponentA({ selectedId, onSelect }) {
  return <ItemList selectedId={selectedId} onSelect={onSelect} />;
}

function ComponentB({ selectedId }) {
  return <ItemDetails id={selectedId} />;
}
```

### Example: Form State Lifting

```tsx
// Parent manages form state
function FormContainer() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
  });

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    await api.submitForm(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormSection1
        title={formData.title}
        description={formData.description}
        onChange={handleFieldChange}
      />
      <FormSection2
        priority={formData.priority}
        onChange={handleFieldChange}
      />
      <FormActions onSubmit={handleSubmit} />
    </form>
  );
}
```

**Benefits:**
- Single source of truth for state
- Easy to pass state down to any child
- Clear data flow (parent → child via props)

## Best Practices

### 1. Start with useState, Upgrade to useReducer When Needed

```tsx
// Start simple
const [count, setCount] = useState(0);

// Upgrade when state logic grows complex
const [state, dispatch] = useReducer(reducer, initialState);
```

### 2. Co-locate State with Its Usage

Keep state as close as possible to where it's used. Don't lift state prematurely.

```tsx
// ✅ GOOD: State only used in this component
function Modal() {
  const [isOpen, setIsOpen] = useState(false);
  return <dialog open={isOpen}>...</dialog>;
}

// ❌ BAD: State lifted unnecessarily
function App() {
  const [modalOpen, setModalOpen] = useState(false);
  return <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} />;
}
```

### 3. Use Custom Hooks for Reusable State Logic

Extract patterns that appear multiple times.

```tsx
// ✅ GOOD: Reusable hook
function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);
  const toggle = useCallback(() => setValue((v) => !v), []);
  return [value, toggle] as const;
}

// Usage
const [isOpen, toggleOpen] = useToggle(false);
const [isActive, toggleActive] = useToggle(true);
```

### 4. Avoid Prop Drilling with Context

If you're passing props through 3+ levels, consider Context API.

```tsx
// ❌ BAD: Prop drilling
<App>
  <Layout theme={theme}>
    <Sidebar theme={theme}>
      <Menu theme={theme}>
        <MenuItem theme={theme} />
      </Menu>
    </Sidebar>
  </Layout>
</App>

// ✅ GOOD: Context
<ThemeProvider value={theme}>
  <App>
    <Layout>
      <Sidebar>
        <Menu>
          <MenuItem /> {/* uses useTheme() */}
        </Menu>
      </Sidebar>
    </Layout>
  </App>
</ThemeProvider>
```

### 5. Separate Server State from Client State

Don't mix server data (fetched from API) with local UI state.

```tsx
// Client state: UI-specific
const [isModalOpen, setIsModalOpen] = useState(false);
const [selectedTab, setSelectedTab] = useState('details');

// Server state: fetched data (consider React Query/SWR in future)
const [projects, setProjects] = useState([]);
const [isLoading, setIsLoading] = useState(true);
```

### 6. Initialize State from Props Carefully

```tsx
// ❌ BAD: State initialized from props but never updates
function Component({ initialValue }) {
  const [value, setValue] = useState(initialValue);
  // If initialValue changes, value won't update!
}

// ✅ GOOD: Controlled component (no state)
function Component({ value, onChange }) {
  return <input value={value} onChange={onChange} />;
}

// ✅ GOOD: Use key to reset state when needed
<Component key={itemId} initialValue={item.value} />
```

### 7. Use Functional Updates for State Based on Previous State

```tsx
// ❌ BAD: May cause race conditions
setCount(count + 1);

// ✅ GOOD: Functional update
setCount((prevCount) => prevCount + 1);
```

### 8. Keep State Minimal and Derived Values Computed

```tsx
// ❌ BAD: Redundant state
const [items, setItems] = useState([]);
const [itemCount, setItemCount] = useState(0);

// ✅ GOOD: Derive value
const [items, setItems] = useState([]);
const itemCount = items.length;
```

### 9. Use TypeScript for State Types

```tsx
// ✅ GOOD: Type-safe state
interface FormState {
  title: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: Date | null;
}

const [form, setForm] = useState<FormState>({
  title: '',
  priority: 'medium',
  dueDate: null,
});
```

### 10. Handle Side Effects in useEffect, Not in State Setters

```tsx
// ❌ BAD: Side effect in setter
const [user, setUser] = useState(null);
const updateUser = (newUser) => {
  setUser(newUser);
  localStorage.setItem('user', JSON.stringify(newUser)); // side effect!
};

// ✅ GOOD: Side effect in useEffect
const [user, setUser] = useState(null);

useEffect(() => {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  }
}, [user]);
```

## Summary

| Pattern | Use When | Example |
|---------|----------|---------|
| `useState` | Simple, independent state | Boolean flags, counters, text input |
| `useReducer` | Complex state logic, multiple transitions | Form state, state machines |
| Context API | Global state, avoid prop drilling | Current user, theme, selected project |
| Custom Hooks | Reusable state logic | Optimistic updates, online status, toggles |
| State Lifting | Siblings need shared state | Filter + list, tabs + content |

**General Rule:** Start simple (useState), lift when needed, extract to hooks for reusability, use Context for global state.

## References

- [React Docs: Managing State](https://react.dev/learn/managing-state)
- [React Docs: useReducer](https://react.dev/reference/react/useReducer)
- [React Docs: Context](https://react.dev/learn/passing-data-deeply-with-context)
- [React Docs: Reusing Logic with Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
