# Testing Guide

This guide provides comprehensive instructions for testing the AI-Agent-Framework full stack (Client + API).

## Table of Contents

- [Overview](#overview)
- [Testing Prerequisites](#testing-prerequisites)
- [Manual Testing](#manual-testing)
- [API Endpoint Testing](#api-endpoint-testing)
- [Client UI Testing](#client-ui-testing)
- [Integration Testing](#integration-testing)
- [Test Scenarios](#test-scenarios)
- [Validation Checklists](#validation-checklists)

## Overview

The AI-Agent-Framework Client is a frontend application that requires integration testing with the AI-Agent-Framework API. Testing involves:

1. **Unit Testing**: Individual component/function testing (future)
2. **API Testing**: Testing API endpoints directly
3. **Integration Testing**: Testing client-API communication
4. **UI Testing**: Manual testing of user interface
5. **End-to-End Testing**: Complete workflow validation

**Note**: Currently, no automated test framework is configured. All testing is manual.

## Testing Prerequisites

### Required Services Running

Both services must be running for integration testing:

```bash
# Terminal 1: Start API
cd ~/projects/AI-Agent-Framework
docker compose up -d
# OR
source venv/bin/activate && uvicorn main:app --reload

# Terminal 2: Start Client
cd ~/projects/AI-Agent-Framework-Client/client
npm run dev
```

### Verify Services Are Running

```bash
# Check API health
curl http://localhost:8000/health

# Check client is accessible
curl http://localhost:5173

# Or open in browser
open http://localhost:5173
```

### Testing Tools

Recommended tools for manual testing:

- **Browser DevTools** (F12) - Built-in browser debugging
- **curl** - Command-line HTTP testing
- **Postman** or **Insomnia** - API testing GUI (optional)
- **React Developer Tools** - Browser extension for React debugging

## Manual Testing

### Basic Smoke Test

Quick test to verify both services are working:

```bash
# 1. Test API health
curl http://localhost:8000/health
# Expected: {"status":"healthy"}

# 2. Test API info
curl http://localhost:8000/info
# Expected: JSON with API version, name, etc.

# 3. Open client in browser
open http://localhost:5173

# 4. Check browser console for errors (F12)
# Expected: No errors

# 5. Test health check button in UI
# Click "Test Health Check" button
# Expected: Success message with health status
```

### Pre-Commit Testing

Before committing code changes:

```bash
cd client

# 1. Run linter
npm run lint
# Expected: 0 errors

# 2. Build project
npm run build
# Expected: Build succeeds, dist/ folder created

# 3. Preview production build
npm run preview
# Expected: Server starts on port 4173

# 4. Manual smoke test
# Test key functionality in browser
```

## API Endpoint Testing

### Using curl

#### Health Check

```bash
curl http://localhost:8000/health

# Expected response:
# {"status":"healthy"}
```

#### API Info

```bash
curl http://localhost:8000/info

# Expected response (example):
# {
#   "name": "AI Agent Framework API",
#   "version": "1.0.0",
#   "description": "API for AI agents"
# }
```

#### List Agents

```bash
curl http://localhost:8000/api/agents

# Expected response (example):
# {
#   "agents": [
#     {"id": "coding-agent", "name": "Coding Agent", ...},
#     {"id": "research-agent", "name": "Research Agent", ...}
#   ]
# }
```

#### Get Agent Capabilities

```bash
curl http://localhost:8000/api/agents/coding-agent/capabilities

# Expected response (example):
# {
#   "capabilities": [
#     "code_review",
#     "code_generation",
#     "debugging"
#   ]
# }
```

#### Execute Task

```bash
curl -X POST http://localhost:8000/api/execute \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "coding-agent",
    "task": "Hello world test",
    "parameters": {}
  }'

# Expected response (example):
# {
#   "status": "success",
#   "result": "Task executed successfully",
#   "task_id": "123e4567-e89b-12d3-a456-426614174000"
# }
```

### Using Postman/Insomnia

#### Setup Collection

1. **Create new collection**: "AI Agent Framework Tests"
2. **Set base URL**: `http://localhost:8000`
3. **Add requests** for each endpoint

#### Example Requests

**Health Check**
- Method: `GET`
- URL: `{{base_url}}/health`
- Expected Status: `200 OK`

**List Agents**
- Method: `GET`
- URL: `{{base_url}}/api/agents`
- Expected Status: `200 OK`

**Execute Task**
- Method: `POST`
- URL: `{{base_url}}/api/execute`
- Headers: `Content-Type: application/json`
- Body:
  ```json
  {
    "agent_id": "coding-agent",
    "task": "Test task",
    "parameters": {}
  }
  ```
- Expected Status: `200 OK`

### API Interactive Documentation

The API provides interactive documentation at `http://localhost:8000/docs`

1. Open http://localhost:8000/docs in browser
2. Try out endpoints directly from the UI
3. View request/response schemas
4. Test authentication (if enabled)

## Client UI Testing

### Test the API Tester Interface

The client includes a built-in API testing interface at `/api-tester`.

#### Navigate to API Tester

1. Open http://localhost:5173
2. Navigate to "API Tester" section or go directly to http://localhost:5173/api-tester

#### Test Health Endpoint

1. Click "Test Health" button
2. **Expected Result**:
   - Success message appears
   - Response shows: `{"status":"healthy"}`
   - Status code: 200
   - Response time displayed

#### Test Info Endpoint

1. Click "Test Info" button
2. **Expected Result**:
   - Success message appears
   - Response shows API name, version, description
   - Status code: 200

#### Test Agents Endpoint

1. Click "Test Agents" button
2. **Expected Result**:
   - Success message appears
   - Response shows array of available agents
   - Each agent has id, name, description
   - Status code: 200

#### Test Capabilities Endpoint

1. Enter an agent ID (e.g., "coding-agent")
2. Click "Test Capabilities" button
3. **Expected Result**:
   - Success message appears
   - Response shows agent capabilities
   - Status code: 200

#### Test Execute Endpoint

1. Enter agent ID, task, and parameters (JSON)
2. Click "Test Execute" button
3. **Expected Result**:
   - Success message appears
   - Response shows execution result
   - Status code: 200

### Browser DevTools Testing

#### Console Testing

1. Open DevTools (F12 or Cmd+Opt+I)
2. Go to **Console** tab
3. Look for errors (red text)
4. **Expected**: No errors during normal operation

#### Network Testing

1. Open DevTools **Network** tab
2. Perform actions in the UI
3. Check API calls:
   - Request URL is correct
   - Status codes are 200
   - Response data is valid
   - Timing is reasonable

#### Example Network Analysis

```
Name: health
Status: 200
Type: xhr
Size: 25 B
Time: 15ms
```

### React DevTools Testing

Install React Developer Tools extension:
- Chrome: https://chrome.google.com/webstore (search "React Developer Tools")
- Firefox: https://addons.mozilla.org/firefox (search "React Developer Tools")

#### Using React DevTools

1. Open React DevTools (Components tab)
2. Select a component
3. View props and state
4. Verify data flow
5. Check for unnecessary re-renders

## Integration Testing

### Full Stack Integration Test

Tests the complete flow from client to API and back.

#### Test Scenario: Health Check Flow

**Steps**:
1. Open client in browser
2. Navigate to API Tester
3. Click "Test Health" button

**Expected Flow**:
1. Client sends GET request to `/api/health`
2. Request goes to http://localhost:8000/api/health
3. API responds with `{"status":"healthy"}`
4. Client receives response
5. UI displays success message
6. Response data shown in UI

**Verification**:
- Browser console: No errors
- Network tab: Status 200
- UI: Success message visible
- API logs: Request logged

#### Test Scenario: Agent Execution Flow

**Steps**:
1. Navigate to API Tester
2. Enter agent ID: "coding-agent"
3. Enter task: "Test task"
4. Enter parameters: `{}`
5. Click "Test Execute" button

**Expected Flow**:
1. Client validates input
2. Client sends POST request to `/api/execute`
3. Request includes JSON body with agent_id, task, parameters
4. API processes request
5. API executes task (or simulates)
6. API returns result
7. Client displays result in UI

**Verification**:
- Request payload matches expected format
- Response status is 200
- Result data is displayed
- No errors in console
- API logs show execution

### Cross-Origin Testing

Test CORS (Cross-Origin Resource Sharing) configuration:

**Scenario**: Client on different port than API

**Setup**:
- API: http://localhost:8000
- Client: http://localhost:5173

**Expected**:
- API allows requests from http://localhost:5173
- No CORS errors in browser console

**If CORS errors occur**:
1. Check API CORS configuration
2. Verify allowed origins include client URL
3. Check preflight (OPTIONS) requests succeed

### Error Handling Testing

#### Test API Unavailable

**Steps**:
1. Stop the API: `docker compose down` or stop uvicorn
2. Try to use client features
3. Observe error handling

**Expected**:
- Client shows "Connection failed" or similar error
- Error messages are user-friendly
- No unhandled exceptions in console
- UI doesn't break

#### Test Invalid Input

**Steps**:
1. Enter invalid agent ID
2. Try to execute task

**Expected**:
- Client validates input
- Error message displayed
- API returns appropriate error (404 or 400)
- Error is handled gracefully in UI

#### Test Network Timeout

**Simulate**:
- Slow network or large response

**Expected**:
- Loading indicator shown
- Timeout handled gracefully
- Error message if timeout occurs

## Test Scenarios

### Critical Path Tests

These tests cover the most important user workflows.

#### Scenario 1: First Time User

**Objective**: Verify new user can access and use the application

**Steps**:
1. Navigate to http://localhost:5173
2. Observe homepage loads
3. Navigate to different sections
4. Click on API Tester
5. Run health check test

**Expected Results**:
- [ ] Homepage loads without errors
- [ ] Navigation works smoothly
- [ ] API Tester interface is accessible
- [ ] Health check succeeds
- [ ] No console errors

#### Scenario 2: Agent Discovery

**Objective**: User can discover available agents

**Steps**:
1. Open API Tester
2. Click "Test Agents"
3. Review agent list

**Expected Results**:
- [ ] Request completes successfully
- [ ] Agent list is displayed
- [ ] Each agent has ID, name, description
- [ ] Response time is reasonable (<1s)

#### Scenario 3: Task Execution

**Objective**: User can execute a task with an agent

**Steps**:
1. Open API Tester
2. Enter valid agent ID
3. Enter task description
4. Enter parameters (empty object `{}`)
5. Click "Test Execute"
6. Observe results

**Expected Results**:
- [ ] Request is sent correctly
- [ ] Loading state is shown
- [ ] Response is received
- [ ] Result is displayed in UI
- [ ] Status and timing shown

### Edge Case Tests

#### Empty Responses

**Test**: API returns empty data
**Expected**: Client handles gracefully, shows "No data" message

#### Large Responses

**Test**: API returns large payload
**Expected**: Client handles without freezing, shows data correctly

#### Special Characters

**Test**: Input includes special characters
**Expected**: Characters are properly encoded/decoded

#### Concurrent Requests

**Test**: Multiple API calls at once
**Expected**: All requests complete, no race conditions

## Validation Checklists

### Pre-Commit Checklist

Before committing code:

- [ ] `npm run lint` passes with 0 errors
- [ ] `npm run build` succeeds
- [ ] Manual smoke test passes
- [ ] No console errors in browser
- [ ] API connectivity works
- [ ] Changes don't break existing features

### Pre-Deployment Checklist

Before deploying to production:

- [ ] All pre-commit checks pass
- [ ] Docker build succeeds
- [ ] Docker container runs without errors
- [ ] Environment variables configured correctly
- [ ] Health check endpoint responds
- [ ] API integration works
- [ ] UI loads correctly
- [ ] No errors in production build
- [ ] Browser compatibility verified (Chrome, Firefox, Safari, Edge)

### API Integration Checklist

Verify API integration is working:

- [ ] Health endpoint returns 200
- [ ] Info endpoint returns valid data
- [ ] Agents endpoint returns agent list
- [ ] Capabilities endpoint works for valid agent ID
- [ ] Execute endpoint accepts and processes requests
- [ ] CORS headers allow client origin
- [ ] Error responses are properly formatted
- [ ] Response times are acceptable

### UI Functionality Checklist

Verify UI works correctly:

- [ ] Page loads without errors
- [ ] Navigation works
- [ ] Buttons are clickable
- [ ] Forms validate input
- [ ] Error messages display correctly
- [ ] Success messages display correctly
- [ ] Loading states work
- [ ] Responsive design works on mobile
- [ ] No JavaScript errors in console
- [ ] No CORS errors

## Test Data and Fixtures

### Sample Agent IDs

Use these for testing:
- `coding-agent`
- `research-agent`
- `testing-agent`

### Sample Tasks

Use these for testing execute endpoint:
```json
{
  "agent_id": "coding-agent",
  "task": "Generate a hello world function",
  "parameters": {
    "language": "python"
  }
}
```

```json
{
  "agent_id": "research-agent",
  "task": "Research React best practices",
  "parameters": {
    "depth": "detailed"
  }
}
```

### Sample API Responses

**Health Check**:
```json
{"status":"healthy"}
```

**API Info**:
```json
{
  "name": "AI Agent Framework API",
  "version": "1.0.0",
  "description": "API for managing AI agents"
}
```

**Agents List**:
```json
{
  "agents": [
    {
      "id": "coding-agent",
      "name": "Coding Agent",
      "description": "Assists with code generation and review"
    }
  ]
}
```

## Troubleshooting Test Failures

### Issue: Health check fails

**Possible Causes**:
1. API not running
2. Wrong API URL in `.env`
3. Port conflict
4. Firewall blocking connection

**Solutions**:
```bash
# Check if API is running
curl http://localhost:8000/health

# Start API if not running
cd AI-Agent-Framework && docker compose up -d

# Verify API URL in client/.env
cat client/.env

# Check for port conflicts
lsof -i :8000
```

### Issue: CORS errors in browser

**Possible Causes**:
1. API CORS not configured for client origin
2. Wrong origin in CORS config

**Solutions**:
1. Check API CORS configuration
2. Ensure allowed origins include `http://localhost:5173`
3. Restart API after changing CORS config

### Issue: Tests pass locally but fail in production

**Possible Causes**:
1. Environment variables differ
2. Different API endpoint
3. Network configuration differs

**Solutions**:
1. Verify environment variables in production
2. Check API URL is correct for production
3. Test production build locally with `npm run preview`

## Next Steps

- See [DEVELOPMENT.md](./DEVELOPMENT.md) for development setup
- See [PRODUCTION.md](./PRODUCTION.md) for production deployment
- Check [../README.md](../README.md) for project overview

## Continuous Testing

As the project evolves, consider adding:

1. **Unit tests** with Vitest or Jest
2. **Integration tests** with Testing Library
3. **E2E tests** with Playwright or Cypress
4. **API contract tests** with Pact or similar
5. **CI/CD pipeline** with automated testing

For now, manual testing provides adequate coverage for this early-stage project.
