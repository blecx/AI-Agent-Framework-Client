import { createContext, useContext, useState, ReactNode } from 'react';

const STORAGE_KEY = 'ai-agent-framework:current-project';

interface ProjectContextType {
  currentProjectKey: string | null;
  setCurrentProjectKey: (key: string | null) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  // Initialize from localStorage
  const [currentProjectKey, setCurrentProjectKeyState] = useState<
    string | null
  >(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? stored : null;
    } catch (error) {
      console.warn('Failed to load project from localStorage:', error);
      return null;
    }
  });

  // Persist to localStorage when project changes
  const setCurrentProjectKey = (key: string | null) => {
    setCurrentProjectKeyState(key);
    try {
      if (key) {
        localStorage.setItem(STORAGE_KEY, key);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.warn('Failed to save project to localStorage:', error);
    }
  };

  return (
    <ProjectContext.Provider
      value={{ currentProjectKey, setCurrentProjectKey }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within ProjectProvider');
  }
  return context;
}
