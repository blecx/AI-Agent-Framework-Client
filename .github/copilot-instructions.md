# Copilot Coding Agent Instructions

## Repository Overview
**AI-Agent-Framework-Client** - React/TypeScript web app built with Vite for testing AI-Agent-Framework API without workflows.
- **Stack**: React 19.2.0, TypeScript 5.9.3, Vite 7.2.4, Node.js 18+ (tested: 20.19.6, npm 10.8.2)
- **Size**: Small (~177 packages, 33 modules)
- **Deployment**: Docker with Nginx

## Build Commands (ALL from `client/` directory)

### Critical: Working Directory
**ALWAYS** run npm commands from `client/` directory: `cd client`

### Installation (REQUIRED before build/run)
```bash
cd client
npm install          # ~4s, or npm ci for CI/CD (~2s)
```

### Linting (REQUIRED before commit)
```bash
cd client
npm run lint         # <2s, must pass with 0 errors, ESLint v9 flat config
```

### Building (TypeScript then Vite)
```bash
cd client
npm run build        # ~1.4s, runs: tsc -b && vite build
                     # Output: client/dist/
```

### Development
```bash
cd client
npm run dev          # http://localhost:5173
npm run preview      # Preview production build
```

### No Tests
**npm test does not exist** - no test framework configured.

### Cleaning
```bash
cd client
rm -rf dist node_modules/.vite && npm run build     # Clear cache
rm -rf node_modules package-lock.json && npm install # Full clean
```

## Docker (from repo root)
```bash
docker compose up -d              # Build & run, http://localhost:3000
docker compose logs -f            # View logs
docker compose down               # Stop
docker build -t ai-agent-client . # Build image only
```
**Note**: Use `docker compose` (v2), NOT `docker-compose`. Multi-stage: Node 20 Alpine → Nginx Alpine.


## Project Structure
```
AI-Agent-Framework-Client/
├── client/                        # MAIN WORKING DIRECTORY
│   ├── src/
│   │   ├── components/
│   │   │   ├── ApiTester.tsx     # Main UI (~250 lines)
│   │   │   └── ApiTester.css
│   │   ├── services/
│   │   │   └── api.ts            # API client (~260 lines)
│   │   ├── App.tsx               # Main component
│   │   ├── main.tsx              # Entry point
│   │   └── assets/, *.css
│   ├── public/vite.svg
│   ├── dist/                     # Build output (gitignored)
│   ├── package.json              # Scripts: dev, build, lint, preview
│   ├── eslint.config.js          # ESLint v9 flat config
│   ├── vite.config.ts            # Vite + @vitejs/plugin-react
│   ├── tsconfig.*.json           # TS project references (3 files)
│   ├── index.html
│   └── .env.example              # VITE_API_BASE_URL
├── Dockerfile                    # Multi-stage: Node→Nginx
├── docker-compose.yml            # Port 3000:80
├── nginx.conf                    # Prod server config
├── README.md, DEPLOYMENT.md
└── .gitignore
```

## Key Config Details
- **TypeScript**: 3 configs (tsconfig.json references app/node configs), ES2022 target, strict mode, no emit
- **Dependencies**: react 19, vite 7, eslint 9, typescript 5.9 (no test libs)
- **Environment**: `VITE_API_BASE_URL` (default: `http://localhost:8000/api`) - set at **build time**
- **Entry Points**: index.html → main.tsx → App.tsx → ApiTester.tsx
- **API Endpoints**: /health, /info, /agents, /agents/{id}/capabilities, /execute (POST)

## Common Issues
| Problem | Solution |
|---------|----------|
| Build fails with module errors | `cd client && rm -rf node_modules package-lock.json && npm install && npm run build` |
| Port 5173/3000 in use | Dev auto-selects next port; Docker: edit docker-compose.yml ports |
| ESLint v9 errors | Verify eslint.config.js flat config syntax |
| Docker build fails | Ensure package-lock.json committed |

## Validation Checklist
**Before commit**:
1. `cd client && npm run lint` (must pass)
2. `cd client && npm run build` (must succeed)
3. Verify `client/dist/` has index.html + assets/

**Before PR**: Same as above + test Docker if Dockerfile/package.json changed

## CI/CD Status
**No GitHub Actions workflows configured.** All validation is manual.


## Best Practices
1. **ALWAYS** `cd client` before npm commands
2. **ALWAYS** `npm install` after pulling package.json changes
3. **ALWAYS** lint before commit: `npm run lint`
4. **ALWAYS** test build before commit: `npm run build`
5. **NEVER commit**: node_modules/, dist/, .env (in .gitignore)
6. **Use npm ci** for CI/CD or troubleshooting
7. **Env vars** set at build time (rebuild required for changes)
8. **TypeScript strict mode**: fix type errors, avoid `any`/@ts-ignore
9. **Docker v2**: `docker compose` (space, not hyphen)

