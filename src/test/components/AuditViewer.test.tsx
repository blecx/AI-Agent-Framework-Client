/**
 * AuditViewer Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuditViewer } from '../../components/AuditViewer';
import { AuditService } from '../../services/api/audit';
import { AuditResult, AuditSeverity } from '../../types/api';

// Mock the audit service
vi.mock('../../services/api/audit');

const mockAuditResult: AuditResult = {
  issues: [
    {
      rule: 'cross_reference',
      severity: AuditSeverity.ERROR,
      message: 'RAID item R-001 references non-existent deliverable D-999',
      artifact: 'artifacts/raid.json',
      item_id: 'R-001',
    },
    {
      rule: 'required_fields',
      severity: AuditSeverity.WARNING,
      message: 'Missing required field: owner',
      artifact: 'artifacts/pmp.json',
      field: 'owner',
    },
    {
      rule: 'date_consistency',
      severity: AuditSeverity.INFO,
      message: 'Milestone M-001 date is close to project end date',
      artifact: 'artifacts/milestones.json',
      item_id: 'M-001',
    },
  ],
  total_issues: 3,
  completeness_score: 0.85,
  rule_violations: {
    cross_reference: 1,
    required_fields: 1,
    date_consistency: 1,
  },
  timestamp: '2026-02-02T10:00:00Z',
};

describe('AuditViewer', () => {
  let mockGetAuditResults: ReturnType<typeof vi.fn>;
  let mockRunAudit: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock functions
    mockGetAuditResults = vi.fn().mockResolvedValue([mockAuditResult]);
    mockRunAudit = vi.fn().mockResolvedValue(mockAuditResult);

    // Mock the AuditService constructor and methods
    vi.mocked(AuditService).mockImplementation(() => ({
      getAuditResults: mockGetAuditResults,
      runAudit: mockRunAudit,
    } as any));
  });

  it('renders and loads audit results on mount', async () => {
    render(<AuditViewer projectKey="TEST-001" />);

    await waitFor(() => {
      expect(mockGetAuditResults).toHaveBeenCalledWith('TEST-001', 1);
    });

    expect(screen.getByText('Audit Results')).toBeInTheDocument();
    expect(screen.getByText('Total Issues:')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('displays completeness score', async () => {
    render(<AuditViewer projectKey="TEST-001" />);

    await waitFor(() => {
      expect(screen.getByText('85.0%')).toBeInTheDocument();
    });
  });

  it('displays all issues by default', async () => {
    render(<AuditViewer projectKey="TEST-001" />);

    await waitFor(() => {
      expect(screen.getByText(/RAID item R-001 references/)).toBeInTheDocument();
    });

    expect(screen.getByText(/Missing required field/)).toBeInTheDocument();
    expect(screen.getByText(/Milestone M-001 date is close/)).toBeInTheDocument();
  });

  it('filters issues by severity', async () => {
    const user = userEvent.setup();
    render(<AuditViewer projectKey="TEST-001" />);

    await waitFor(() => {
      expect(screen.getByText(/RAID item R-001/)).toBeInTheDocument();
    });

    // Click error filter
    const errorButton = screen.getAllByText(/Errors/)[0];
    await user.click(errorButton);

    // Should only show error
    expect(screen.getByText(/RAID item R-001/)).toBeInTheDocument();
    expect(screen.queryByText(/Missing required field/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Milestone M-001/)).not.toBeInTheDocument();
  });

  it('shows severity counts in filter buttons', async () => {
    render(<AuditViewer projectKey="TEST-001" />);

    await waitFor(() => {
      expect(screen.getByText('All (3)')).toBeInTheDocument();
    });

    expect(screen.getByText(/Errors \(1\)/)).toBeInTheDocument();
    expect(screen.getByText(/Warnings \(1\)/)).toBeInTheDocument();
    expect(screen.getByText(/Info \(1\)/)).toBeInTheDocument();
  });

  it('runs audit when button clicked', async () => {
    const user = userEvent.setup();
    render(<AuditViewer projectKey="TEST-001" />);

    await waitFor(() => {
      expect(screen.getByText('Run Audit')).toBeInTheDocument();
    });

    const runButton = screen.getByText('Run Audit');
    await user.click(runButton);

    await waitFor(() => {
      expect(mockRunAudit).toHaveBeenCalledWith('TEST-001');
    });
  });

  it('shows empty state when no issues', async () => {
    mockGetAuditResults.mockResolvedValueOnce([
      {
        ...mockAuditResult,
        issues: [],
        total_issues: 0,
      },
    ]);

    render(<AuditViewer projectKey="TEST-001" />);

    await waitFor(() => {
      expect(screen.getByText(/No issues found/)).toBeInTheDocument();
    });
  });

  it('displays error message on API failure', async () => {
    mockGetAuditResults.mockRejectedValueOnce(new Error('API Error'));

    render(<AuditViewer projectKey="TEST-001" />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load audit results/)).toBeInTheDocument();
    });
  });

  it('generates correct artifact links', async () => {
    render(<AuditViewer projectKey="TEST-001" />);

    await waitFor(() => {
      const fixLinks = screen.getAllByText('Fix →');
      expect(fixLinks).toHaveLength(3);
    });

    const links = screen.getAllByText('Fix →') as HTMLAnchorElement[];

    // Check link with item_id only
    expect(links[0].href).toContain('/projects/TEST-001/artifacts/artifacts/raid.json');

    // Check link with field
    expect(links[1].href).toContain('/projects/TEST-001/artifacts/artifacts/pmp.json?field=owner');

    // Check link with item_id
    expect(links[2].href).toContain('/projects/TEST-001/artifacts/artifacts/milestones.json');
  });

  it('displays severity badges with correct styling', async () => {
    render(<AuditViewer projectKey="TEST-001" />);

    await waitFor(() => {
      const badges = screen.getAllByText(/error|warning|info/i);
      expect(badges.length).toBeGreaterThan(0);
    });

    const errorBadge = screen.getAllByText('error')[0];
    expect(errorBadge).toHaveClass('severity-badge', 'severity-error');
  });

  it('shows last audit timestamp', async () => {
    render(<AuditViewer projectKey="TEST-001" />);

    await waitFor(() => {
      expect(screen.getByText('Last Run:')).toBeInTheDocument();
    });

    // Should display formatted date
    expect(screen.getByText(/2\/2\/2026/)).toBeInTheDocument();
  });
});
