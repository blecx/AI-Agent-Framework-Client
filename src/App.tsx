import './App.css';
import { useLocation } from 'react-router-dom';
import { ProjectProvider } from './contexts/ProjectContext';
import { Breadcrumb } from './components/Breadcrumb';
import { AppRoutes } from './AppRoutes';
import { UiPreferencesProvider } from './state/uiPreferences';
import { ProjectsStateProvider } from './state/projectsState';
import { RaidStateProvider } from './state/raidState';
import { WorkflowStateProvider } from './state/workflowState';

function App() {
  const location = useLocation();

  // Hide breadcrumb on chat page (chat has its own complete layout)
  const showBreadcrumb = location.pathname !== '/chat';

  return (
    <UiPreferencesProvider>
      <ProjectsStateProvider>
        <RaidStateProvider>
          <WorkflowStateProvider>
            <ProjectProvider>
              <div className="app">
                {showBreadcrumb && <Breadcrumb />}
                <div className="main-content">
                  <AppRoutes />
                </div>
              </div>
            </ProjectProvider>
          </WorkflowStateProvider>
        </RaidStateProvider>
      </ProjectsStateProvider>
    </UiPreferencesProvider>
  );
}

export default App;