## Making Changes
- **UI**: `src/components/ApiTester.tsx` + `.css`
- **API**: `src/services/api.ts` (endpoints, test methods)
- **Styles**: Component .css or global index.css
- **Config**: vite.config.ts, eslint.config.js, tsconfig.*.json

**After changes**: `npm run dev` → test → `npm run lint` → `npm run build` → commit source only

## Validated Commands
These instructions validated by running:
- `npm install` (✓ ~4s)
- `npm run lint` (✓ <2s, 0 errors)
- `npm run build` (✓ ~1.4s)
- Clean builds, cache clearing, Docker/Compose commands

**Search only if**: instructions incomplete, error not documented, or tools updated since validation.

---

# Development Environment Setup

## Prerequisites
- **Node.js 20+** (tested: 20.19.6)
- **npm 10+** (tested: 10.8.2)
- **Docker 28+** with Compose v2
- **Git**

## Full Stack Architecture
The client requires the **AI-Agent-Framework API** to function. The complete stack includes:
- **Client** (this repo): React/TypeScript web app on port 3000 (Docker) or 5173 (dev)
- **API** (blecx/AI-Agent-Framework): Python/FastAPI on port 8000

### Communication Flow
```
Browser → Client (React) → API (FastAPI) → LLM Provider
```

## Setting Up the API (Required)

### Option 1: Docker (Recommended)
```bash
# Clone API repo (separate directory)
cd ~/projects
git clone https://github.com/blecx/AI-Agent-Framework.git
cd AI-Agent-Framework

# Create .env
cat > .env << EOF
PROJECT_DOCS_PATH=./projectDocs
LLM_CONFIG_PATH=./config/llm.json
PORT=8000
HOST=0.0.0.0
EOF

# Create directories
mkdir -p projectDocs config

# Start API
docker compose up -d

# Verify
curl http://localhost:8000/health
```

### Option 2: Local Python
```bash
# Clone and setup
cd ~/projects
git clone https://github.com/blecx/AI-Agent-Framework.git
cd AI-Agent-Framework

# Create venv
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install and run
pip install -r requirements.txt
mkdir -p projectDocs config
export PROJECT_DOCS_PATH=./projectDocs
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Setting Up the Client

```bash
# Clone this repo
cd ~/projects
git clone https://github.com/blecx/AI-Agent-Framework-Client.git
cd AI-Agent-Framework-Client/client

# Install dependencies
npm install

# Configure API URL
cp .env.example .env
# Edit .env: VITE_API_BASE_URL=http://localhost:8000/api

# Start dev server
npm run dev

# Access at http://localhost:5173
```

## Development Workflow

### Typical Session (3 terminals)
```bash
# Terminal 1: API
cd AI-Agent-Framework
docker compose up -d  # or uvicorn main:app --reload

# Terminal 2: Client
cd AI-Agent-Framework-Client/client
npm run dev

# Terminal 3: Validation
cd AI-Agent-Framework-Client/client
npm run lint && npm run build
```

### Hot Reload
- **Client**: Vite HMR auto-reloads `.tsx`, `.ts`, `.css` files
- **API**: uvicorn `--reload` restarts on `.py` changes

### Environment Variables
**CRITICAL**: Vite vars are **build-time**, not runtime. After changing `.env`:
```bash
# Dev: Restart dev server
npm run dev

# Prod: Rebuild
npm run build
```

## Common Dev Issues

| Issue | Solution |
|-------|----------|
| "Connection refused" | Verify API running: `curl http://localhost:8000/health` |
| CORS errors | Check API CORS config allows `http://localhost:5173` |
| Changes not reflecting | Hard refresh (Cmd+Shift+R), rebuild if env vars changed |
| TypeScript errors | Clear cache: `rm -rf node_modules/.vite && npm install` |

## API Endpoints Reference
- `GET /health` - Health check
- `GET /info` - API info
- `GET /api/agents` - List agents
- `GET /api/agents/{id}/capabilities` - Agent capabilities
- `POST /api/execute` - Execute task
- `GET /docs` - Interactive API docs (Swagger)

## Debugging Tips

### Client
```typescript
// Add axios interceptor in src/services/api.ts
axios.interceptors.request.use(req => {
  console.log('Request:', req);
  return req;
});
```

### API
```bash
# Enable debug logs
LOG_LEVEL=DEBUG uvicorn main:app --reload --log-level debug

# Check Docker logs
docker compose logs -f
```

### Network
```bash
# Check ports in use
lsof -i :8000  # API
lsof -i :5173  # Client dev
lsof -i :3000  # Client Docker

# Test connectivity
curl -v http://localhost:8000/health
```

