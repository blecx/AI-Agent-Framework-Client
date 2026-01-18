import './App.css';
import { ProjectProvider } from './contexts/ProjectContext';
import { Breadcrumb } from './components/Breadcrumb';
import { AppRoutes } from './AppRoutes';

function App() {
  return (
    <ProjectProvider>
      <div className="app">
        <Breadcrumb />
        <div className="main-content">
          <AppRoutes />
        </div>
      </div>
    </ProjectProvider>
  );
}

export default App;
