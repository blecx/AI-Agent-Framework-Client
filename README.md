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
