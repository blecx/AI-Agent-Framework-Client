# AI-Agent-Framework-Client

This is a web client that connects to the AI-Agent-Framework API and utilizes all its capabilities. It also provides specific workflows that are handled step by step by the AI-Agent.

## Features

- 🤖 **AI Agent Integration**: Connect to the AI-Agent-Framework API for intelligent responses
- 💾 **Prompt History Storage**: All conversations are automatically saved to browser localStorage
- 💬 **Multi-Conversation Support**: Create and manage multiple conversation threads
- 🎯 **Step-by-Step Workflows**: Execute complex workflows with the AI agent
- 🎨 **Modern UI**: Clean, responsive interface built with React and TypeScript

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/blecx/AI-Agent-Framework-Client.git
cd AI-Agent-Framework-Client
```

2. Install dependencies:
```bash
npm install
```

3. Configure the API endpoint:
```bash
cp .env.example .env
```

Edit `.env` and set your AI-Agent-Framework API URL:
```
VITE_API_URL=http://localhost:8000
VITE_API_KEY=your_api_key_here
```

### Development

Start the development server:
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

The application will be available at `http://localhost:3000`

### Build

Create a production build:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Usage

### Basic Chat

1. **Start a New Conversation**: Click the "+ New Conversation" button in the sidebar
2. **Send Messages**: Type your message in the input area and press Enter (or click Send)
3. **View History**: All conversations are saved automatically and can be accessed from the sidebar
4. **Switch Conversations**: Click on any conversation in the sidebar to view and continue it

### Workflow Commands

Execute workflows using the following syntax:
```
workflow: workflow-name with steps: step1, step2, step3
```

For workflow names with spaces, use quotes:
```
workflow: 'my workflow name' with steps: initialize, process, finalize
```

Example:
```
workflow: data-analysis with steps: collect, process, analyze, visualize
```

The workflow panel will appear below the chat showing real-time progress of each step.

## Architecture

### Components

- **Sidebar** (`src/components/Sidebar.tsx`): Displays conversation history and allows creating new conversations
- **ChatArea** (`src/components/ChatArea.tsx`): Shows messages in the current conversation
- **ChatInput** (`src/components/ChatInput.tsx`): Input area for sending new messages
- **Message** (`src/components/Message.tsx`): Individual message component
- **WorkflowPanel** (`src/components/WorkflowPanel.tsx`): Visual workflow execution tracker

### Services

- **HistoryService** (`src/services/historyService.ts`): Manages conversation storage in localStorage
  - `getConversations()`: Retrieve all conversations
  - `saveConversation()`: Save or update a conversation
  - `createConversation()`: Create a new conversation
  - `addMessage()`: Add a message to a conversation
  - `deleteConversation()`: Delete a conversation

- **ApiService** (`src/services/apiService.ts`): Handles communication with the AI-Agent-Framework API
  - `sendPrompt()`: Send a prompt to the API
  - `executeWorkflow()`: Execute a workflow step
  - `getStatus()`: Check API status

- **WorkflowService** (`src/services/workflowService.ts`): Manages workflow execution
  - `createWorkflow()`: Create a new workflow instance
  - `executeWorkflowStep()`: Execute a single workflow step
  - `executeAllSteps()`: Execute all remaining steps
  - `parseWorkflowCommand()`: Parse workflow commands from user input

### Data Storage

All conversations are stored in the browser's localStorage using the key `ai_agent_conversations`. Each conversation includes:
- Unique ID
- Title (derived from first message)
- Array of messages (user, assistant, system)
- Created and updated timestamps

### Data Model

```typescript
interface PromptMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

interface Conversation {
  id: string;
  title: string;
  messages: PromptMessage[];
  createdAt: number;
  updatedAt: number;
}

interface Workflow {
  id: string;
  name: string;
  steps: WorkflowStep[];
  currentStepIndex: number;
  status: 'idle' | 'running' | 'completed' | 'failed';
}
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

The client expects the AI-Agent-Framework API to have the following endpoints:

- `POST /api/prompt`: Send a prompt and receive a response
  - Request: `{ prompt: string, history: Array<{role: string, content: string}> }`
  - Response: `{ response: string }`

- `POST /api/workflow`: Execute a workflow step
  - Request: `{ workflow: string, params: object }`
  - Response: `{ stepId: string, result: string, isComplete: boolean }`

- `GET /api/status`: Check API status
  - Response: `{ status: string, version?: string }`

## Technologies

- **React 19**: UI framework
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **CSS3**: Styling

## Project Structure

```
AI-Agent-Framework-Client/
├── src/
│   ├── components/         # React components
│   │   ├── ChatArea.tsx
│   │   ├── ChatInput.tsx
│   │   ├── Message.tsx
│   │   ├── Sidebar.tsx
│   │   └── WorkflowPanel.tsx
│   ├── services/           # Business logic
│   │   ├── apiService.ts
│   │   ├── historyService.ts
│   │   └── workflowService.ts
│   ├── types/              # TypeScript types
│   │   └── index.ts
│   ├── App.tsx             # Main application component
│   ├── App.css             # Application styles
│   ├── main.tsx            # Application entry point
│   └── vite-env.d.ts       # Vite type definitions
├── index.html              # HTML entry point
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
├── package.json            # Dependencies and scripts
└── README.md               # This file
```

## Features in Detail

### Prompt History Storage

- Automatic saving of all conversations to localStorage
- Persistent across browser sessions
- Support for unlimited conversations
- Each message includes role, content, and timestamp
- Automatic title generation from first message

### AI Agent Integration

- Context-aware conversations with full history
- Error handling with informative messages
- Support for streaming responses (when API supports it)
- Configurable API endpoint and authentication

### Workflow Execution

- Parse workflow commands from natural language
- Step-by-step execution visualization
- Real-time status updates for each step
- Support for multiple concurrent workflows
- Automatic error handling and retry logic

## License

ISC
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

