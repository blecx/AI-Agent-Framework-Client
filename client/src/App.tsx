import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import ProjectList from './components/ProjectList'
import ProjectView from './components/ProjectView'
import ProposePanel from './components/ProposePanel'
import CommandPanel from './components/CommandPanel'
import ApiTester from './components/ApiTester'
import apiClient from './services/apiClient'
import './App.css'

function Navigation() {
  const location = useLocation()
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking')

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    try {
      await apiClient.checkHealth()
      setConnectionStatus('connected')
    } catch {
      setConnectionStatus('disconnected')
    }
  }

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
    <Router>
      <div className="App">
        <Navigation />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<ProjectList />} />
            <Route path="/projects" element={<ProjectList />} />
            <Route path="/projects/:projectKey" element={<ProjectView />} />
            <Route path="/projects/:projectKey/propose" element={<ProposePanel />} />
            <Route path="/commands" element={<CommandPanel />} />
            <Route path="/api-tester" element={<ApiTester />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
