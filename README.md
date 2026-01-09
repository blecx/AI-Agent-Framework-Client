# AI-Agent-Framework-Client

A React/TypeScript web client that connects to the AI-Agent-Framework API and provides a comprehensive testing interface. This client allows you to test all API capabilities without implementing workflows.

## Features

- 🚀 Modern React/TypeScript application built with Vite
- 🧪 Comprehensive API testing interface
- 🔧 Configurable API endpoint
- 🐳 Docker support for easy deployment
- 📊 Real-time test results with detailed response viewing
- 🎨 Clean, responsive UI with visual status indicators

## Prerequisites

- Node.js 18+ and npm (for local development)
- Docker and Docker Compose (for containerized deployment)

## Quick Start

### Option 1: Docker (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/blecx/AI-Agent-Framework-Client.git
cd AI-Agent-Framework-Client
```

2. Build and run with Docker Compose:
```bash
docker-compose up -d
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
# Edit .env to set VITE_API_BASE_URL
```

4. Start the development server:
```bash
npm run dev
```

5. Access the application at `http://localhost:5173`

## Configuration

### Environment Variables

Create a `.env` file in the `client` directory with the following:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

You can also configure the API URL directly in the web interface.

### Docker Configuration

Edit `docker-compose.yml` to customize:
- Port mapping (default: 3000:80)
- API base URL
- Container name and network settings

## Usage

### Testing API Endpoints

The application provides several ways to test your API:

1. **Predefined Tests**: Click on any of the built-in test cards to test common endpoints:
   - Health Check
   - API Info
   - List Agents
   - Agent Capabilities

2. **Run All Tests**: Execute all predefined tests in sequence

3. **Custom Tests**: Use the custom test section to:
   - Specify any endpoint path
   - Choose HTTP method (GET, POST, PUT, DELETE, PATCH)
   - Provide request body (JSON)

### Test Results

Each test displays:
- ✓ Success or ✗ Error status
- HTTP method and endpoint
- Response time in milliseconds
- Detailed response data (expandable)
- Error messages (if any)

## Development

### Project Structure

```
AI-Agent-Framework-Client/
├── client/                     # React application
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── ApiTester.tsx  # Main testing interface
│   │   │   └── ApiTester.css  # Component styles
│   │   ├── services/          # API service layer
│   │   │   └── api.ts         # API client implementation
│   │   ├── App.tsx            # Main application component
│   │   └── main.tsx           # Application entry point
│   ├── package.json           # Dependencies and scripts
│   └── vite.config.ts         # Vite configuration
├── Dockerfile                 # Docker image configuration
├── docker-compose.yml         # Docker Compose setup
├── nginx.conf                 # Nginx configuration for production
└── README.md                  # This file
```

### Available Scripts

In the `client` directory:

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality

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

## API Integration

The client expects the AI-Agent-Framework API to be available at the configured base URL. Default endpoints tested:

- `GET /health` - Health check endpoint
- `GET /info` - API information and version
- `GET /agents` - List available agents
- `GET /agents/{id}/capabilities` - Get agent capabilities
- `POST /execute` - Execute agent tasks

Customize these endpoints in `src/services/api.ts` to match your API specification.

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
2. Check the API base URL configuration
3. Ensure no firewall is blocking the connection

### Docker Issues

If Docker container fails to start:
1. Check Docker logs: `docker-compose logs`
2. Ensure port 3000 is not already in use
3. Verify Docker and Docker Compose are properly installed

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

