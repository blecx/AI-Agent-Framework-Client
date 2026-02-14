import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  useParams,
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import ProjectList from './components/ProjectList';
import ProjectView from './components/ProjectView';
import ProposePanel from './components/ProposePanel';
import ApplyPanel from './components/ApplyPanel';
import CommandPanel from './components/CommandPanel';
import ApiTester from './components/ApiTester';
import UiLibraryDemo from './components/UiLibraryDemo';
import GuidedBuilder from './components/GuidedBuilder';
import { ToastProvider } from './components/ToastContext';
import ToastContainer from './components/ToastContainer';
import ErrorBoundary from './components/ErrorBoundary';
import LanguageSwitcher from './components/LanguageSwitcher';
import ConnectionStatus from './components/ConnectionStatus';
import ConnectionBanner from './components/ConnectionBanner';
import SyncPanel from './components/SyncPanel';
import { useConnection } from './hooks/useConnection';
import { ProjectsStateProvider } from './state/projectsState';
import { RaidStateProvider } from './state/raidState';
import { UiPreferencesProvider } from './state/uiPreferences';
import { WorkflowStateProvider } from './state/workflowState';
import type { ConnectionState } from './types/connection';
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

interface NavigationProps {
  connectionState: ConnectionState;
}

function Navigation({ connectionState }: NavigationProps) {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <nav className="app-nav">
      <div className="nav-brand">
        <h1>AI Agent Framework</h1>
      </div>
      <div className="nav-links">
        <Link
          to="/guided-builder"
          className={location.pathname.startsWith('/guided-builder') ? 'active nav-link-cta' : 'nav-link-cta'}
        >
          → {t('nav.guidedBuilder')}
        </Link>
        <Link
          to="/projects"
          className={location.pathname.startsWith('/projects') ? 'active' : ''}
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
      <div className="nav-status">
        <ConnectionStatus state={connectionState} />
        <LanguageSwitcher />
      </div>
    </nav>
  );
}

function App() {
  const { state: connectionState, retryConnection } = useConnection();

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
                      <a href="#main-content" className="skip-to-content">
                        Skip to main content
                      </a>
                      <Navigation connectionState={connectionState} />
                      <ConnectionBanner
                        state={connectionState}
                        onRetry={retryConnection}
                      />
                      <main id="main-content" className="app-main">
                        <Routes>
                          <Route
                            path="/"
                            element={
                              <ErrorBoundary name="ProjectList">
                                <ProjectList />
                              </ErrorBoundary>
                            }
                          />
                          <Route
                            path="/projects"
                            element={
                              <ErrorBoundary name="ProjectList">
                                <ProjectList />
                              </ErrorBoundary>
                            }
                          />
                          <Route
                            path="/projects/:projectKey"
                            element={
                              <ErrorBoundary name="ProjectView">
                                <ProjectView />
                              </ErrorBoundary>
                            }
                          />
                          <Route
                            path="/projects/:projectKey/propose"
                            element={
                              <ErrorBoundary name="ProposePanel">
                                <ProposePanel />
                              </ErrorBoundary>
                            }
                          />
                          <Route
                            path="/projects/:projectKey/apply"
                            element={
                              <ErrorBoundary name="ApplyPanel">
                                <ApplyPanelWrapper />
                              </ErrorBoundary>
                            }
                          />
                          <Route
                            path="/projects/:projectKey/artifacts"
                            element={
                              <ErrorBoundary name="ProjectView">
                                <ProjectView />
                              </ErrorBoundary>
                            }
                          />
                          <Route
                            path="/projects/:projectKey/sync"
                            element={
                              <ErrorBoundary name="SyncPanel">
                                <SyncPanel />
                              </ErrorBoundary>
                            }
                          />
                          <Route
                            path="/guided-builder"
                            element={
                              <ErrorBoundary name="GuidedBuilder">
                                <GuidedBuilder />
                              </ErrorBoundary>
                            }
                          />
                          <Route
                            path="/guided-builder/:step"
                            element={
                              <ErrorBoundary name="GuidedBuilder">
                                <GuidedBuilder />
                              </ErrorBoundary>
                            }
                          />
                          <Route
                            path="/commands"
                            element={
                              <ErrorBoundary name="CommandPanel">
                                <CommandPanel />
                              </ErrorBoundary>
                            }
                          />
                          <Route
                            path="/api-tester"
                            element={
                              <ErrorBoundary name="ApiTester">
                                <ApiTester />
                              </ErrorBoundary>
                            }
                          />
                          <Route
                            path="/ui"
                            element={
                              <ErrorBoundary name="UiLibraryDemo">
                                <UiLibraryDemo />
                              </ErrorBoundary>
                            }
                          />
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
