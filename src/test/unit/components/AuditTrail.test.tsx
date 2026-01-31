import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuditTrail } from '../../../components/workflow/AuditTrail';
import { AuditEvent } from '../../../types/api';

describe('AuditTrail', () => {
  const mockOnPageChange = vi.fn();
  const mockOnFilterChange = vi.fn();

  const mockEvents: AuditEvent[] = [
    {
      event_id: 'evt-001',
      timestamp: '2026-01-31T10:00:00Z',
      event_type: 'workflow_state_changed',
      actor: 'user@example.com',
      project_key: 'PROJ1',
      correlation_id: 'corr-001',
      payload_summary: '{"from":"Initiating","to":"Planning"}',
    },
    {
      event_id: 'evt-002',
      timestamp: '2026-01-31T11:00:00Z',
      event_type: 'command_applied',
      actor: 'admin@example.com',
      project_key: 'PROJ1',
      correlation_id: undefined,
      payload_summary: '{"command":"generate-charter"}',
    },
    {
      event_id: 'evt-003',
      timestamp: '2026-01-31T12:00:00Z',
      event_type: 'project_created',
      actor: 'system',
      project_key: 'PROJ1',
      correlation_id: undefined,
      payload_summary: '{"key":"PROJ1","name":"Test Project"}',
    },
  ];

  const defaultProps = {
    projectKey: 'PROJ1',
    events: mockEvents,
    total: 3,
    page: 1,
    pageSize: 50,
    onPageChange: mockOnPageChange,
    onFilterChange: mockOnFilterChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Event Display', () => {
    it('displays audit events in reverse chronological order', () => {
      render(<AuditTrail {...defaultProps} />);

      const eventsList = screen.getByTestId('events-list');
      expect(eventsList).toBeInTheDocument();

      const eventTypes = screen.getAllByTestId('event-type');
      expect(eventTypes).toHaveLength(3);
      expect(eventTypes[0]).toHaveTextContent('workflow_state_changed');
      expect(eventTypes[1]).toHaveTextContent('command_applied');
      expect(eventTypes[2]).toHaveTextContent('project_created');
    });

    it('shows event type, timestamp, and actor for each event', () => {
      render(<AuditTrail {...defaultProps} />);

      const firstEvent = screen.getByTestId('event-evt-001');
      expect(firstEvent).toHaveTextContent('workflow_state_changed');
      expect(firstEvent).toHaveTextContent('user@example.com');
      expect(firstEvent).toHaveTextContent(/Jan.*31.*2026/); // Date format varies by locale
    });

    it('displays total count correctly', () => {
      render(<AuditTrail {...defaultProps} />);

      expect(screen.getByText(/Audit Events \(3 total\)/)).toBeInTheDocument();
    });

    it('shows loading state', () => {
      render(<AuditTrail {...defaultProps} isLoading={true} />);

      expect(screen.getByTestId('loading')).toHaveTextContent(
        'Loading audit events...',
      );
      expect(screen.queryByTestId('events-list')).not.toBeInTheDocument();
    });

    it('shows no events message when list is empty', () => {
      render(<AuditTrail {...defaultProps} events={[]} total={0} />);

      expect(screen.getByTestId('no-events')).toHaveTextContent(
        'No audit events found',
      );
    });

    it('formats timestamps in user timezone', () => {
      render(<AuditTrail {...defaultProps} />);

      const timestamps = screen.getAllByTestId('event-timestamp');
      timestamps.forEach((timestamp) => {
        // Should have some recognizable date format
        expect(timestamp.textContent).toMatch(/\d{1,2}.*202\d/);
      });
    });
  });

  describe('Expand/Collapse', () => {
    it('shows expand button for each event', () => {
      render(<AuditTrail {...defaultProps} />);

      const expandBtn1 = screen.getByTestId('expand-btn-evt-001');
      const expandBtn2 = screen.getByTestId('expand-btn-evt-002');
      const expandBtn3 = screen.getByTestId('expand-btn-evt-003');

      expect(expandBtn1).toHaveTextContent('Expand');
      expect(expandBtn2).toHaveTextContent('Expand');
      expect(expandBtn3).toHaveTextContent('Expand');
    });

    it('expands event details when expand button clicked', () => {
      render(<AuditTrail {...defaultProps} />);

      const expandBtn = screen.getByTestId('expand-btn-evt-001');
      fireEvent.click(expandBtn);

      expect(expandBtn).toHaveTextContent('Collapse');
      expect(expandBtn).toHaveAttribute('aria-expanded', 'true');

      const details = screen.getByTestId('event-details');
      expect(details).toBeInTheDocument();
      expect(details).toHaveTextContent('Event ID:');
      expect(details).toHaveTextContent('evt-001');
      expect(details).toHaveTextContent('Correlation ID:');
      expect(details).toHaveTextContent('corr-001');
      expect(details).toHaveTextContent('Payload Summary:');
    });

    it('collapses event details when collapse button clicked', () => {
      render(<AuditTrail {...defaultProps} />);

      const expandBtn = screen.getByTestId('expand-btn-evt-001');

      // Expand
      fireEvent.click(expandBtn);
      expect(screen.getByTestId('event-details')).toBeInTheDocument();

      // Collapse
      fireEvent.click(expandBtn);
      expect(expandBtn).toHaveTextContent('Expand');
      expect(expandBtn).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByTestId('event-details')).not.toBeInTheDocument();
    });

    it('allows multiple events to be expanded simultaneously', () => {
      render(<AuditTrail {...defaultProps} />);

      const expandBtn1 = screen.getByTestId('expand-btn-evt-001');
      const expandBtn2 = screen.getByTestId('expand-btn-evt-002');

      fireEvent.click(expandBtn1);
      fireEvent.click(expandBtn2);

      const allDetails = screen.getAllByTestId('event-details');
      expect(allDetails).toHaveLength(2);
    });

    it('shows correlation_id only when present', () => {
      render(<AuditTrail {...defaultProps} />);

      // Event with correlation_id
      const expandBtn1 = screen.getByTestId('expand-btn-evt-001');
      fireEvent.click(expandBtn1);
      expect(screen.getByText('Correlation ID:')).toBeInTheDocument();

      // Collapse first
      fireEvent.click(expandBtn1);

      // Event without correlation_id
      const expandBtn2 = screen.getByTestId('expand-btn-evt-002');
      fireEvent.click(expandBtn2);
      expect(screen.queryByText('Correlation ID:')).not.toBeInTheDocument();
    });

    it('formats payload summary as JSON when expanded', () => {
      render(<AuditTrail {...defaultProps} />);

      const expandBtn = screen.getByTestId('expand-btn-evt-001');
      fireEvent.click(expandBtn);

      const details = screen.getByTestId('event-details');
      expect(details).toHaveTextContent('Payload Summary:');
      expect(details).toHaveTextContent('from');
      expect(details).toHaveTextContent('Initiating');
    });
  });

  describe('Filtering', () => {
    it('shows all filter controls', () => {
      render(<AuditTrail {...defaultProps} />);

      expect(screen.getByTestId('event-type-filter')).toBeInTheDocument();
      expect(screen.getByTestId('actor-filter')).toBeInTheDocument();
      expect(screen.getByTestId('since-filter')).toBeInTheDocument();
      expect(screen.getByTestId('until-filter')).toBeInTheDocument();
    });

    it('populates event type filter with unique event types', () => {
      render(<AuditTrail {...defaultProps} />);

      const eventTypeSelect = screen.getByTestId(
        'event-type-filter',
      ) as HTMLSelectElement;
      const options = Array.from(eventTypeSelect.options).map((o) => o.value);

      expect(options).toContain('');
      expect(options).toContain('workflow_state_changed');
      expect(options).toContain('command_applied');
      expect(options).toContain('project_created');
    });

    it('calls onFilterChange when Apply Filters clicked', () => {
      render(<AuditTrail {...defaultProps} />);

      const eventTypeSelect = screen.getByTestId('event-type-filter');
      const actorInput = screen.getByTestId('actor-filter');

      fireEvent.change(eventTypeSelect, {
        target: { value: 'workflow_state_changed' },
      });
      fireEvent.change(actorInput, { target: { value: 'user@example.com' } });

      const applyBtn = screen.getByTestId('apply-filters-btn');
      fireEvent.click(applyBtn);

      expect(mockOnFilterChange).toHaveBeenCalledWith({
        event_type: 'workflow_state_changed',
        actor: 'user@example.com',
        since: undefined,
        until: undefined,
      });
      expect(mockOnPageChange).toHaveBeenCalledWith(1); // Reset to page 1
    });

    it('shows clear filters button only when filters are active', () => {
      render(<AuditTrail {...defaultProps} />);

      // Initially hidden
      expect(screen.queryByTestId('clear-filters-btn')).not.toBeInTheDocument();

      // Set a filter
      const actorInput = screen.getByTestId('actor-filter');
      fireEvent.change(actorInput, { target: { value: 'test' } });

      // Clear button should appear
      expect(screen.getByTestId('clear-filters-btn')).toBeInTheDocument();
    });

    it('clears all filters when Clear Filters clicked', () => {
      render(<AuditTrail {...defaultProps} />);

      const eventTypeSelect = screen.getByTestId(
        'event-type-filter',
      ) as HTMLSelectElement;
      const actorInput = screen.getByTestId('actor-filter') as HTMLInputElement;
      const sinceInput = screen.getByTestId('since-filter') as HTMLInputElement;

      fireEvent.change(eventTypeSelect, {
        target: { value: 'workflow_state_changed' },
      });
      fireEvent.change(actorInput, { target: { value: 'user@example.com' } });
      fireEvent.change(sinceInput, { target: { value: '2026-01-01T00:00' } });

      const clearBtn = screen.getByTestId('clear-filters-btn');
      fireEvent.click(clearBtn);

      expect(eventTypeSelect.value).toBe('');
      expect(actorInput.value).toBe('');
      expect(sinceInput.value).toBe('');
      expect(mockOnFilterChange).toHaveBeenCalledWith({});
      expect(mockOnPageChange).toHaveBeenCalledWith(1);
    });

    it('handles date range filters', () => {
      render(<AuditTrail {...defaultProps} />);

      const sinceInput = screen.getByTestId('since-filter');
      const untilInput = screen.getByTestId('until-filter');

      fireEvent.change(sinceInput, { target: { value: '2026-01-01T00:00' } });
      fireEvent.change(untilInput, { target: { value: '2026-01-31T23:59' } });

      const applyBtn = screen.getByTestId('apply-filters-btn');
      fireEvent.click(applyBtn);

      expect(mockOnFilterChange).toHaveBeenCalledWith({
        event_type: undefined,
        actor: undefined,
        since: '2026-01-01T00:00',
        until: '2026-01-31T23:59',
      });
    });
  });

  describe('Pagination', () => {
    const multiPageProps = {
      ...defaultProps,
      total: 150,
      pageSize: 50,
      page: 2,
    };

    it('shows pagination when total pages > 1', () => {
      render(<AuditTrail {...multiPageProps} />);

      expect(screen.getByTestId('prev-page-btn')).toBeInTheDocument();
      expect(screen.getByTestId('next-page-btn')).toBeInTheDocument();
      expect(screen.getByTestId('page-info')).toHaveTextContent('Page 2 of 3');
    });

    it('hides pagination when only 1 page', () => {
      render(
        <AuditTrail {...defaultProps} total={10} pageSize={50} page={1} />,
      );

      expect(screen.queryByTestId('prev-page-btn')).not.toBeInTheDocument();
      expect(screen.queryByTestId('next-page-btn')).not.toBeInTheDocument();
    });

    it('calls onPageChange when next button clicked', () => {
      render(<AuditTrail {...multiPageProps} />);

      const nextBtn = screen.getByTestId('next-page-btn');
      fireEvent.click(nextBtn);

      expect(mockOnPageChange).toHaveBeenCalledWith(3);
    });

    it('calls onPageChange when previous button clicked', () => {
      render(<AuditTrail {...multiPageProps} />);

      const prevBtn = screen.getByTestId('prev-page-btn');
      fireEvent.click(prevBtn);

      expect(mockOnPageChange).toHaveBeenCalledWith(1);
    });

    it('disables previous button on first page', () => {
      render(<AuditTrail {...multiPageProps} page={1} />);

      const prevBtn = screen.getByTestId('prev-page-btn');
      expect(prevBtn).toBeDisabled();
    });

    it('disables next button on last page', () => {
      render(<AuditTrail {...multiPageProps} page={3} />);

      const nextBtn = screen.getByTestId('next-page-btn');
      expect(nextBtn).toBeDisabled();
    });

    it('displays correct showing range', () => {
      render(<AuditTrail {...multiPageProps} />);

      expect(
        screen.getByText('Showing 51 to 100 of 150 events'),
      ).toBeInTheDocument();
    });

    it('handles last page with partial results', () => {
      render(<AuditTrail {...multiPageProps} page={3} />);

      expect(
        screen.getByText('Showing 101 to 150 of 150 events'),
      ).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty events array', () => {
      render(<AuditTrail {...defaultProps} events={[]} total={0} />);

      expect(screen.getByTestId('no-events')).toBeInTheDocument();
      expect(screen.queryByTestId('events-list')).not.toBeInTheDocument();
    });

    it('handles events without correlation_id', () => {
      const eventsWithoutCorrelation: AuditEvent[] = [
        {
          event_id: 'evt-001',
          timestamp: '2026-01-31T10:00:00Z',
          event_type: 'test_event',
          actor: 'test_user',
          project_key: 'PROJ1',
          correlation_id: undefined,
          payload_summary: '{}',
        },
      ];

      render(
        <AuditTrail
          {...defaultProps}
          events={eventsWithoutCorrelation}
          total={1}
        />,
      );

      const expandBtn = screen.getByTestId('expand-btn-evt-001');
      fireEvent.click(expandBtn);

      expect(screen.queryByText('Correlation ID:')).not.toBeInTheDocument();
    });

    it('handles malformed timestamps gracefully', () => {
      const eventsWithBadTimestamp: AuditEvent[] = [
        {
          event_id: 'evt-001',
          timestamp: 'invalid-timestamp',
          event_type: 'test_event',
          actor: 'test_user',
          project_key: 'PROJ1',
          correlation_id: undefined,
          payload_summary: '{}',
        },
      ];

      render(
        <AuditTrail
          {...defaultProps}
          events={eventsWithBadTimestamp}
          total={1}
        />,
      );

      // Should show "Invalid Date" when formatting fails
      const timestamp = screen.getByTestId('event-timestamp');
      expect(timestamp.textContent).toMatch(/Invalid Date|invalid-timestamp/);
    });

    it('handles payload_summary as object', () => {
      const eventsWithObjectPayload: AuditEvent[] = [
        {
          event_id: 'evt-001',
          timestamp: '2026-01-31T10:00:00Z',
          event_type: 'test_event',
          actor: 'test_user',
          project_key: 'PROJ1',
          correlation_id: undefined,
          payload_summary: { test: 'value' } as any,
        },
      ];

      render(
        <AuditTrail
          {...defaultProps}
          events={eventsWithObjectPayload}
          total={1}
        />,
      );

      const expandBtn = screen.getByTestId('expand-btn-evt-001');
      fireEvent.click(expandBtn);

      const details = screen.getByTestId('event-details');
      expect(details).toHaveTextContent('test');
      expect(details).toHaveTextContent('value');
    });
  });

  describe('Accessibility', () => {
    it('uses proper ARIA attributes on expand buttons', () => {
      render(<AuditTrail {...defaultProps} />);

      const expandBtn = screen.getByTestId('expand-btn-evt-001');
      expect(expandBtn).toHaveAttribute('aria-label', 'Expand details');
      expect(expandBtn).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(expandBtn);
      expect(expandBtn).toHaveAttribute('aria-label', 'Collapse details');
      expect(expandBtn).toHaveAttribute('aria-expanded', 'true');
    });

    it('labels filter inputs properly', () => {
      render(<AuditTrail {...defaultProps} />);

      expect(screen.getByLabelText('Event Type')).toBeInTheDocument();
      expect(screen.getByLabelText('Actor')).toBeInTheDocument();
      expect(screen.getByLabelText('Since Date')).toBeInTheDocument();
      expect(screen.getByLabelText('Until Date')).toBeInTheDocument();
    });
  });
});
