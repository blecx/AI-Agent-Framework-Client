/**
 * ArtifactBrowser Component
 * Displays project artifacts in a browsable tree structure
 */

import React, { useState, useEffect } from 'react';
import './ArtifactBrowser.css';

interface ArtifactFile {
  path: string;
  name: string;
  type: 'file' | 'directory';
  children?: ArtifactFile[];
}

interface ArtifactBrowserProps {
  projectKey: string;
}

export const ArtifactBrowser: React.FC<ArtifactBrowserProps> = ({
  projectKey,
}) => {
  const [artifacts, setArtifacts] = useState<ArtifactFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadArtifacts();
  }, [projectKey]);

  const loadArtifacts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/v1/projects/${projectKey}/artifacts`);
      if (!response.ok) {
        throw new Error('Failed to load artifacts');
      }
      const data = await response.json();
      
      // Convert flat list to tree structure
      const tree = buildArtifactTree(data.artifacts || []);
      setArtifacts(tree);
    } catch (err: any) {
      console.error('Failed to load artifacts:', err);
      setError(err.message);
      // Show demo structure if API fails
      setArtifacts([
        {
          path: 'documents',
          name: 'documents',
          type: 'directory',
          children: [
            { path: 'documents/charter.md', name: 'charter.md', type: 'file' },
            { path: 'documents/plan.md', name: 'plan.md', type: 'file' },
          ],
        },
        {
          path: 'artifacts',
          name: 'artifacts',
          type: 'directory',
          children: [
            { path: 'artifacts/wbs.md', name: 'wbs.md', type: 'file' },
          ],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const buildArtifactTree = (files: any[]): ArtifactFile[] => {
    const tree: ArtifactFile[] = [];
    const pathMap: Map<string, ArtifactFile> = new Map();

    files.forEach((file: any) => {
      const parts = file.path.split('/');
      const fileName = parts[parts.length - 1];
      
      const artifact: ArtifactFile = {
        path: file.path,
        name: fileName,
        type: file.type || 'file',
        children: file.type === 'directory' ? [] : undefined,
      };

      pathMap.set(file.path, artifact);

      if (parts.length === 1) {
        tree.push(artifact);
      } else {
        const parentPath = parts.slice(0, -1).join('/');
        const parent = pathMap.get(parentPath);
        if (parent && parent.children) {
          parent.children.push(artifact);
        } else {
          tree.push(artifact);
        }
      }
    });

    return tree;
  };

  const handleFileClick = async (artifact: ArtifactFile) => {
    if (artifact.type === 'file') {
      setSelectedFile(artifact.path);
      setLoading(true);
      try {
        const response = await fetch(
          `/api/v1/projects/${projectKey}/artifacts/${encodeURIComponent(artifact.path)}`,
        );
        if (!response.ok) {
          throw new Error('Failed to load file content');
        }
        const data = await response.json();
        setFileContent(data.content || 'No content available');
      } catch (err: any) {
        console.error('Failed to load file:', err);
        setFileContent(`# ${artifact.name}\n\n(Content preview not available)`);
      } finally {
        setLoading(false);
      }
    }
  };

  const renderArtifactTree = (items: ArtifactFile[], level = 0) => {
    return (
      <ul className={`artifact-tree level-${level}`}>
        {items.map((item) => (
          <li key={item.path} className="artifact-item">
            <div
              className={`artifact-node ${item.type} ${selectedFile === item.path ? 'selected' : ''}`}
              onClick={() => handleFileClick(item)}
              style={{ paddingLeft: `${level * 20 + 8}px` }}
            >
              <span className="artifact-icon">
                {item.type === 'directory' ? '📁' : '📄'}
              </span>
              <span className="artifact-name">{item.name}</span>
            </div>
            {item.children && item.children.length > 0 && (
              renderArtifactTree(item.children, level + 1)
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="artifact-browser">
      <div className="artifact-sidebar">
        <h3>Project Artifacts</h3>
        {loading && !artifacts.length && <p>Loading artifacts...</p>}
        {error && <p className="error-message">Error: {error}</p>}
        {artifacts.length > 0 ? (
          renderArtifactTree(artifacts)
        ) : (
          !loading && <p className="empty-state">No artifacts yet</p>
        )}
      </div>
      {selectedFile && (
        <div className="artifact-viewer">
          <div className="viewer-header">
            <h4>{selectedFile}</h4>
            <button onClick={() => setSelectedFile(null)}>Close</button>
          </div>
          <div className="viewer-content">
            {loading ? (
              <p>Loading...</p>
            ) : (
              <pre>{fileContent}</pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
