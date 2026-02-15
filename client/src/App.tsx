import {
  BrowserRouter as Router,
  Routes,
  Route,
  useParams,
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProjectList from './components/ProjectList';
import ProjectView from './components/ProjectView';
import ProposePanel from './components/ProposePanel';
import ApplyPanel from './components/ApplyPanel';
import CommandPanel from './components/CommandPanel';
import ApiTester from './components/ApiTester';
import UiLibraryDemo from './components/UiLibraryDemo';
import GuidedBuilder from './components/GuidedBuilder';
import AppNavigation from './components/AppNavigation';
import { ToastProvider } from './components/ToastContext';
import ToastContainer from './components/ToastContainer';
import ErrorBoundary from './components/ErrorBoundary';
import ConnectionBanner from './components/ConnectionBanner';
import SyncPanel from './components/SyncPanel';
import { useConnection } from './hooks/useConnection';
import AssistedCreation from './components/AssistedCreation';
import SkipToContent from './components/SkipToContent';
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

function AssistedCreationWrapper() {
  const { projectKey } = useParams<{ projectKey: string }>();
  return <AssistedCreation projectKey={projectKey || ''} />;
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
                      <SkipToContent />
                      <AppNavigation connectionState={connectionState} />
                      <ConnectionBanner
                        state={connectionState}
                        onRetry={retryConnection}
                      />
                      <main id="main-content" className="app-main" tabIndex={-1}>
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
                            path="/projects/:projectKey/readiness"
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
                            path="/projects/:projectKey/assisted-creation"
                            element={
                              <ErrorBoundary name="AssistedCreation">
                                <AssistedCreationWrapper />
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
