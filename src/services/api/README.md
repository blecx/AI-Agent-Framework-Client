# API Service Layer

Comprehensive API service layer for AI-Agent-Framework-Client implementing all backend endpoints.

## Features

✅ **Axios-based HTTP client** with interceptors  
✅ **Authentication** via Bearer token  
✅ **Error handling** with retry logic  
✅ **TypeScript types** for all endpoints  
✅ **Modular services** (Projects, RAID, Workflow, Audit, Governance)  
✅ **Exponential backoff** retry on 5xx errors  
✅ **Request/Response interceptors**

## Installation

```bash
npm install axios
```

## Usage

### Initialize API Service

```typescript
import { ApiService } from './services/api';

const api = new ApiService({
  baseURL: 'http://localhost:8000',
  apiKey: 'your-api-key', // Optional
  timeout: 30000,
  maxRetries: 3,
  retryDelay: 1000,
});
```

### Projects API

```typescript
// List all projects
const projects = await api.projects.listProjects();

// Get project
const project = await api.projects.getProject('PROJ1');

// Create project
const newProject = await api.projects.createProject({
  key: 'PROJ1',
  name: 'My Project',
  description: 'Project description',
});

// Update project
const updated = await api.projects.updateProject('PROJ1', {
  name: 'Updated Name',
});

// Delete project
await api.projects.deleteProject('PROJ1');
```

### RAID API

```typescript
// List RAID items with filters
const raidItems = await api.raid.listRAIDItems('PROJ1', {
  type: RAIDType.RISK,
  status: RAIDStatus.OPEN,
  priority: RAIDPriority.HIGH,
});

// Create RAID item
const newRaid = await api.raid.createRAIDItem('PROJ1', {
  type: RAIDType.RISK,
  title: 'Security Risk',
  description: 'Potential security vulnerability',
  priority: RAIDPriority.CRITICAL,
});

// Update RAID item
const updated = await api.raid.updateRAIDItem('PROJ1', 'RAID001', {
  status: RAIDStatus.IN_PROGRESS,
});

// Delete RAID item
await api.raid.deleteRAIDItem('PROJ1', 'RAID001');
```

### Workflow API

```typescript
// Get workflow state
const state = await api.workflow.getWorkflowState('PROJ1');

// Transition state
const transitioned = await api.workflow.transitionWorkflowState('PROJ1', {
  new_state: WorkflowStateEnum.PLANNING,
  note: 'Moving to planning phase',
});

// Get allowed transitions
const transitions = await api.workflow.getAllowedTransitions('PROJ1');
```

### Audit Events API

```typescript
// Get audit events
const events = await api.audit.getAuditEvents('PROJ1', {
  event_type: 'workflow_state_changed',
  limit: 50,
});

// Get events by actor
const userEvents = await api.audit.getAuditEventsByActor(
  'PROJ1',
  'user@example.com',
);

// Get events in date range
const rangeEvents = await api.audit.getAuditEventsByDateRange(
  'PROJ1',
  '2026-01-01T00:00:00Z',
  '2026-01-31T23:59:59Z',
);
```

### Governance API

```typescript
// Get governance metadata
const governance = await api.governance.getGovernanceMetadata('PROJ1');

// Create/Update governance
const updated = await api.governance.updateGovernanceMetadata('PROJ1', {
  sponsor: 'John Doe',
  project_manager: 'Jane Smith',
  budget: 500000,
  currency: 'USD',
});

// Decisions
const decisions = await api.governance.listDecisions('PROJ1');
const decision = await api.governance.createDecision('PROJ1', {
  title: 'Technology Stack Decision',
  description: 'Use React + TypeScript',
  decision_date: '2026-01-18',
  decision_makers: ['CTO', 'Lead Developer'],
});
```

### Health Check

```typescript
// Check API health
const health = await api.health.checkHealth();
console.log(health.status); // "healthy"

// Simple ping
const isAlive = await api.health.ping(); // true/false
```

## Error Handling

All API calls return promises that reject with `ApiError`:

```typescript
try {
  const project = await api.projects.getProject('INVALID');
} catch (error) {
  console.error(error.detail); // Error message
  console.error(error.status); // HTTP status code
  console.error(error.timestamp); // ISO timestamp
}
```

## Retry Logic

- Automatically retries on **5xx server errors** and **network errors**
- Max retries: 3 (configurable)
- Exponential backoff: 1s, 2s, 4s
- Does NOT retry on **4xx client errors**

## TypeScript Types

All backend models are fully typed:

```typescript
import {
  ProjectInfo,
  ProjectCreate,
  RAIDItem,
  RAIDType,
  RAIDStatus,
  WorkflowStateEnum,
  AuditEvent,
} from './types/api';
```

## Architecture

```
services/api/
├── client.ts        # Axios client with interceptors
├── projects.ts      # Projects API
├── raid.ts          # RAID API
├── workflow.ts      # Workflow state machine API
├── audit.ts         # Audit events API
├── governance.ts    # Governance & decisions API
├── health.ts        # Health check API
└── index.ts         # Main entry point
```

## Testing

```bash
# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Configuration

Update API configuration dynamically:

```typescript
// Update API key
api.setApiKey('new-api-key');

// Update base URL
api.setBaseURL('https://production-api.example.com');
```

## Acceptance Criteria

✅ Axios HTTP client configured  
✅ Base API service class with auth  
✅ Error interceptors and retry logic  
✅ TypeScript interfaces for all backend endpoints  
✅ Unit tests for API service  
✅ Integration tests with mock backend

## Status

**Issue #24: API Service Layer Infrastructure**  
Status: ✅ **IMPLEMENTED**  
Coverage: All backend endpoints (Projects, RAID, Workflow, Audit, Governance, Health)