## Documentation
- **Full Dev Guide**: `docs/DEVELOPMENT.md`
- **API Integration**: See "Setting Up the API" above
- **Troubleshooting**: `docs/DEVELOPMENT.md#common-issues`

---

# Testing Environment Setup

## Testing Overview
**No automated tests configured** - all testing is manual.

### Testing Requirements
- Both services running (API + Client)
- Browser DevTools (F12)
- curl or Postman (optional)

## Quick Smoke Test
```bash
# 1. Test API
curl http://localhost:8000/health
# Expected: {"status":"healthy"}

# 2. Test Client
open http://localhost:5173

# 3. Test Integration
# In browser: Navigate to API Tester → Click "Test Health Check"
# Expected: Success message with health status
```

## Pre-Commit Testing Checklist
```bash
cd client

# 1. Lint (MUST pass)
npm run lint

# 2. Build (MUST succeed)
npm run build

# 3. Manual smoke test
npm run preview  # Test production build
```

## API Testing with curl

### Health Check
```bash
curl http://localhost:8000/health
# Expected: {"status":"healthy"}
```

### List Agents
```bash
curl http://localhost:8000/api/agents
# Expected: Array of agents
```

### Execute Task
```bash
curl -X POST http://localhost:8000/api/execute \
  -H "Content-Type: application/json" \
  -d '{"agent_id":"coding-agent","task":"test","parameters":{}}'
```

## UI Testing (Browser DevTools)

### Console Tab
- Look for JavaScript errors (red text)
- Check API call logs
- Expected: No errors during normal operation

### Network Tab
- Monitor API calls
- Verify URLs: `http://localhost:8000/api/*`
- Check status codes: 200 OK
- View request/response data

### Test Scenarios

#### Scenario: Health Check Flow
1. Open http://localhost:5173
2. Navigate to API Tester
3. Click "Test Health Check"
4. **Expected**: Success message, `{"status":"healthy"}`, HTTP 200

#### Scenario: Agent List
1. In API Tester, click "Test Agents"
2. **Expected**: Array of agents with id, name, description

#### Scenario: Execute Task
1. Enter agent ID: "coding-agent"
2. Enter task: "Test task"
3. Enter parameters: `{}`
4. Click "Test Execute"
5. **Expected**: Execution result displayed

## Integration Testing

### Validate Full Stack
```bash
# Run validation script
./scripts/validate-setup.sh

# Expected: All checks pass
```

### Error Handling Tests

#### API Unavailable
```bash
# Stop API
docker compose down  # or stop uvicorn

# Try client features
# Expected: "Connection failed" errors, UI doesn't break
```

#### Invalid Input
```bash
# In UI, enter invalid agent ID
# Expected: Error message, no crash
```

## Testing Documentation
- **Full Testing Guide**: `docs/TESTING.md`
- **Test Scenarios**: `docs/TESTING.md#test-scenarios`
- **Validation**: `docs/TESTING.md#validation-checklists`

---

# Production Environment Setup

## Production Deployment Options

### Option 1: Automated Setup (Recommended)

#### Linux/macOS
```bash
# Download and run setup script
curl -fsSL https://raw.githubusercontent.com/blecx/AI-Agent-Framework-Client/main/production-setup.sh -o production-setup.sh
chmod +x production-setup.sh
./production-setup.sh

# Estimated time: 3-5 minutes
```

#### Windows PowerShell
```powershell
# Download and run setup script
iwr -useb https://raw.githubusercontent.com/blecx/AI-Agent-Framework-Client/main/production-setup.ps1 -outfile production-setup.ps1
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\production-setup.ps1
```

**What the script does**:
- ✅ Checks Docker and Git
- ✅ Clones both repositories
- ✅ Creates environment files
- ✅ Sets up Docker networking
- ✅ Builds and starts services
- ✅ Validates health checks
- ✅ Displays access URLs

### Option 2: Manual Docker Compose Setup

```bash
# Clone this repo
git clone https://github.com/blecx/AI-Agent-Framework-Client.git
cd AI-Agent-Framework-Client

# Start full stack with production compose
docker compose -f docker-compose.production.yml up -d

# Validate
./scripts/validate-setup.sh

# Access
# Client: http://localhost:3000
# API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

## Production Configuration

### Environment Variables

#### API (.env in AI-Agent-Framework/)
```bash
PROJECT_DOCS_PATH=./projectDocs
LLM_CONFIG_PATH=./config/llm.json
PORT=8000
HOST=0.0.0.0
LOG_LEVEL=INFO
# Optional: API_KEY=secure-key-here
# Optional: ALLOWED_ORIGINS=https://yourdomain.com
```

#### Client (.env in client/)
```bash
# For Docker internal networking
VITE_API_BASE_URL=http://ai-agent-api:8000/api

