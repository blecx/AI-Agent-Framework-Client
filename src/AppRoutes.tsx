import { Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { ProjectList } from './pages/ProjectList';
import { ProjectDetail } from './pages/ProjectDetail';
import { RAIDView } from './pages/RAIDView';
import { WorkflowView } from './pages/WorkflowView';
import { NotFound } from './pages/NotFound';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/projects" element={<ProjectList />} />
      <Route path="/projects/:key" element={<ProjectDetail />} />
      <Route path="/projects/:key/raid" element={<RAIDView />} />
      <Route path="/projects/:key/workflow" element={<WorkflowView />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
