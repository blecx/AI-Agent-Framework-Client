/**
 * ProposalCreator Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProposalCreator } from '../ProposalCreator';
import { artifactApiClient } from '../../services/ArtifactApiClient';
import { proposalApiClient } from '../../services/ProposalApiClient';

vi.mock('../../services/ArtifactApiClient', () => ({
  artifactApiClient: {
    getArtifact: vi.fn(),
  },
}));

vi.mock('../../services/ProposalApiClient', () => ({
  proposalApiClient: {
    createProposal: vi.fn(),
  },
}));

describe('ProposalCreator', () => {
  const mockProjectKey = 'TEST-001';
  const mockArtifactPath = 'artifacts/test.md';
  const mockOriginalContent = '# Original Content\nLine 1\nLine 2';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads artifact content on mount', async () => {
    vi.mocked(artifactApiClient.getArtifact).mockResolvedValue(mockOriginalContent);

    render(
      <ProposalCreator
        projectKey={mockProjectKey}
        artifactPath={mockArtifactPath}
      />
    );

    expect(screen.getByText('Loading artifact...')).toBeInTheDocument();

    await waitFor(() => {
      expect(artifactApiClient.getArtifact).toHaveBeenCalledWith(
        mockProjectKey,
        mockArtifactPath
      );
    });

    await waitFor(() => {
      const textarea = screen.getByLabelText(/Edit Content/i) as HTMLTextAreaElement;
      expect(textarea.value).toBe(mockOriginalContent);
    });
  });

  it('allows editing content', async () => {
    vi.mocked(artifactApiClient.getArtifact).mockResolvedValue(mockOriginalContent);
    const user = userEvent.setup();

    render(
      <ProposalCreator
        projectKey={mockProjectKey}
        artifactPath={mockArtifactPath}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading artifact...')).not.toBeInTheDocument();
    });

    const textarea = screen.getByLabelText(/Edit Content/i) as HTMLTextAreaElement;
    await user.clear(textarea);
    await user.type(textarea, 'New content');

    expect(textarea.value).toBe('New content');
  });

  it('shows diff preview when content changes', async () => {
    vi.mocked(artifactApiClient.getArtifact).mockResolvedValue(mockOriginalContent);
    const user = userEvent.setup();

    render(
      <ProposalCreator
        projectKey={mockProjectKey}
        artifactPath={mockArtifactPath}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading artifact...')).not.toBeInTheDocument();
    });

    const textarea = screen.getByLabelText(/Edit Content/i);
    await user.type(textarea, '\nNew line');

    expect(screen.getByText('Preview Changes')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Show Diff/i })).toBeInTheDocument();
  });

  it('requires rationale to create proposal', async () => {
    vi.mocked(artifactApiClient.getArtifact).mockResolvedValue(mockOriginalContent);
    const user = userEvent.setup();

    render(
      <ProposalCreator
        projectKey={mockProjectKey}
        artifactPath={mockArtifactPath}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading artifact...')).not.toBeInTheDocument();
    });

    const textarea = screen.getByLabelText(/Edit Content/i);
    await user.type(textarea, '\nModified');

    const submitButton = screen.getByRole('button', { name: /Create Proposal/i });
    expect(submitButton).toBeDisabled();

    const rationaleTextarea = screen.getByLabelText(/Rationale/i);
    await user.type(rationaleTextarea, 'Test rationale');

    expect(submitButton).not.toBeDisabled();
  });

  it('creates proposal with correct data', async () => {
    vi.mocked(artifactApiClient.getArtifact).mockResolvedValue(mockOriginalContent);
    vi.mocked(proposalApiClient.createProposal).mockResolvedValue({
      id: 'prop-123',
      project_key: mockProjectKey,
      target_artifact: mockArtifactPath,
      change_type: 'update',
      diff: '--- a/test.md\n+++ b/test.md\n...',
      rationale: 'Test rationale',
      status: 'pending',
      author: 'system',
      created_at: new Date().toISOString(),
    });

    const mockOnComplete = vi.fn();
    const user = userEvent.setup();

    render(
      <ProposalCreator
        projectKey={mockProjectKey}
        artifactPath={mockArtifactPath}
        onComplete={mockOnComplete}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading artifact...')).not.toBeInTheDocument();
    });

    const contentTextarea = screen.getByLabelText(/Edit Content/i);
    await user.clear(contentTextarea);
    await user.type(contentTextarea, 'Modified content');

    const rationaleTextarea = screen.getByLabelText(/Rationale/i);
    await user.type(rationaleTextarea, 'Test rationale');

    const submitButton = screen.getByRole('button', { name: /Create Proposal/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(proposalApiClient.createProposal).toHaveBeenCalledWith(
        mockProjectKey,
        expect.objectContaining({
          target_artifact: mockArtifactPath,
          change_type: 'update',
          rationale: 'Test rationale',
          author: 'system',
        })
      );
    });

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalled();
    });
  });

  it('shows error when no changes detected', async () => {
    vi.mocked(artifactApiClient.getArtifact).mockResolvedValue(mockOriginalContent);
    const user = userEvent.setup();

    render(
      <ProposalCreator
        projectKey={mockProjectKey}
        artifactPath={mockArtifactPath}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading artifact...')).not.toBeInTheDocument();
    });

    const rationaleTextarea = screen.getByLabelText(/Rationale/i);
    await user.type(rationaleTextarea, 'Test rationale');

    const submitButton = screen.getByRole('button', { name: /Create Proposal/i });
    expect(submitButton).toBeDisabled();
  });

  it('calls onCancel when cancel button clicked', async () => {
    vi.mocked(artifactApiClient.getArtifact).mockResolvedValue(mockOriginalContent);
    const mockOnCancel = vi.fn();
    const user = userEvent.setup();

    render(
      <ProposalCreator
        projectKey={mockProjectKey}
        artifactPath={mockArtifactPath}
        onCancel={mockOnCancel}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading artifact...')).not.toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('handles artifact load error', async () => {
    vi.mocked(artifactApiClient.getArtifact).mockRejectedValue(
      new Error('Network error')
    );

    render(
      <ProposalCreator
        projectKey={mockProjectKey}
        artifactPath={mockArtifactPath}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Failed to load artifact/i)).toBeInTheDocument();
    });
  });

  it('handles 404 error as create mode', async () => {
    const error404 = new Error('404');
    vi.mocked(artifactApiClient.getArtifact).mockRejectedValue(error404);

    render(
      <ProposalCreator
        projectKey={mockProjectKey}
        artifactPath={mockArtifactPath}
      />
    );

    await waitFor(() => {
      const textarea = screen.getByLabelText(/Edit Content/i) as HTMLTextAreaElement;
      expect(textarea.value).toBe('');
    });
  });
});
