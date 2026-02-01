/**
 * AuditViewer Component Tests
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AuditViewer } from '../AuditViewer';
import {
  AuditApiClient,
  type AuditResult,
} from '../../services/AuditApiClient';

// Mock the API client
vi.mock('../../services/AuditApiClient');

const mockAuditResult: AuditResult = {
  projectKey: 'TEST-001',
  timestamp: '2026-02-01T10:00:00Z',
  issues: [
    {
      id: '1',
      severity: 'error' as const,
      artifact: 'charter.md',
      field: 'title',
      message: 'Title is required',
      rule: 'required-field',
    },
    {
      id: '2',
      severity: 'warning' as const,
      artifact: 'scope.md',
      field: 'description',
      message: 'Description should be more detailed',
      rule: 'min-length',
    },
    {
      id: '3',
      severity: 'info' as const,
      artifact: 'risks.md',
      field: 'format',
      message: 'Consider using structured format',
      rule: 'format-hint',
    },
  ],
  summary: {
    errors: 1,
    warnings: 1,
    info: 1,
  },
};

describe('AuditViewer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    const mockGetAuditResults = vi
      .fn()
      .mockImplementation(() => new Promise(() => {}));

    vi.mocked(AuditApiClient).mockImplementation(
      () =>
        ({
          getAuditResults: mockGetAuditResults,
          runAudit: vi.fn(),
        }) as unknown as InstanceType<typeof AuditApiClient>,
    );

    render(<AuditViewer projectKey="TEST-001" />);

    expect(screen.getByText('Audit Results')).toBeInTheDocument();
  });

  it('fetches and displays audit results on mount', async () => {
    const mockGetAuditResults = vi.fn().mockResolvedValue(mockAuditResult);

    vi.mocked(AuditApiClient).mockImplementation(
      () =>
        ({
          getAuditResults: mockGetAuditResults,
          runAudit: vi.fn(),
        }) as unknown as InstanceType<typeof AuditApiClient>,
    );

    render(<AuditViewer projectKey="TEST-001" />);

    await waitFor(() => {
      expect(mockGetAuditResults).toHaveBeenCalledWith('TEST-001');
    });

    const counts = screen.getAllByText('1');
    expect(counts.length).toBeGreaterThanOrEqual(3); // Summary counts
    expect(screen.getByText('Errors')).toBeInTheDocument();
    expect(screen.getByText('charter.md')).toBeInTheDocument();
    expect(screen.getByText('Title is required')).toBeInTheDocument();
  });

  it('displays severity summary correctly', async () => {
    const mockGetAuditResults = vi.fn().mockResolvedValue(mockAuditResult);

    vi.mocked(AuditApiClient).mockImplementation(
      () =>
        ({
          getAuditResults: mockGetAuditResults,
          runAudit: vi.fn(),
        }) as unknown as InstanceType<typeof AuditApiClient>,
    );

    render(<AuditViewer projectKey="TEST-001" />);

    await waitFor(() => {
      const counts = screen.getAllByText('1');
      expect(counts.length).toBeGreaterThanOrEqual(3);
    });

    const summaryItems = screen.getAllByText(/1/);
    expect(summaryItems.length).toBeGreaterThanOrEqual(3);
  });

  it('filters issues by severity', async () => {
    const mockGetAuditResults = vi.fn().mockResolvedValue(mockAuditResult);

    vi.mocked(AuditApiClient).mockImplementation(
      () =>
        ({
          getAuditResults: mockGetAuditResults,
          runAudit: vi.fn(),
        }) as unknown as InstanceType<typeof AuditApiClient>,
    );

    render(<AuditViewer projectKey="TEST-001" />);

    await waitFor(() => {
      expect(screen.getByText('charter.md')).toBeInTheDocument();
    });

    // Initially shows all issues
    expect(screen.getByText('charter.md')).toBeInTheDocument();
    expect(screen.getByText('scope.md')).toBeInTheDocument();
    expect(screen.getByText('risks.md')).toBeInTheDocument();

    // Filter by errors only
    const errorButtons = screen.getAllByText(/Errors/);
    fireEvent.click(errorButtons[1]); // Click filter button (not summary)

    await waitFor(() => {
      expect(screen.getByText('charter.md')).toBeInTheDocument();
      expect(screen.queryByText('scope.md')).not.toBeInTheDocument();
      expect(screen.queryByText('risks.md')).not.toBeInTheDocument();
    });
  });

  it('triggers audit run when button clicked', async () => {
    const mockGetAuditResults = vi.fn().mockResolvedValue(mockAuditResult);
    const mockRunAudit = vi.fn().mockResolvedValue(mockAuditResult);

    vi.mocked(AuditApiClient).mockImplementation(
      () =>
        ({
          getAuditResults: mockGetAuditResults,
          runAudit: mockRunAudit,
        }) as unknown as InstanceType<typeof AuditApiClient>,
    );

    render(<AuditViewer projectKey="TEST-001" />);

    await waitFor(() => {
      expect(screen.getByText('Run Audit')).toBeInTheDocument();
    });

    const runButton = screen.getByText('Run Audit');
    fireEvent.click(runButton);

    await waitFor(() => {
      expect(mockRunAudit).toHaveBeenCalledWith('TEST-001');
    });
  });

  it('displays empty state when no issues', async () => {
    const emptyResult = {
      ...mockAuditResult,
      issues: [],
      summary: { errors: 0, warnings: 0, info: 0 },
    };
    const mockGetAuditResults = vi.fn().mockResolvedValue(emptyResult);

    vi.mocked(AuditApiClient).mockImplementation(
      () =>
        ({
          getAuditResults: mockGetAuditResults,
          runAudit: vi.fn(),
        }) as unknown as InstanceType<typeof AuditApiClient>,
    );

    render(<AuditViewer projectKey="TEST-001" />);

    await waitFor(() => {
      expect(
        screen.getByText('No issues found. Great work!'),
      ).toBeInTheDocument();
    });
  });

  it('displays error message on API failure', async () => {
    const mockGetAuditResults = vi
      .fn()
      .mockRejectedValue(new Error('API Error'));

    vi.mocked(AuditApiClient).mockImplementation(
      () =>
        ({
          getAuditResults: mockGetAuditResults,
          runAudit: vi.fn(),
        }) as unknown as InstanceType<typeof AuditApiClient>,
    );

    render(<AuditViewer projectKey="TEST-001" />);

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
  });

  it('creates correct fix links for issues', async () => {
    const mockGetAuditResults = vi.fn().mockResolvedValue(mockAuditResult);

    vi.mocked(AuditApiClient).mockImplementation(
      () =>
        ({
          getAuditResults: mockGetAuditResults,
          runAudit: vi.fn(),
        }) as unknown as InstanceType<typeof AuditApiClient>,
    );

    render(<AuditViewer projectKey="TEST-001" />);

    await waitFor(() => {
      expect(screen.getByText('charter.md')).toBeInTheDocument();
    });

    const fixLinks = screen.getAllByText('Fix');
    expect(fixLinks[0]).toHaveAttribute(
      'href',
      '/projects/TEST-001/artifacts/charter.md?field=title',
    );
  });

  it('formats timestamp correctly', async () => {
    const recentTime = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(); // 2 hours ago
    const recentResult = { ...mockAuditResult, timestamp: recentTime };
    const mockGetAuditResults = vi.fn().mockResolvedValue(recentResult);

    vi.mocked(AuditApiClient).mockImplementation(
      () =>
        ({
          getAuditResults: mockGetAuditResults,
          runAudit: vi.fn(),
        }) as unknown as InstanceType<typeof AuditApiClient>,
    );

    render(<AuditViewer projectKey="TEST-001" />);

    await waitFor(() => {
      expect(screen.getByText(/Last audit:/)).toBeInTheDocument();
    });

    expect(screen.getByText(/2 hours ago/)).toBeInTheDocument();
  });

  it('disables run button while loading', async () => {
    const mockGetAuditResults = vi.fn().mockResolvedValue(mockAuditResult);
    const mockRunAudit = vi
      .fn()
      .mockImplementation(() => new Promise(() => {}));

    vi.mocked(AuditApiClient).mockImplementation(
      () =>
        ({
          getAuditResults: mockGetAuditResults,
          runAudit: mockRunAudit,
        }) as unknown as InstanceType<typeof AuditApiClient>,
    );

    render(<AuditViewer projectKey="TEST-001" />);

    await waitFor(() => {
      expect(screen.getByText('Run Audit')).toBeInTheDocument();
    });

    const runButton = screen.getByText('Run Audit');
    fireEvent.click(runButton);

    await waitFor(() => {
      expect(screen.getByText('Running...')).toBeDisabled();
    });
  });
});
