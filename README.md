# AI-Agent-Framework-Client

A modern web client that connects to the AI-Agent-Framework API, providing project management capabilities, document change proposals, command execution, and API testing.

## Features

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

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Run linter and tests: `npm run lint && npm run build`
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## License

This project is open source and available under the MIT License.

