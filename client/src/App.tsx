import { BrowserRouter as Router, Routes, Route, Link, useLocation, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ProjectList from './components/ProjectList'
import ProjectView from './components/ProjectView'
import ProposePanel from './components/ProposePanel'
import ApplyPanel from './components/ApplyPanel'
import CommandPanel from './components/CommandPanel'
import ApiTester from './components/ApiTester'
import apiClient from './services/apiClient'
import './App.css'

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function ApplyPanelWrapper() {
  const { projectKey } = useParams<{ projectKey: string }>()
  return <ApplyPanel projectKey={projectKey || ''} />
}

function Navigation() {
  const location = useLocation()
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking')

  useEffect(() => {
    const checkConnection = async () => {
      try {
        await apiClient.checkHealth()
        setConnectionStatus('connected')
      } catch {
        setConnectionStatus('disconnected')
      }
    }
    checkConnection()
  }, [])

  return (
    <nav className="app-nav">
      <div className="nav-brand">
        <h1>AI Agent Framework</h1>
      </div>
      <div className="nav-links">
        <Link to="/projects" className={location.pathname.startsWith('/projects') ? 'active' : ''}>
          Projects
        </Link>
        <Link to="/commands" className={location.pathname === '/commands' ? 'active' : ''}>
          Commands
        </Link>
        <Link to="/api-tester" className={location.pathname === '/api-tester' ? 'active' : ''}>
          API Tester
        </Link>
      </div>
      <div className="nav-status">
        <span className={`status-indicator status-${connectionStatus}`}>
          {connectionStatus === 'checking' && '⏳'}
          {connectionStatus === 'connected' && '✓'}
          {connectionStatus === 'disconnected' && '✗'}
        </span>
        <span className="status-text">
          {connectionStatus === 'checking' && 'Checking...'}
          {connectionStatus === 'connected' && 'Connected'}
          {connectionStatus === 'disconnected' && 'Disconnected'}
        </span>
      </div>
    </nav>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Navigation />
          <main className="app-main">
            <Routes>
              <Route path="/" element={<ProjectList />} />
              <Route path="/projects" element={<ProjectList />} />
              <Route path="/projects/:projectKey" element={<ProjectView />} />
              <Route path="/projects/:projectKey/propose" element={<ProposePanel />} />
              <Route path="/projects/:projectKey/apply" element={<ApplyPanelWrapper />} />
              <Route path="/commands" element={<CommandPanel />} />
              <Route path="/api-tester" element={<ApiTester />} />
            </Routes>
          </main>
        </div>
      </Router>
    </QueryClientProvider>
  )
}

export default App
