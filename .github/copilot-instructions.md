# Copilot Coding Agent Instructions

## Repository Overview

**AI-Agent-Framework-Client** is a React/TypeScript web application built with Vite that provides a comprehensive testing interface for the AI-Agent-Framework API. The client allows testing all API capabilities without implementing workflows.

- **Type**: Frontend web application
- **Primary Language**: TypeScript (React)
- **Build Tool**: Vite v7.2.4
- **Runtime**: Node.js 18+ (tested with Node.js 20.19.6, npm 10.8.2)
- **Size**: Small (~177 npm packages, ~33 source modules)
- **Framework**: React 19.2.0 with React DOM
- **Deployment**: Docker with Nginx for production

## Build and Validation Commands

### Prerequisites
- Node.js 18+ and npm 9+ are **required**
- Docker is optional (for containerized deployment)

### Important: Working Directory
**ALWAYS** navigate to the `client` directory before running npm commands:
```bash
cd client
```

### Installation
**ALWAYS** run installation before building or running the application:
```bash
cd client
npm install
```

For CI/CD or clean installs (recommended):
```bash
cd client
npm ci
```

**Timing**: Installation takes ~2-4 seconds with npm ci, ~4-6 seconds with npm install.

### Linting
**ALWAYS** run linting before committing code changes:
```bash
cd client
npm run lint
```

**Timing**: Linting completes in <2 seconds.
**Note**: ESLint v9 is configured with flat config (eslint.config.js). Linting must pass with 0 errors before commits.

### Building
**Build sequence** (TypeScript compilation MUST happen before Vite build):
```bash
cd client
npm run build
```

This runs: `tsc -b && vite build`

**Timing**: Build completes in ~1.4 seconds.
**Output**: Production files are generated in `client/dist/` directory.

### Development Server
To start the development server with hot reload:
```bash
cd client
npm run dev
```

**Access**: Application runs at `http://localhost:5173` (Vite auto-selects next available port if 5173 is in use).

### Preview Production Build
To preview the production build locally:
```bash
cd client
npm run preview
```

### Testing
**Note**: There are **NO unit tests** in this repository. The `npm test` command does not exist.

### Cleaning
To clean build artifacts and caches before rebuilding:
```bash
cd client
rm -rf dist node_modules/.vite
npm run build
```

If you encounter persistent build issues:
```bash
cd client
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Docker Commands

### Using Docker Compose (Recommended)
**Build and run** (from repository root):
```bash
docker compose up -d
```

**View logs**:
```bash
docker compose logs -f
```

**Stop**:
```bash
docker compose down
```

**Access**: Application runs at `http://localhost:3000` (port 80 in container).

**Note**: Use `docker compose` (v2 syntax), NOT `docker-compose` (v1 is deprecated).

### Using Docker Directly
**Build image** (from repository root):
```bash
docker build -t ai-agent-client .
```

**Run container**:
```bash
docker run -d -p 3000:80 --name ai-agent-client ai-agent-client
```

**Docker Build Process**: Multi-stage build uses Node.js 20 Alpine for building, then Nginx Alpine for serving. Build dependencies (python3, make, g++) are included for native modules.

## Project Architecture

### Directory Structure
```
AI-Agent-Framework-Client/
├── .github/                    # GitHub configuration (this file)
├── client/                     # React application (MAIN WORKING DIRECTORY)
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── ApiTester.tsx  # Main testing interface component
│   │   │   └── ApiTester.css  # Component styles
│   │   ├── services/          # API service layer
│   │   │   └── api.ts         # API client implementation
│   │   ├── App.tsx            # Main application component
│   │   ├── App.css            # App styles
│   │   ├── main.tsx           # Application entry point
│   │   ├── index.css          # Global styles
│   │   └── assets/            # Static assets
│   ├── public/                # Public static files
│   │   └── vite.svg           # Vite logo
│   ├── dist/                  # Build output (generated, not in git)
│   ├── package.json           # Dependencies and scripts
│   ├── package-lock.json      # Locked dependency versions
│   ├── eslint.config.js       # ESLint configuration (flat config)
│   ├── vite.config.ts         # Vite build configuration
│   ├── tsconfig.json          # Root TypeScript config (references)
│   ├── tsconfig.app.json      # App TypeScript config
│   ├── tsconfig.node.json     # Node/Vite TypeScript config
│   ├── index.html             # HTML entry point
│   ├── .env.example           # Environment variables template
│   └── README.md              # Vite+React template info
├── Dockerfile                 # Multi-stage Docker build config
├── docker-compose.yml         # Docker Compose configuration
├── nginx.conf                 # Nginx production server config
├── DEPLOYMENT.md              # Deployment documentation
├── README.md                  # Main repository documentation
└── .gitignore                # Git ignore patterns
```

### Key Files

**Application Entry Points**:
- `client/index.html` - HTML template
- `client/src/main.tsx` - React app bootstrap
- `client/src/App.tsx` - Main app component
- `client/src/components/ApiTester.tsx` - Primary UI component (~250 lines)

**API Layer**:
- `client/src/services/api.ts` - API client service (~260 lines)
  - Handles all HTTP requests
  - Provides predefined test methods for API endpoints
  - Configurable base URL via environment variables

