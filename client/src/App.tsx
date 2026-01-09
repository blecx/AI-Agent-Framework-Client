import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ProjectList from './components/ProjectList'
import ProjectView from './components/ProjectView'
import ApiTester from './components/ApiTester'
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<ProjectList />} />
            <Route path="/project/:key" element={<ProjectView />} />
            <Route path="/api-tester" element={<ApiTester />} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  )
}

export default App
