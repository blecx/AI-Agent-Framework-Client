import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiClient from '../services/apiClient';
import './ProposePanel.css';

interface ProposalFormData {
  title: string;
  description: string;
  changes: string;
  files?: string[];
}

function ProposePanel() {
  const { projectKey } = useParams<{ projectKey: string }>();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState({
    title: '',
    description: '',
    changes: '',
  });
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ProposalFormData | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProposal(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(selectedFiles);
  };

  const handlePreview = () => {
    setPreview({
      ...proposal,
      files: files.map(f => f.name),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const changes = {
        ...proposal,
        files: files.map(f => ({
          name: f.name,
          size: f.size,
          type: f.type,
        })),
      };
      
      await apiClient.propose(projectKey!, changes);
      navigate(`/projects/${projectKey}`);
    } catch (err) {
      setError((err as Error).message || 'Failed to submit proposal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="propose-panel">
      <div className="breadcrumb">
        <Link to="/">Projects</Link>
        <span className="separator">/</span>
        <Link to={`/projects/${projectKey}`}>{projectKey}</Link>
        <span className="separator">/</span>
        <span>Propose Changes</span>
      </div>

      <h1>Propose Document Changes</h1>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="propose-form">
        <div className="form-group">
          <label htmlFor="title">Proposal Title *</label>
          <input
            id="title"
            name="title"
            type="text"
            value={proposal.title}
            onChange={handleInputChange}
            required
            placeholder="Brief title for this proposal"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={proposal.description}
            onChange={handleInputChange}
            required
            placeholder="Detailed description of the proposed changes"
            rows={4}
          />
        </div>

        <div className="form-group">
          <label htmlFor="changes">Proposed Changes *</label>
          <textarea
            id="changes"
            name="changes"
            value={proposal.changes}
            onChange={handleInputChange}
            required
            placeholder="Describe the specific changes to be made..."
            rows={6}
          />
        </div>

        <div className="form-group">
          <label htmlFor="files">Upload Files (optional)</label>
          <input
            id="files"
            type="file"
            onChange={handleFileChange}
            multiple
            accept=".txt,.md,.json,.yaml,.yml"
          />
          {files.length > 0 && (
            <div className="file-list">
              <p>Selected files:</p>
              <ul>
                {files.map((file, index) => (
                  <li key={index}>
                    {file.name} ({(file.size / 1024).toFixed(2)} KB)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={handlePreview}
          >
            Preview
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Proposal'}
          </button>
          <Link 
            to={`/projects/${projectKey}`}
            className="btn btn-outline"
          >
            Cancel
          </Link>
        </div>
      </form>

      {preview && (
        <div className="preview-panel">
          <h2>Preview</h2>
          <div className="preview-content">
            <div className="preview-item">
              <strong>Title:</strong> {preview.title}
            </div>
            <div className="preview-item">
              <strong>Description:</strong> {preview.description}
            </div>
            <div className="preview-item">
              <strong>Changes:</strong>
              <pre>{preview.changes}</pre>
            </div>
            {preview.files && preview.files.length > 0 && (
              <div className="preview-item">
                <strong>Files:</strong>
                <ul>
                  {preview.files.map((file, index) => (
                    <li key={index}>{file}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProposePanel;
