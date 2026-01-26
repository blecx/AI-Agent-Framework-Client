import './App.css';
import { useLocation } from 'react-router-dom';
import { ProjectProvider } from './contexts/ProjectContext';
import { Breadcrumb } from './components/Breadcrumb';
import { AppRoutes } from './AppRoutes';

function App() {
  const location = useLocation();

  // Hide breadcrumb on chat page (chat has its own complete layout)
  const showBreadcrumb = location.pathname !== '/chat';

  return (
    <ProjectProvider>
      <div className="app">
        {showBreadcrumb && <Breadcrumb />}
        <div className="main-content">
          <AppRoutes />
        </div>
      </div>
    </ProjectProvider>
  );
}

export default App;
