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

1. **Start a New Conversation**: Click the "+ New Conversation" button in the sidebar
2. **Send Messages**: Type your message in the input area and press Enter (or click Send)
3. **View History**: All conversations are saved automatically and can be accessed from the sidebar
4. **Switch Conversations**: Click on any conversation in the sidebar to view and continue it

## Architecture

### Components

- **Sidebar**: Displays conversation history and allows creating new conversations
- **ChatArea**: Shows messages in the current conversation
- **ChatInput**: Input area for sending new messages
- **Message**: Individual message component

### Services

- **HistoryService**: Manages conversation storage in localStorage
  - `getConversations()`: Retrieve all conversations
  - `saveConversation()`: Save or update a conversation
  - `createConversation()`: Create a new conversation
  - `addMessage()`: Add a message to a conversation
  - `deleteConversation()`: Delete a conversation

- **ApiService**: Handles communication with the AI-Agent-Framework API
  - `sendPrompt()`: Send a prompt to the API
  - `executeWorkflow()`: Execute a workflow step by step
  - `getStatus()`: Check API status

### Data Storage

All conversations are stored in the browser's localStorage using the key `ai_agent_conversations`. Each conversation includes:
- Unique ID
- Title (derived from first message)
- Array of messages (user, assistant, system)
- Created and updated timestamps

## API Integration

The client expects the AI-Agent-Framework API to have the following endpoints:

- `POST /api/prompt`: Send a prompt and receive a response
- `POST /api/workflow`: Execute a workflow
- `GET /api/status`: Check API status

## Technologies

- **React 19**: UI framework
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **CSS3**: Styling

## License

ISC
