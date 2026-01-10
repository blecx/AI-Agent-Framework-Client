# AI-Agent-Framework-Client

A modern web client for the [AI-Agent-Framework](https://github.com/blecx/AI-Agent-Framework) API. This application provides a graphical interface to manage projects, propose document changes, apply proposals, and execute commands through an AI agent.

## Features

- 📁 **Project Management**: Create, view, and manage projects with document structures
- ✍️ **Propose Changes**: Submit document change proposals with file uploads
- ✅ **Apply Proposals**: Review and apply pending proposals to projects
- 💬 **Command Interface**: Chat-style command execution with history
- 🎨 **Modern UI**: Clean, responsive interface built with React 19 and TypeScript
- 🚀 **Fast Development**: Powered by Vite with Hot Module Replacement (HMR)
- 🐳 **Docker Ready**: Multi-stage Docker build with Nginx for production

## Tech Stack

- **Frontend**: React 19.2, TypeScript 5.9, React Router DOM
- **Build Tool**: Vite 7.2
- **HTTP Client**: Axios
- **Linting**: ESLint 9 with TypeScript support
- **Deployment**: Docker with Nginx Alpine

## Getting Started

### Prerequisites

- Node.js 18+ (tested with v20.19.6)
- npm 10+ (tested with v10.8.2)
- Docker (optional, for containerized deployment)

### Option 1: Local Development

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
# Edit .env to set VITE_API_BASE_URL
```

Default configuration:
```
VITE_API_BASE_URL=http://localhost:8000/api
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Option 2: Docker Deployment

1. Build and run with Docker Compose:
```bash
docker compose up -d
```

2. Access the application at `http://localhost:3000`

To stop:
```bash
docker compose down
```

### Build for Production

Create an optimized production build:
```bash
cd client
npm run build
```

The build output will be in `client/dist/`

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
AI-Agent-Framework-Client/
├── client/                        # Main application directory
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProjectList.tsx   # List all projects
│   │   │   ├── ProjectView.tsx   # View single project details
│   │   │   ├── ProposePanel.tsx  # Propose document changes
│   │   │   ├── ApplyPanel.tsx    # Apply proposals
│   │   │   └── CommandPanel.tsx  # Command interface
│   │   ├── services/
│   │   │   ├── api.ts             # Legacy API service
│   │   │   └── apiClient.ts       # Project management API client
│   │   ├── types/
│   │   │   └── index.ts           # TypeScript type definitions
│   │   ├── App.tsx                # Main app component with routing
│   │   └── main.tsx               # Application entry point
│   ├── dist/                      # Build output (gitignored)
│   ├── package.json               # Dependencies and scripts
│   ├── vite.config.ts             # Vite configuration
│   ├── tsconfig.json              # TypeScript configuration
│   └── eslint.config.js           # ESLint configuration
├── Dockerfile                     # Multi-stage Docker build
├── docker-compose.yml             # Docker Compose configuration
├── nginx.conf                     # Nginx server configuration
└── README.md                      # This file
```

## Available Routes

- `/` - Project list page
- `/projects/:projectKey` - Project details view
- `/projects/:projectKey/propose` - Propose changes panel
- `/projects/:projectKey/apply` - Apply proposals panel
- `/commands` - Command interface

## npm Scripts

From the `client/` directory:

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production (TypeScript + Vite)
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint on source code

## Configuration

### Environment Variables

Environment variables are set at **build time** (not runtime). Rebuild the application after changing these values:

- `VITE_API_BASE_URL` - Base URL for the AI-Agent-Framework API (default: `http://localhost:8000/api`)
- `VITE_API_KEY` - Optional API key for authentication

### Vite Configuration

The Vite dev server is configured to:
- Run on `0.0.0.0:3000` (accessible from network)
- Use React plugin with Fast Refresh
- Support TypeScript out of the box

## API Integration

The application integrates with the [AI-Agent-Framework](https://github.com/blecx/AI-Agent-Framework) API and expects the following endpoints:

- `GET /projects` - List all projects
- `GET /projects/:key` - Get project details
- `POST /projects` - Create a new project
- `POST /projects/:key/propose` - Propose changes
- `POST /projects/:key/proposals/:id/apply` - Apply a proposal
- `POST /commands` - Execute a command
- `GET /commands/history` - Get command history

**Note**: Mock data is used when the API is unavailable for development purposes.

## Development

### Adding New Components

1. Create component file in `client/src/components/`
2. Create corresponding CSS file for styling
3. Add route in `App.tsx` if needed
4. Update type definitions in `client/src/types/` if necessary

### Code Style

- Follow TypeScript strict mode
- Use functional components with hooks
- Prefer `const` over `let`
- Use type-only imports for types: `import type { Type } from '...'`
- Run `npm run lint` before committing

## Docker Details

The multi-stage Dockerfile:
1. **Builder stage**: Uses Node 20 Alpine to install dependencies and build the app
2. **Production stage**: Uses Nginx Alpine to serve the static files

This results in a small, efficient production image (~50MB).

## Troubleshooting

### Build Fails

```bash
cd client
rm -rf node_modules package-lock.json dist
npm install
npm run build
```

### Port Already in Use

The dev server will automatically use the next available port. For Docker, edit the port mapping in `docker-compose.yml`.

### API Connection Issues

- Verify `VITE_API_BASE_URL` is correctly set
- Check that the AI-Agent-Framework API is running
- Rebuild after changing environment variables

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run lint` and `npm run build`
5. Submit a pull request

## License

ISC

## Related Projects

- [AI-Agent-Framework](https://github.com/blecx/AI-Agent-Framework) - The backend API for this client

## Support

For issues and questions, please open an issue on GitHub.

