# AI-Agent-Framework-Client

A modern web client that connects to the AI-Agent-Framework API, providing project management capabilities, document change proposals, command execution, and API testing.

## ⚡ Quick Start

Get the full stack running in under 5 minutes! See **[QUICKSTART.md](QUICKSTART.md)** for the fastest way to deploy.

```bash
# Automated production setup (Linux/Mac)
curl -fsSL https://raw.githubusercontent.com/blecx/AI-Agent-Framework-Client/main/production-setup.sh | bash

# Or manual Docker Compose
docker compose -f docker-compose.production.yml up -d
```

**Access**: Client at [http://localhost:3000](http://localhost:3000) • API at [http://localhost:8000](http://localhost:8000)

## 📚 Documentation

- **[Quick Start Guide](QUICKSTART.md)** - Get running in 5 minutes
- **[Development Setup](docs/DEVELOPMENT.md)** - Full development environment guide
- **[Testing Guide](docs/TESTING.md)** - Manual testing workflows and validation
- **[E2E Testing Guide](client/e2e/README.md)** - Playwright E2E test setup and usage
- **[Production Deployment](docs/PRODUCTION.md)** - Production setup, security, and scaling
- **[Deployment Guide](DEPLOYMENT.md)** - Docker and environment configuration

## 🤝 Contributing

We follow a structured workflow for all contributions: **Plan → Issues → PRs**

### Development Workflow

1. **Start with a Plan** - Define clear goals, scope, and acceptance criteria
2. **Break into Small Issues** - Create focused issues (1-2 hours each)
3. **One Issue Per PR** - Keep changes surgical and diffs small
4. **Include Validation** - Always run lint and build before committing

### Resources for Contributors

- **[Copilot Instructions](.github/copilot-instructions.md)** - Complete development workflow and best practices
- **[Prompt Templates](.github/prompts/)** - Reusable templates for planning, issues, and PRs
  - [Feature Planning](.github/prompts/feature-planning.md) - Plan new features
  - [Implementation Issue](.github/prompts/implementation-issue.md) - Create detailed issues
  - [PR Description](.github/prompts/pr-description.md) - Write comprehensive PR descriptions
  - [Cross-Repo Coordination](.github/prompts/cross-repo-coordination.md) - Coordinate with backend API

### Quick Contribution Guide

```bash
# 1. Fork and clone the repository
git clone https://github.com/YOUR-USERNAME/AI-Agent-Framework-Client.git
cd AI-Agent-Framework-Client

# 2. Create a feature branch
git checkout -b feature/your-feature-name

# 3. Make changes in the client directory
cd client
npm install
npm run dev  # Test your changes

# 4. Validate before committing
npm run lint   # Must pass
npm run build  # Must succeed

# 5. Commit and push
git add .
git commit -m "Description of changes"
git push origin feature/your-feature-name

# 6. Open PR with detailed description (use prompt template)
```

### Cross-Repo Coordination

If your changes require backend API modifications:
1. Create/link an issue in [`blecx/AI-Agent-Framework`](https://github.com/blecx/AI-Agent-Framework) first
2. Wait for backend changes to merge (or coordinate compatible changes)
3. Use the [Cross-Repo Coordination template](.github/prompts/cross-repo-coordination.md)

## 🏗️ Architecture

The AI-Agent-Framework consists of two main components that work together:

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
│                   (This Repository)                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  React 19 + TypeScript + Vite                        │  │
│  │  Port: 3000 (prod) / 5173 (dev)                      │  │
│  │  - API Testing Interface                              │  │
│  │  - Project Management UI                              │  │
│  │  - Document Proposal Interface                        │  │
│  │  - Command Execution Panel                            │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ REST API Calls
                            │ /api/health, /api/info
                            │ /api/agents, /api/execute
                            │
┌───────────────────────────▼─────────────────────────────────┐
│              AI-Agent-Framework API                         │
│            (blecx/AI-Agent-Framework)                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  FastAPI + Python                                     │  │
│  │  Port: 8000                                           │  │
│  │  - Agent Management                                   │  │
│  │  - LLM Integration                                    │  │
│  │  - Project/Document Management                        │  │
│  │  - Command Execution                                  │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ LLM API Calls
                            │
                    ┌───────▼────────┐
                    │   LLM Provider  │
                    │  (LM Studio,    │
                    │  OpenAI, etc)   │
                    └─────────────────┘
```

### Integration Points

- **Client** makes HTTP requests to API endpoints
- **API** processes requests and coordinates with LLM providers
- **Docker networking** enables seamless container-to-container communication
- **CORS** configured for secure cross-origin requests

## ✨ Features

- 📁 **Project Management**: Create and manage projects with Git repository integration
- 📝 **Document Proposals**: Submit and review document change proposals
- ⚡ **Command Execution**: Execute commands with real-time status and output tracking
- 🧪 **API Testing**: Test API endpoints without workflows
- 🎨 **Modern UI**: Clean, responsive interface built with React 19, TypeScript, and Vite
- 🔄 **State Management**: React Query for efficient data fetching and caching

## Getting Started

### Prerequisites

- Node.js 18+ (tested with v20.19.6)
- npm 10+ (tested with v10.8.2)
- Docker (optional, for containerized deployment)

### Option 1: Docker Deployment (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/blecx/AI-Agent-Framework-Client.git
cd AI-Agent-Framework-Client
```

2. Build and run with Docker Compose:
```bash
docker compose up -d
```

3. Access the application at `http://localhost:3000`

### Option 2: Local Development

1. Clone the repository:
```bash
git clone https://github.com/blecx/AI-Agent-Framework-Client.git
cd AI-Agent-Framework-Client
```

2. Navigate to the client directory and install dependencies:
```bash
cd client
npm install
```

3. Configure the API endpoint (optional):
```bash
cp .env.example .env
# Edit .env to set VITE_API_BASE_URL and VITE_API_KEY
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

Create a production build:
```bash
cd client
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Environment Configuration

Create a `.env` file in the `client/` directory:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_API_KEY=your-api-key-here
```

**Note**: Environment variables are injected at build time. Rebuild the application after changing them.

### Workflow Commands

Execute workflows using the following syntax:
```

## Usage

### Project Management

#### Creating a Project

1. Navigate to the home page (`/`)
2. Click the **"+ Create Project"** button
3. Fill in the required fields:
   - **Project Key**: Unique identifier (lowercase, hyphens allowed)
   - **Project Name**: Display name for the project
   - **Description**: Optional project description
4. Click **"Create Project"**

#### Viewing Project Details

1. From the project list, click on any project card
2. View project information including:
   - Project metadata (created, updated dates)
   - Git repository information (if configured)
   - Associated documents
3. Use tabs to access different features:
   - **Overview**: View project details
   - **Propose Changes**: Submit document change proposals
   - **Apply Proposals**: Review and apply pending proposals
   - **Commands**: Execute commands on the project

### Document Change Proposals

#### Creating a Proposal

1. Navigate to a project and select the **"Propose Changes"** tab
2. Fill in the proposal form:
   - **Title**: Brief description of changes
   - **Description**: Detailed explanation
   - **Changes (JSON)**: Structured changes to documents
3. Click **"Load Example"** to see the expected JSON format
4. Submit the proposal

Example JSON format:
```json
{
  "files": [
    {
      "path": "src/example.ts",
      "type": "modify",
      "before": "old content",
      "after": "new content"
    }
  ]
}
```

#### Reviewing and Applying Proposals

1. Navigate to the **"Apply Proposals"** tab
2. Browse pending proposals in the list
3. Click on a proposal to preview changes
4. Review the diff or before/after comparison
5. Click **"Apply Proposal"** to accept or **"Reject"** to decline

### Command Execution

1. Navigate to the **"Commands"** tab in a project
2. Enter a command (e.g., `npm install`, `git status`, `build`)
3. Optionally provide arguments
4. Click **"Execute Command"**
5. Monitor real-time status and output in the command history

### API Testing

Access the API tester at `/api-tester` to:
- Test health check, API info, agents, and capabilities endpoints
- Run custom tests with any HTTP method
- View detailed response data and timing

## Development

### Project Structure

```
AI-Agent-Framework-Client/
├── client/                          # Main React application
│   ├── src/
│   │   ├── components/             # React components
│   │   │   ├── ProjectList.tsx     # Project listing and creation
│   │   │   ├── ProjectView.tsx     # Project details view
│   │   │   ├── ProposePanel.tsx    # Change proposal form
│   │   │   ├── ApplyPanel.tsx      # Proposal review interface
│   │   │   ├── CommandPanel.tsx    # Command execution UI
│   │   │   └── ApiTester.tsx       # API testing interface
│   │   ├── services/               # API service layer
│   │   │   ├── apiClient.ts        # Main API client
│   │   │   └── api.ts              # Legacy API service
│   │   ├── types/                  # TypeScript type definitions
│   │   │   └── index.ts
│   │   ├── App.tsx                 # Main app with routing
│   │   └── main.tsx                # Application entry point
│   ├── package.json                # Dependencies and scripts
│   ├── vite.config.ts              # Vite configuration
│   ├── tsconfig.json               # TypeScript configuration
│   └── eslint.config.js            # ESLint v9 flat config
├── Dockerfile                      # Multi-stage Docker build
├── docker-compose.yml              # Docker Compose setup
├── nginx.conf                      # Nginx production config
└── README.md                       # This file
```

### Available Scripts

In the `client/` directory:

- `npm run dev` - Start development server with hot reload (port 5173)
- `npm run build` - Build production bundle (`tsc -b && vite build`)
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality (must pass before commit)
- `npm test` - Run unit tests with Vitest
- `npm run test:e2e` - Run E2E tests with Playwright (requires backend API, local development only)

### Testing

The project includes comprehensive testing:

- **Unit Tests**: Component and logic tests using Vitest
- **E2E Tests**: Full workflow tests using Playwright (local development only)
  - See **[E2E Testing Guide](client/e2e/README.md)** for setup and usage
  - Tests cover: project creation, proposals, applying changes, navigation, error handling
  - Tests are strongly independent and can run in parallel
  - Requires backend API to be running
  - **Note**: E2E tests are NOT run in CI. Backend E2E testing is done using the CLI client in the backend repository.

```bash
# Run unit tests
npm test

# Run E2E tests (local development, requires backend)
cd client
./run-e2e-tests.sh  # Convenience script that handles backend setup

# Or manually:
./e2e/setup-backend.sh  # Start backend if not running
npm run test:e2e

# Run E2E tests in headed mode (visual)
npx playwright test --headed

# View E2E test report
npx playwright show-report
```

### API Integration

The client expects the AI-Agent-Framework API to provide the following endpoints:

#### Project Management
- `GET /projects` - List all projects
- `POST /projects` - Create a new project
- `GET /projects/:key` - Get project details
- `PUT /projects/:key` - Update project
- `DELETE /projects/:key` - Delete project

#### Proposals
- `GET /projects/:key/proposals` - List proposals for a project
- `POST /projects/:key/proposals` - Create a new proposal
- `GET /projects/:key/proposals/:id` - Get proposal details
- `POST /projects/:key/proposals/:id/apply` - Apply a proposal
- `POST /projects/:key/proposals/:id/reject` - Reject a proposal

#### Commands
- `POST /commands` - Execute a command
- `GET /commands/:id` - Get command status
- `GET /commands?projectKey=:key` - Get command history for a project

#### API Testing Endpoints
- `GET /health` - Health check
- `GET /info` - API information
- `GET /agents` - List available agents
- `GET /agents/:id/capabilities` - Get agent capabilities
- `POST /execute` - Execute agent tasks

Customize these endpoints in `src/services/apiClient.ts` to match your API specification.

### Docker Configuration

Edit `docker-compose.yml` to customize:
- Port mapping (default: 3000:80)
- Environment variables
- Container name and network settings

### Building for Production

#### Local Build
```bash
cd client
npm run build
```

The built files will be in `client/dist/`.

#### Docker Build
```bash
docker build -t ai-agent-client .
docker run -p 3000:80 ai-agent-client
```

## Technologies

- **React 19**: Modern UI framework with concurrent features
- **TypeScript 5.9**: Type-safe development
- **Vite 7**: Fast build tool and dev server with HMR
- **React Router 6**: Client-side routing
- **TanStack Query**: Powerful data synchronization and caching
- **Axios**: Promise-based HTTP client
- **ESLint 9**: Code quality with flat config
- **Vitest**: Unit testing framework
- **Playwright**: E2E testing framework for comprehensive workflow testing
- **Docker**: Containerized deployment with Nginx

## Troubleshooting

### CORS Issues

If you encounter CORS errors, ensure your API server has the appropriate CORS headers configured:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### Connection Refused

If tests fail with "Connection refused":
1. Verify the API server is running
2. Check the API base URL configuration in `.env`
3. Ensure no firewall is blocking the connection
4. For Docker: verify containers are on the same network

### Build Errors

**TypeScript errors:**
```bash
cd client
rm -rf node_modules package-lock.json
npm install
npm run build
```

**ESLint errors:**
```bash
cd client
npm run lint
```
Fix any reported issues before committing.

### Docker Issues

If Docker container fails to start:
1. Check logs: `docker compose logs`
2. Ensure port 3000 is not in use: `lsof -i :3000`
3. Verify Docker and Docker Compose are installed: `docker compose version`
4. Rebuild: `docker compose up -d --build`

### Environment Variables Not Working

Remember that Vite environment variables are injected at **build time**, not runtime:
1. Update `.env` file
2. Rebuild: `npm run build` or `docker compose up -d --build`
3. For development: restart dev server after changing `.env`

## 📖 Additional Resources

### Setup and Deployment
- **[Quick Start Guide](QUICKSTART.md)** - Get running in 5 minutes with automated scripts
- **[Production Setup Script (Bash)](production-setup.sh)** - Automated Linux/Mac setup
- **[Production Setup Script (PowerShell)](production-setup.ps1)** - Automated Windows setup
- **[Production Docker Compose](docker-compose.production.yml)** - Full stack deployment config
- **[Validation Script](scripts/validate-setup.sh)** - Verify deployment health

### Documentation
- **[Development Guide](docs/DEVELOPMENT.md)** - Complete dev environment setup, workflows, debugging
- **[Testing Guide](docs/TESTING.md)** - Manual testing, integration testing, validation checklists
- **[Production Guide](docs/PRODUCTION.md)** - Security, monitoring, scaling, backups
- **[Deployment Guide](DEPLOYMENT.md)** - Docker deployment and configuration

### API Repository
- **[AI-Agent-Framework API](https://github.com/blecx/AI-Agent-Framework)** - The backend API this client connects to

### Configuration
- **[Client Environment Config](client/.env.example)** - Client-side environment variables
- **[Production Environment Config](.env.production.example)** - Full stack production config

## 🚀 Deployment Options

### 1. Automated Production Setup (Recommended)
```bash
# Linux/macOS - Full stack in one command
./production-setup.sh

# Windows PowerShell
.\production-setup.ps1
```

### 2. Docker Compose (Manual)
```bash
# Full stack (Client + API)
docker compose -f docker-compose.production.yml up -d

# Client only
docker compose up -d
```

### 3. Local Development
```bash
# Install and run
cd client
npm install
npm run dev
```

See [QUICKSTART.md](QUICKSTART.md) for detailed instructions.

## 🔧 System Requirements

- **Node.js**: 20+ (tested with v20.19.6)
- **npm**: 10+ (tested with v10.8.2)
- **Docker**: 28+ with Compose v2 (for containerized deployment)
- **RAM**: 2GB minimum, 4GB recommended
- **Ports**: 3000 (client), 8000 (API)

## 🛡️ Security

For production deployments:
- Use HTTPS with SSL certificates (Let's Encrypt recommended)
- Configure firewall to block direct access to ports 3000 and 8000
- Set up API authentication with secure API keys
- Configure CORS with specific allowed origins
- Keep Docker images and dependencies updated
- Implement monitoring and log aggregation

See [docs/PRODUCTION.md](docs/PRODUCTION.md) for comprehensive security guidelines.

## 📊 Monitoring

### Health Checks
```bash
# API health
curl http://localhost:8000/health

# Client accessibility
curl http://localhost:3000

# Run validation script
./scripts/validate-setup.sh
```

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f ai-agent-client
docker compose logs -f ai-agent-api
```

## 🤝 Support

- **Issues**: [GitHub Issues](https://github.com/blecx/AI-Agent-Framework-Client/issues)
- **API Documentation**: http://localhost:8000/docs (when API is running)
- **Development Questions**: See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)
- **Production Issues**: See [docs/PRODUCTION.md#troubleshooting](docs/PRODUCTION.md#troubleshooting)

## License

This project is open source and available under the MIT License.

