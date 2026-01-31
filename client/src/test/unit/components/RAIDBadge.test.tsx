import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  RAIDBadge,
  TypeBadge,
  StatusBadge,
  PriorityBadge,
} from '../../../components/raid/RAIDBadge';
import { RAIDType, RAIDStatus, RAIDPriority } from '../../../types/raid';

describe('RAIDBadge', () => {
  describe('Type badges', () => {
    it('should render risk badge with correct styling', () => {
      render(<RAIDBadge variant="type" value={RAIDType.RISK} />);
      const badge = screen.getByText('Risk');
      expect(badge).toHaveClass('raid-badge');
      expect(badge).toHaveClass('raid-badge-type');
      expect(badge).toHaveClass('raid-badge-type-risk');
    });

    it('should render assumption badge', () => {
      render(<RAIDBadge variant="type" value={RAIDType.ASSUMPTION} />);
      const badge = screen.getByText('Assumption');
      expect(badge).toHaveClass('raid-badge-type-assumption');
    });

    it('should render issue badge', () => {
      render(<RAIDBadge variant="type" value={RAIDType.ISSUE} />);
      const badge = screen.getByText('Issue');
      expect(badge).toHaveClass('raid-badge-type-issue');
    });

    it('should render dependency badge', () => {
      render(<RAIDBadge variant="type" value={RAIDType.DEPENDENCY} />);
      const badge = screen.getByText('Dependency');
      expect(badge).toHaveClass('raid-badge-type-dependency');
    });
  });

  describe('Status badges', () => {
    it('should render open status badge', () => {
      render(<RAIDBadge variant="status" value={RAIDStatus.OPEN} />);
      const badge = screen.getByText('Open');
      expect(badge).toHaveClass('raid-badge-status');
      expect(badge).toHaveClass('raid-badge-status-open');
    });

    it('should render in_progress status badge with formatted label', () => {
      render(<RAIDBadge variant="status" value={RAIDStatus.IN_PROGRESS} />);
      const badge = screen.getByText('In Progress');
      expect(badge).toHaveClass('raid-badge-status-in_progress');
    });

    it('should render mitigated status badge', () => {
      render(<RAIDBadge variant="status" value={RAIDStatus.MITIGATED} />);
      const badge = screen.getByText('Mitigated');
      expect(badge).toHaveClass('raid-badge-status-mitigated');
    });

    it('should render closed status badge', () => {
      render(<RAIDBadge variant="status" value={RAIDStatus.CLOSED} />);
      const badge = screen.getByText('Closed');
      expect(badge).toHaveClass('raid-badge-status-closed');
    });

    it('should render accepted status badge', () => {
      render(<RAIDBadge variant="status" value={RAIDStatus.ACCEPTED} />);
      const badge = screen.getByText('Accepted');
      expect(badge).toHaveClass('raid-badge-status-accepted');
    });
  });

  describe('Priority badges', () => {
    it('should render critical priority badge', () => {
      render(<RAIDBadge variant="priority" value={RAIDPriority.CRITICAL} />);
      const badge = screen.getByText('CRITICAL');
      expect(badge).toHaveClass('raid-badge-priority');
      expect(badge).toHaveClass('raid-badge-priority-critical');
    });

    it('should render high priority badge', () => {
      render(<RAIDBadge variant="priority" value={RAIDPriority.HIGH} />);
      const badge = screen.getByText('HIGH');
      expect(badge).toHaveClass('raid-badge-priority-high');
    });

    it('should render medium priority badge', () => {
      render(<RAIDBadge variant="priority" value={RAIDPriority.MEDIUM} />);
      const badge = screen.getByText('MEDIUM');
      expect(badge).toHaveClass('raid-badge-priority-medium');
    });

    it('should render low priority badge', () => {
      render(<RAIDBadge variant="priority" value={RAIDPriority.LOW} />);
      const badge = screen.getByText('LOW');
      expect(badge).toHaveClass('raid-badge-priority-low');
    });
  });

  describe('Size variants', () => {
    it('should render small badge', () => {
      render(
        <RAIDBadge variant="type" value={RAIDType.RISK} size="sm" />
      );
      const badge = screen.getByText('Risk');
      expect(badge).toHaveClass('raid-badge-sm');
    });

    it('should render medium badge by default', () => {
      render(<RAIDBadge variant="type" value={RAIDType.RISK} />);
      const badge = screen.getByText('Risk');
      expect(badge).toHaveClass('raid-badge-md');
    });

    it('should render large badge', () => {
      render(
        <RAIDBadge variant="type" value={RAIDType.RISK} size="lg" />
      );
      const badge = screen.getByText('Risk');
      expect(badge).toHaveClass('raid-badge-lg');
    });
  });

  describe('Custom className', () => {
    it('should apply custom className', () => {
      render(
        <RAIDBadge
          variant="type"
          value={RAIDType.RISK}
          className="custom-class"
        />
      );
      const badge = screen.getByText('Risk');
      expect(badge).toHaveClass('custom-class');
    });
  });

  describe('Convenience components', () => {
    it('should render TypeBadge', () => {
      render(<TypeBadge value={RAIDType.RISK} />);
      const badge = screen.getByText('Risk');
      expect(badge).toHaveClass('raid-badge-type');
    });

    it('should render StatusBadge', () => {
      render(<StatusBadge value={RAIDStatus.OPEN} />);
      const badge = screen.getByText('Open');
      expect(badge).toHaveClass('raid-badge-status');
    });

    it('should render PriorityBadge', () => {
      render(<PriorityBadge value={RAIDPriority.HIGH} />);
      const badge = screen.getByText('HIGH');
      expect(badge).toHaveClass('raid-badge-priority');
    });

    it('should pass size to TypeBadge', () => {
      render(<TypeBadge value={RAIDType.RISK} size="lg" />);
      const badge = screen.getByText('Risk');
      expect(badge).toHaveClass('raid-badge-lg');
    });

    it('should pass className to StatusBadge', () => {
      render(
        <StatusBadge value={RAIDStatus.OPEN} className="custom" />
      );
      const badge = screen.getByText('Open');
      expect(badge).toHaveClass('custom');
    });
  });

  describe('Label formatting', () => {
    it('should capitalize type labels', () => {
      render(<RAIDBadge variant="type" value={RAIDType.RISK} />);
      expect(screen.getByText('Risk')).toBeInTheDocument();
    });

    it('should format multi-word status labels', () => {
      render(<RAIDBadge variant="status" value={RAIDStatus.IN_PROGRESS} />);
      expect(screen.getByText('In Progress')).toBeInTheDocument();
    });

    it('should uppercase priority labels', () => {
      render(<RAIDBadge variant="priority" value={RAIDPriority.CRITICAL} />);
      expect(screen.getByText('CRITICAL')).toBeInTheDocument();
    });
  });
});
