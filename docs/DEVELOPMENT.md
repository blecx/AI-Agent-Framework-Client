# Development Guide

This guide provides comprehensive instructions for setting up and developing with both the AI-Agent-Framework-Client and the AI-Agent-Framework API.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Architecture Overview](#architecture-overview)
- [Setting Up the API](#setting-up-the-api)
- [Setting Up the Client](#setting-up-the-client)
- [Development Workflow](#development-workflow)
- [Debugging Tips](#debugging-tips)
- [Common Issues](#common-issues)

## Prerequisites

### Required Software

- **Node.js 20+** (tested with v20.19.6)
  - Check: `node --version`
  - Install from: https://nodejs.org/
- **npm 10+** (tested with v10.8.2)
  - Check: `npm --version`
  - Usually comes with Node.js
- **Docker 28+** and Docker Compose
  - Check: `docker --version && docker compose version`
  - Install from: https://docs.docker.com/get-docker/
- **Git**
  - Check: `git --version`
  - Install from: https://git-scm.com/

### Optional but Recommended

- **Python 3.9+** (for running API locally without Docker)
- **VS Code** with extensions: ESLint, Prettier, TypeScript
- **curl** or **Postman** for API testing

### System Requirements

- **RAM**: 4GB minimum, 8GB recommended
- **Disk Space**: 2GB for dependencies and containers
- **Ports**: 3000 (client dev), 5173 (client prod preview), 8000 (API)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     User Browser                            │
│                    http://localhost:3000                    │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ HTTP Requests
                            │
┌───────────────────────────▼─────────────────────────────────┐
│              AI-Agent-Framework-Client                      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  React 19 + TypeScript + Vite                        │  │
│  │  - Components (UI)                                    │  │
│  │  - Services (API Client)                              │  │
│  │  - React Router (Navigation)                          │  │
│  │  - TanStack Query (State Management)                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  Dev: http://localhost:5173                                 │
│  Prod: http://localhost:3000 (Docker + Nginx)              │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ API Calls
                            │ /api/health, /api/info
                            │ /api/agents, /api/execute
                            │
┌───────────────────────────▼─────────────────────────────────┐
│              AI-Agent-Framework API                         │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  FastAPI + Python                                     │  │
│  │  - REST API Endpoints                                 │  │
│  │  - Agent Management                                   │  │
│  │  - LLM Integration                                    │  │
│  │  - Project/Document Management                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  Port: 8000                                                 │
│  Docs: http://localhost:8000/docs                          │
└─────────────────────────────────────────────────────────────┘
```

### Communication Flow

1. **Browser** → **Client** (React App)
2. **Client** → **API** (HTTP/REST)
3. **API** → **LLM** (e.g., LM Studio, OpenAI)
4. **API** → **Client** (JSON Response)
5. **Client** → **Browser** (UI Update)

## Setting Up the API

The AI-Agent-Framework API must be running for the client to function properly.

### Option 1: Docker (Recommended for Development)

**Step 1: Clone the API repository**

```bash
# Clone in a separate directory (not inside the client repo)
cd ~/projects  # or your preferred location
git clone https://github.com/blecx/AI-Agent-Framework.git
cd AI-Agent-Framework
```

**Step 2: Configure Environment**

```bash
# Create .env file
cat > .env << EOF
PROJECT_DOCS_PATH=./projectDocs
LLM_CONFIG_PATH=./config/llm.json
PORT=8000
HOST=0.0.0.0
EOF
```

**Step 3: Create required directories**

```bash
mkdir -p projectDocs config
```

**Step 4: Create LLM configuration (optional)**

```bash
cat > config/llm.json << EOF
{
  "provider": "lm-studio",
  "api_url": "http://localhost:1234/v1",
  "model": "local-model",
  "temperature": 0.7,
  "max_tokens": 2000
}
EOF
```

**Step 5: Run with Docker**

```bash
# Build and start the API
docker compose up -d

# View logs
docker compose logs -f

# Check health
curl http://localhost:8000/health
```

**Step 6: Verify API is running**

```bash
# Health check
curl http://localhost:8000/health

# Expected response: {"status":"healthy"}

# API info
curl http://localhost:8000/info

# API documentation (open in browser)
open http://localhost:8000/docs
```

### Option 2: Local Python Environment

**Step 1: Clone and setup**

```bash
cd ~/projects
git clone https://github.com/blecx/AI-Agent-Framework.git
cd AI-Agent-Framework
```

**Step 2: Create virtual environment**

```bash
# Python 3.9+
python3 -m venv venv

# Activate (Linux/Mac)
source venv/bin/activate

# Activate (Windows)
# venv\Scripts\activate
```

**Step 3: Install dependencies**

```bash
pip install -r requirements.txt
```

**Step 4: Configure environment**

```bash
# Create .env file
cp .env.example .env

# Edit .env to set paths
export PROJECT_DOCS_PATH=./projectDocs
export LLM_CONFIG_PATH=./config/llm.json
```

**Step 5: Create required directories**

```bash
mkdir -p projectDocs config
```

**Step 6: Run the API**

```bash
# Development mode with hot reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Or production mode
uvicorn main:app --host 0.0.0.0 --port 8000
```

**Step 7: Verify**

```bash
curl http://localhost:8000/health
```

### API Endpoints Reference

Once running, the API provides:

- **Health Check**: `GET /health`
- **API Info**: `GET /info`
- **Agents List**: `GET /api/agents`
- **Agent Capabilities**: `GET /api/agents/{id}/capabilities`
- **Execute Task**: `POST /api/execute`
- **Interactive Docs**: `http://localhost:8000/docs`

## Setting Up the Client

### Step 1: Clone the repository

```bash
cd ~/projects
git clone https://github.com/blecx/AI-Agent-Framework-Client.git
cd AI-Agent-Framework-Client
```

### Step 2: Install dependencies

```bash
cd client
npm install
```

This creates the `node_modules` directory with all dependencies (~177 packages).

### Step 3: Configure environment

```bash
# Copy example environment file
cp .env.example .env
```

Edit `client/.env`:

```env
# Point to your local API
VITE_API_BASE_URL=http://localhost:8000/api

# Optional: API key if authentication is enabled
VITE_API_KEY=

# Health check interval (ms)
VITE_HEALTH_CHECK_INTERVAL=30000
```

### Step 4: Start development server

```bash
npm run dev
```

The client will start at **http://localhost:5173** with hot module replacement (HMR).

### Step 5: Verify connectivity

1. Open http://localhost:5173 in your browser
2. Navigate to "API Tester" section
3. Click "Test Health Check"
4. Verify you see: `{"status":"healthy"}`

If you see connection errors, verify:
- API is running on port 8000
- `VITE_API_BASE_URL` is correct in `.env`
- No firewall blocking localhost connections

## Development Workflow

### Typical Development Session

```bash
# Terminal 1: API
cd ~/projects/AI-Agent-Framework
source venv/bin/activate  # if using Python
# docker compose up -d    # if using Docker
uvicorn main:app --reload

# Terminal 2: Client
cd ~/projects/AI-Agent-Framework-Client/client
npm run dev

# Terminal 3: Tests/Commands
cd ~/projects/AI-Agent-Framework-Client/client
npm run lint
npm run build
```

### Hot Reload Configuration

Both services support hot reload:

- **API**: Use `--reload` flag with uvicorn
- **Client**: Vite provides HMR automatically

Changes to files are immediately reflected:
- **Client**: `.tsx`, `.ts`, `.css` files auto-reload
- **API**: `.py` files trigger server restart

### Making Changes

#### Client Code Changes

```bash
cd AI-Agent-Framework-Client/client

# Edit files in src/
# - src/components/*.tsx (UI components)
# - src/services/*.ts (API client)
# - src/App.tsx (main app)

# Lint your changes
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix

# Build to check for errors
npm run build
```

#### API Code Changes

```bash
cd AI-Agent-Framework

# Edit Python files
# Changes auto-reload with uvicorn --reload

# Test endpoints
curl -X POST http://localhost:8000/api/execute \
  -H "Content-Type: application/json" \
  -d '{"agent":"test","task":"hello"}'
```

### Testing Changes

#### Manual Testing Workflow

1. **Start both services** (API + Client)
2. **Open client** in browser (http://localhost:5173)
3. **Test the flow**:
   - Health check works
   - API info loads
   - Agents list displays
   - Execute works
4. **Check browser console** for errors
5. **Check API logs** for server errors

#### API Testing with curl

```bash
# Health check
curl http://localhost:8000/health

# Get agents
curl http://localhost:8000/api/agents

# Get agent capabilities
curl http://localhost:8000/api/agents/coding-agent/capabilities

# Execute task (example)
curl -X POST http://localhost:8000/api/execute \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "coding-agent",
    "task": "Analyze this code",
    "parameters": {}
  }'
```

#### Using the Browser DevTools

1. Open DevTools (F12 or Cmd+Opt+I)
2. **Console tab**: Check for JavaScript errors
3. **Network tab**: Monitor API calls
   - Check request/response
   - Verify status codes
   - View timing
4. **React DevTools** (install extension): Inspect component state

### Code Style and Linting

The client uses **ESLint v9** with flat config.

```bash
cd client

# Run linter
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

**Before committing**:
1. ✅ `npm run lint` must pass with 0 errors
2. ✅ `npm run build` must succeed
3. ✅ Manual testing confirms changes work

### Environment Variables

**Important**: Vite environment variables are injected at **build time**, not runtime.

After changing `.env`:
```bash
# Development: restart dev server
npm run dev

# Production: rebuild
npm run build
```

Variables must be prefixed with `VITE_`:
```env
VITE_API_BASE_URL=http://localhost:8000/api  ✅
API_BASE_URL=http://localhost:8000/api       ❌ (won't work)
```

## Debugging Tips

### Client Debugging

#### Enable Verbose Logging

Add console logs in your code:

```typescript
// src/services/api.ts
export async function testHealth() {
  console.log('Testing health endpoint...');
  const response = await axios.get('/health');
  console.log('Health response:', response.data);
  return response.data;
}
```

#### Use React DevTools

Install the React Developer Tools browser extension to:
- Inspect component props and state
- View component hierarchy
- Profile performance
- Debug hooks

#### Debug API Calls

```typescript
// Add axios interceptor for debugging
import axios from 'axios';

axios.interceptors.request.use(request => {
  console.log('Starting Request', request);
  return request;
});

axios.interceptors.response.use(response => {
  console.log('Response:', response);
  return response;
});
```

#### Vite Debug Mode

```bash
# Start with debug output
npm run dev -- --debug
```

### API Debugging

#### Check API Logs

```bash
# Docker
docker compose logs -f

# Local Python
# Logs appear in terminal where uvicorn is running
```

#### Enable Debug Mode

```bash
# Set log level in .env
LOG_LEVEL=DEBUG

# Or in command
uvicorn main:app --reload --log-level debug
```

#### Test API Directly

```bash
# Use curl with verbose output
curl -v http://localhost:8000/health

# Use httpie (if installed)
http http://localhost:8000/health
```

### Network Debugging

#### Check if Ports are Available

```bash
# Linux/Mac
lsof -i :8000  # API
lsof -i :5173  # Client dev
lsof -i :3000  # Client Docker

# Windows
netstat -ano | findstr :8000
```

#### Test Connectivity

```bash
# From client machine, test API
curl http://localhost:8000/health

# Expected: {"status":"healthy"}
```

#### CORS Issues

If you see CORS errors in browser console:

1. **Check API CORS configuration** (should allow `http://localhost:5173`)
2. **For Docker**: Use service names, not localhost
3. **For production**: Configure allowed origins

### Common Debug Scenarios

#### "Cannot GET /api/health" Error

**Cause**: Client trying to fetch from wrong URL

**Fix**: Check `VITE_API_BASE_URL` in `.env`

```bash
# Should be:
VITE_API_BASE_URL=http://localhost:8000/api

# NOT:
VITE_API_BASE_URL=http://localhost:8000  # missing /api
```

#### "Network Error" in Browser

**Cause**: API not running or unreachable

**Fix**:
```bash
# Verify API is running
curl http://localhost:8000/health

# If not running, start it
cd AI-Agent-Framework
docker compose up -d
# OR
uvicorn main:app --reload
```

#### TypeScript Errors

**Cause**: Type mismatches or missing types

**Fix**:
```bash
cd client

# Clear TypeScript cache
rm -rf node_modules/.vite

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

## Common Issues

### Issue: npm install fails

**Symptoms**:
- Package installation errors
- Network timeouts
- Permission errors

**Solutions**:

```bash
# Clear npm cache
npm cache clean --force

# Remove existing files
rm -rf node_modules package-lock.json

# Reinstall
npm install

# If permission errors (Linux/Mac)
sudo chown -R $USER:$USER ~/.npm
sudo chown -R $USER:$USER ./node_modules
```

### Issue: API connection refused

**Symptoms**:
- Client shows "Failed to fetch"
- Network errors in console
- CORS errors

**Solutions**:

```bash
# 1. Verify API is running
curl http://localhost:8000/health

# 2. Check API logs for errors
docker compose logs -f  # or check uvicorn terminal

# 3. Verify .env configuration
cat client/.env

# 4. Restart both services
# API:
docker compose restart  # or restart uvicorn

# Client:
cd client
npm run dev  # Ctrl+C and restart
```

### Issue: Port already in use

**Symptoms**:
- "EADDRINUSE: address already in use"
- "Port 5173 is already in use"

**Solutions**:

```bash
# Find process using port
lsof -i :5173  # or :8000

# Kill the process
kill -9 <PID>

# Or change port
npm run dev -- --port 5174
```

### Issue: Build fails with TypeScript errors

**Symptoms**:
- `tsc` compilation errors
- Type errors during `npm run build`

**Solutions**:

```bash
cd client

# Clear build cache
rm -rf dist node_modules/.vite

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check TypeScript config
cat tsconfig.json

# Rebuild
npm run build
```

### Issue: ESLint errors

**Symptoms**:
- `npm run lint` fails
- Linting errors in editor

**Solutions**:

```bash
cd client

# Run lint with details
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix

# Check ESLint config
cat eslint.config.js

# Verify ESLint is using flat config (v9)
npm list eslint
```

### Issue: Changes not reflecting

**Symptoms**:
- Code changes don't appear in browser
- Environment variables not updating

**Solutions**:

```bash
# For code changes: Hard refresh browser
# Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows/Linux)

# For environment variables: Rebuild
cd client
npm run build  # or restart npm run dev

# Clear browser cache
# Open DevTools > Application > Clear Storage

# Clear Vite cache
rm -rf node_modules/.vite
```

### Issue: Docker build fails

**Symptoms**:
- Docker compose errors
- Container exits immediately

**Solutions**:

```bash
# Check Docker logs
docker compose logs

# Rebuild from scratch
docker compose down
docker compose build --no-cache
docker compose up -d

# Verify Docker is running
docker --version
docker compose version
```

### Issue: Module not found errors

**Symptoms**:
- Import errors
- "Cannot find module"

**Solutions**:

```bash
cd client

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check imports are correct
# Verify path aliases in vite.config.ts and tsconfig.json

# Rebuild
npm run build
```

## Next Steps

- See [TESTING.md](./TESTING.md) for testing guidelines
- See [PRODUCTION.md](./PRODUCTION.md) for production deployment
- Check [../README.md](../README.md) for project overview

## Getting Help

If you encounter issues not covered here:

1. Check existing GitHub issues: https://github.com/blecx/AI-Agent-Framework-Client/issues
2. Review API documentation: http://localhost:8000/docs (when API is running)
3. Open a new issue with:
   - Clear description of the problem
   - Steps to reproduce
   - Environment details (OS, Node version, Docker version)
   - Error messages and logs
