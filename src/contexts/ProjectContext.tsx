import { createContext, useContext, useState, ReactNode } from 'react';

interface ProjectContextType {
  currentProjectKey: string | null;
  setCurrentProjectKey: (key: string | null) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [currentProjectKey, setCurrentProjectKey] = useState<string | null>(
    null,
  );

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
