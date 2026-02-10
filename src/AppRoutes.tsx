import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// Lazy load page components for code splitting
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Chat = lazy(() => import('./pages/Chat').then(m => ({ default: m.Chat })));
const ProjectList = lazy(() => import('./pages/ProjectList').then(m => ({ default: m.ProjectList })));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail').then(m => ({ default: m.ProjectDetail })));
const RAIDView = lazy(() => import('./pages/RAIDView').then(m => ({ default: m.RAIDView })));
const WorkflowView = lazy(() => import('./pages/WorkflowView').then(m => ({ default: m.WorkflowView })));
const NotFound = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));

// Loading fallback component
function LoadingFallback() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <div aria-label="Loading...">⏳ Loading...</div>
    </div>
  );
}

export function AppRoutes() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/projects" element={<ProjectList />} />
        <Route path="/projects/:key" element={<ProjectDetail />} />
        <Route path="/projects/:key/raid" element={<RAIDView />} />
        <Route path="/projects/:key/workflow" element={<WorkflowView />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