# For external API
# VITE_API_BASE_URL=https://api.yourdomain.com/api
```

### Docker Compose Production Features
- **Health checks** for both services
- **Restart policy**: `unless-stopped`
- **Resource limits** (CPU, memory)
- **Networking**: Isolated bridge network
- **Volumes**: Persistent storage for data
- **Dependencies**: Client waits for API health

## Security Considerations

### Production Checklist
- [ ] Use HTTPS (Nginx/Traefik reverse proxy with SSL)
- [ ] Configure firewall (allow 80/443, block direct 3000/8000)
- [ ] Set strong API_KEY
- [ ] Configure CORS with specific origins
- [ ] Enable log rotation
- [ ] Set resource limits
- [ ] Use Docker secrets for sensitive data
- [ ] Keep images updated
- [ ] Set up monitoring/alerting

### HTTPS Setup (Nginx + Let's Encrypt)
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
    }
    
    location /api/ {
        proxy_pass http://localhost:8000/api/;
        proxy_set_header Host $host;
    }
}
```

```bash
# Get SSL certificate
sudo certbot --nginx -d yourdomain.com
```

## Monitoring and Maintenance

### Health Checks
```bash
# Check API health
curl http://localhost:8000/health

# Check Docker containers
docker compose ps

# View logs
docker compose logs -f
docker compose logs -f ai-agent-api
docker compose logs -f ai-agent-client
```

### Backups
```bash
# Backup Docker volumes
docker run --rm -v projectDocs:/data -v $(pwd):/backup \
  alpine tar czf /backup/projectDocs-backup-$(date +%Y%m%d).tar.gz /data

# Backup configs
cp -r .env config/ backups/
```

### Updates
```bash
# Pull latest changes
cd AI-Agent-Framework-Client
git pull

# Rebuild and restart
docker compose down
docker compose build --no-cache
docker compose up -d
```

## Scaling

### Horizontal Scaling (Multiple Instances)
```bash
# Scale client to 3 instances (requires load balancer)
docker compose up -d --scale ai-agent-client=3

# Scale API
docker compose up -d --scale ai-agent-api=3
```

### Resource Limits (docker-compose.yml)
```yaml
services:
  ai-agent-api:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 512M
```

## Troubleshooting Production

| Issue | Solution |
|-------|----------|
| Container fails to start | Check logs: `docker compose logs` |
| API not accessible from client | Verify network: `docker network inspect ai-agent-network` |
| Health checks failing | Increase `start_period` in docker-compose.yml |
| Out of disk space | Clean up: `docker system prune -a --volumes` |
| SSL renewal fails | Manual: `sudo certbot renew --force-renewal` |

## Production Documentation
- **Full Production Guide**: `docs/PRODUCTION.md`
- **Docker Compose**: `docker-compose.production.yml`
- **Setup Scripts**: `production-setup.sh`, `production-setup.ps1`
- **Validation**: `scripts/validate-setup.sh`
- **Quick Start**: `QUICKSTART.md`

## Useful Commands (Production)

```bash
# View status
docker compose ps

# View logs (all services)
docker compose logs -f

# View logs (specific service)
docker compose logs -f ai-agent-api

# Restart services
docker compose restart

# Stop services
docker compose down

# Rebuild and restart
docker compose down
docker compose build --no-cache
docker compose up -d

# Check health
curl http://localhost:8000/health
curl http://localhost:3000

# Validate full setup
./scripts/validate-setup.sh
```

---

# Quick Reference

## Essential Commands Cheat Sheet

### Development
```bash
# Start API (Docker)
cd AI-Agent-Framework && docker compose up -d

# Start Client
cd AI-Agent-Framework-Client/client && npm run dev

# Lint and Build
cd client && npm run lint && npm run build
```

### Production
```bash
# Automated setup
./production-setup.sh  # Linux/Mac
.\production-setup.ps1  # Windows

# Manual setup
docker compose -f docker-compose.production.yml up -d

# Validate
./scripts/validate-setup.sh
```

### Troubleshooting
```bash
# Check API health
curl http://localhost:8000/health

# Check logs
docker compose logs -f

# Restart everything
docker compose restart

# Clean rebuild
docker compose down && docker compose build --no-cache && docker compose up -d
```

## Port Reference
- **8000**: API
- **5173**: Client (development)
- **3000**: Client (Docker production)

## Key Files
- `client/.env` - Client environment config
- `docker-compose.production.yml` - Full stack production
- `docs/DEVELOPMENT.md` - Development guide
- `docs/TESTING.md` - Testing guide
- `docs/PRODUCTION.md` - Production guide
- `QUICKSTART.md` - Quick start guide
