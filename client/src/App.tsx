import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import ProjectList from './components/ProjectList'
import ProjectView from './components/ProjectView'
import ProposePanel from './components/ProposePanel'
import ApplyPanel from './components/ApplyPanel'
import CommandPanel from './components/CommandPanel'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="main-nav">
          <div className="nav-content">
            <Link to="/" className="nav-logo">
              <h1>AI Agent Framework</h1>
            </Link>
            <div className="nav-links">
              <Link to="/" className="nav-link">Projects</Link>
              <Link to="/commands" className="nav-link">Commands</Link>
            </div>
          </div>
        </nav>
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<ProjectList />} />
            <Route path="/projects/:projectKey" element={<ProjectView />} />
            <Route path="/projects/:projectKey/propose" element={<ProposePanel />} />
            <Route path="/projects/:projectKey/apply" element={<ApplyPanel />} />
            <Route path="/commands" element={<CommandPanel />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
