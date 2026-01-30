import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  useParams,
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import ProjectList from './components/ProjectList';
import ProjectView from './components/ProjectView';
import ProposePanel from './components/ProposePanel';
import ApplyPanel from './components/ApplyPanel';
import CommandPanel from './components/CommandPanel';
import ApiTester from './components/ApiTester';
import UiLibraryDemo from './components/UiLibraryDemo';
import { ToastProvider } from './components/ToastContext';
import ToastContainer from './components/ToastContainer';
import ErrorBoundary from './components/ErrorBoundary';
import apiClient from './services/apiClient';
import { ProjectsStateProvider } from './state/projectsState';
import { RaidStateProvider } from './state/raidState';
import { UiPreferencesProvider } from './state/uiPreferences';
import { WorkflowStateProvider } from './state/workflowState';
import './App.css';

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function ApplyPanelWrapper() {
  const { projectKey } = useParams<{ projectKey: string }>();
  return <ApplyPanel projectKey={projectKey || ''} />;
}

function Navigation() {
  const location = useLocation();
  const [connectionStatus, setConnectionStatus] = useState<
    'checking' | 'connected' | 'disconnected'
  >('checking');

  useEffect(() => {
    let mounted = true;

    const checkConnection = async () => {
      try {
        await apiClient.checkHealth();
        if (mounted) {
          setConnectionStatus('connected');
        }
      } catch {
        if (mounted) {
          setConnectionStatus('disconnected');
        }
      }
    };

    // Initial check
    checkConnection();

    // Periodic health checks every 30 seconds
    const healthCheckInterval = parseInt(
      import.meta.env.VITE_HEALTH_CHECK_INTERVAL || '30000',
      10,
    );
    const intervalId = setInterval(checkConnection, healthCheckInterval);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, []);

  return (
    <nav className="app-nav">
      <div className="nav-brand">
        <h1>AI Agent Framework</h1>
      </div>
      <div className="nav-links">
        <Link
          to="/projects"
          className={location.pathname.startsWith('/project') ? 'active' : ''}
        >
          Projects
        </Link>
        <Link
          to="/commands"
          className={location.pathname === '/commands' ? 'active' : ''}
        >
          Commands
        </Link>
        <Link
          to="/api-tester"
          className={location.pathname === '/api-tester' ? 'active' : ''}
        >
          API Tester
        </Link>
        <Link to="/ui" className={location.pathname === '/ui' ? 'active' : ''}>
          UI Library
        </Link>
      </div>
      <div className="nav-status" role="status" aria-live="polite">
        <span
          className={`status-indicator status-${connectionStatus}`}
          aria-label={`Connection status: ${connectionStatus}`}
        >
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
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UiPreferencesProvider>
        <ProjectsStateProvider>
          <RaidStateProvider>
            <WorkflowStateProvider>
              <ToastProvider>
                <ErrorBoundary>
                  <Router>
                    <div className="App">
                      <Navigation />
                      <main className="app-main">
                        <Routes>
                          <Route path="/" element={<ProjectList />} />
                          <Route path="/projects" element={<ProjectList />} />
                          <Route
                            path="/projects/:projectKey"
                            element={<ProjectView />}
                          />
                          <Route
                            path="/projects/:projectKey/propose"
                            element={<ProposePanel />}
                          />
                          <Route
                            path="/projects/:projectKey/apply"
                            element={<ApplyPanelWrapper />}
                          />
                          <Route
                            path="/project/:key"
                            element={<ProjectView />}
                          />
                          <Route path="/commands" element={<CommandPanel />} />
                          <Route path="/api-tester" element={<ApiTester />} />
                          <Route path="/ui" element={<UiLibraryDemo />} />
                        </Routes>
                      </main>
                      <ToastContainer />
                    </div>
                  </Router>
                </ErrorBoundary>
              </ToastProvider>
            </WorkflowStateProvider>
          </RaidStateProvider>
        </ProjectsStateProvider>
      </UiPreferencesProvider>
    </QueryClientProvider>
  );
}

export default App;