**Configuration Files**:
- `client/package.json` - npm scripts: dev, build, lint, preview
- `client/vite.config.ts` - Vite configuration (uses @vitejs/plugin-react)
- `client/eslint.config.js` - ESLint v9 flat config
- `client/tsconfig.*.json` - TypeScript project references
- `Dockerfile` - Multi-stage build: Node 20 Alpine → Nginx Alpine
- `docker-compose.yml` - Single service, port 3000:80, env VITE_API_BASE_URL
- `nginx.conf` - Production server config with caching, gzip, security headers

### TypeScript Configuration
The project uses **TypeScript project references** with 3 config files:
- `tsconfig.json` - Root config (empty files array, references other configs)
- `tsconfig.app.json` - Application code config (src/ directory)
- `tsconfig.node.json` - Build tooling config (vite.config.ts)

**Compiler Options**:
- Target: ES2022 (app), ES2023 (node)
- Module: ESNext with bundler resolution
- JSX: react-jsx
- Strict mode enabled
- No emit (bundler handles output)

### Dependencies
**Runtime Dependencies**:
- react: ^19.2.0
- react-dom: ^19.2.0

**Dev Dependencies**:
- TypeScript ~5.9.3
- Vite ^7.2.4
- ESLint ^9.39.1 with React plugins
- @vitejs/plugin-react ^5.1.1
- @types/react, @types/react-dom, @types/node

**Note**: No testing libraries are installed. No test framework is configured.

## Environment Variables

**File**: `client/.env.example` (copy to `.env` for local dev)

**Variables**:
- `VITE_API_BASE_URL` - Base URL for AI-Agent-Framework API
  - Default: `http://localhost:8000/api`
  - Set at **build time** (Vite injects via import.meta.env)

**Setting Environment Variables**:
1. **Local Development**: Create `client/.env` file
2. **Docker Compose**: Set in `docker-compose.yml` environment section
3. **Docker Run**: Use `-e VITE_API_BASE_URL=...` flag

**Important**: Environment variables are baked into the build. Changing them requires rebuilding.

## Common Issues and Solutions

### Build Issues
**Problem**: Build fails with module errors
**Solution**: Clean and reinstall dependencies:
```bash
cd client
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Problem**: TypeScript compilation errors
**Solution**: Ensure all tsconfig files are present. Run `tsc -b` separately to see detailed errors.

### Port Conflicts
**Problem**: Port 5173 (dev) or 3000 (Docker) already in use
**Solution**: 
- Dev server auto-selects next port, or use `npm run dev -- --port 8080`
- Docker: Edit `docker-compose.yml` ports section to use different port

### ESLint Errors
**Problem**: Linting fails after dependency updates
**Solution**: ESLint v9 uses flat config. Verify eslint.config.js syntax. Check that all plugins are compatible with ESLint v9.

### Docker Build Failures
**Problem**: Docker build fails on npm ci
**Solution**: Dockerfile uses multi-stage build. Ensure package-lock.json is committed and up-to-date.

## Validation Steps

Before committing code changes:
1. **Lint**: `cd client && npm run lint` (must pass with 0 errors)
2. **Build**: `cd client && npm run build` (must complete successfully)
3. **Check output**: Verify `client/dist/` contains index.html and assets/

Before creating PR:
1. Run all validation steps above
2. Test Docker build if Dockerfile or dependencies changed: `docker build -t test .`
3. Review that only intended files are staged (no dist/, node_modules/, .env)

## CI/CD and Workflows

**Current Status**: No GitHub Actions workflows are configured in this repository.

**Manual Validation**: All validation must be performed locally before committing.

## Best Practices

1. **ALWAYS work from the `client` directory** for npm commands
2. **ALWAYS run `npm install`** after pulling changes that modify package.json
3. **ALWAYS run linting** before committing: `npm run lint`
4. **ALWAYS test the build** before committing: `npm run build`
5. **NEVER commit** `node_modules/`, `dist/`, or `.env` files (in .gitignore)
6. **Use npm ci** for clean installs in CI/CD or when troubleshooting
7. **Environment variables** must be set at build time for Vite apps
8. **TypeScript strict mode** is enabled; fix type errors, don't use `any` or `@ts-ignore`
9. **Docker Compose v2** syntax is `docker compose` (space, not hyphen)

## API Integration Points

The application tests these API endpoints:
- `GET /health` - Health check
- `GET /info` - API information and version
- `GET /agents` - List available agents
- `GET /agents/{id}/capabilities` - Agent capabilities
- `POST /execute` - Execute agent tasks

**Customization**: Modify `src/services/api.ts` to change endpoints or add new test methods.

## Making Code Changes

**Component Changes**: Edit `src/components/ApiTester.tsx` for UI changes
**API Changes**: Edit `src/services/api.ts` for API client changes
**Styling**: Edit corresponding .css files (component or global)
**Config Changes**: Edit vite.config.ts (build), eslint.config.js (linting), tsconfig.*.json (TypeScript)

**After Changes**:
1. Run dev server to test: `npm run dev`
2. Run linter: `npm run lint` (fix all errors)
3. Test production build: `npm run build && npm run preview`
4. Commit only source files, not build artifacts

## Trust These Instructions

These instructions have been validated by:
- Running `npm install` (successful, ~4s)
- Running `npm run lint` (successful, <2s, 0 errors)
- Running `npm run build` (successful, ~1.4s)
- Testing clean builds with cache clearing
- Verifying Docker and Docker Compose commands
- Confirming no test suite exists

**Only search for additional information if**:
- These instructions are incomplete for your specific task
- You encounter an error not documented here
- Dependencies or tools have been updated since these instructions were written
