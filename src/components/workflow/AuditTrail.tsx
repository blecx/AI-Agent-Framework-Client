import React, { useState } from 'react';
import { AuditEvent } from '../../types/api';

export interface AuditTrailProps {
  /** Audit events to display */
  events: AuditEvent[];
  /** Total number of events (for pagination) */
  total: number;
  /** Current page (1-indexed) */
  page: number;
  /** Events per page */
  pageSize: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Callback when filters change */
  onFilterChange: (filters: {
    event_type?: string;
    actor?: string;
    since?: string;
    until?: string;
  }) => void;
  /** Loading state */
  isLoading?: boolean;
}

/** Format timestamp to local timezone */
const formatTimestamp = (timestamp: string): string => {
  try {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    });
  } catch {
    return timestamp;
  }
};

/** Extract unique event types from events */
const getUniqueEventTypes = (events: AuditEvent[]): string[] => {
  const types = new Set(events.map((e) => e.event_type));
  return Array.from(types).sort();
};

export const AuditTrail: React.FC<AuditTrailProps> = ({
  events,
  total,
  page,
  pageSize,
  onPageChange,
  onFilterChange,
  isLoading = false,
}) => {
  const [expandedEventIds, setExpandedEventIds] = useState<Set<string>>(
    new Set(),
  );
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('');
  const [actorFilter, setActorFilter] = useState<string>('');
  const [sinceFilter, setSinceFilter] = useState<string>('');
  const [untilFilter, setUntilFilter] = useState<string>('');

  const totalPages = Math.ceil(total / pageSize);
  const availableEventTypes = getUniqueEventTypes(events);

  const toggleEventExpanded = (eventId: string) => {
    setExpandedEventIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  const handleApplyFilters = () => {
    onFilterChange({
      event_type: eventTypeFilter || undefined,
      actor: actorFilter || undefined,
      since: sinceFilter || undefined,
      until: untilFilter || undefined,
    });
    // Reset to first page when filters change
    onPageChange(1);
  };

  const handleClearFilters = () => {
    setEventTypeFilter('');
    setActorFilter('');
    setSinceFilter('');
    setUntilFilter('');
    onFilterChange({});
    onPageChange(1);
  };

  const hasActiveFilters = !!(
    eventTypeFilter ||
    actorFilter ||
    sinceFilter ||
    untilFilter
  );

  return (
    <div className="audit-trail" data-testid="audit-trail">
      {/* Filters */}
      <div className="mb-4 p-4 bg-gray-50 rounded-md">
        <h3 className="text-md font-semibold mb-3">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          {/* Event Type Filter */}
          <div>
            <label
              htmlFor="event-type-filter"
              className="block text-sm font-medium mb-1"
            >
              Event Type
            </label>
            <select
              id="event-type-filter"
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              data-testid="event-type-filter"
            >
              <option value="">All Types</option>
              {availableEventTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Actor Filter */}
          <div>
            <label
              htmlFor="actor-filter"
              className="block text-sm font-medium mb-1"
            >
              Actor
            </label>
            <input
              type="text"
              id="actor-filter"
              value={actorFilter}
              onChange={(e) => setActorFilter(e.target.value)}
              placeholder="Filter by actor..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              data-testid="actor-filter"
            />
          </div>

          {/* Since Date Filter */}
          <div>
            <label
              htmlFor="since-filter"
              className="block text-sm font-medium mb-1"
            >
              Since Date
            </label>
            <input
              type="datetime-local"
              id="since-filter"
              value={sinceFilter}
              onChange={(e) => setSinceFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              data-testid="since-filter"
            />
          </div>

          {/* Until Date Filter */}
          <div>
            <label
              htmlFor="until-filter"
              className="block text-sm font-medium mb-1"
            >
              Until Date
            </label>
            <input
              type="datetime-local"
              id="until-filter"
              value={untilFilter}
              onChange={(e) => setUntilFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              data-testid="until-filter"
            />
          </div>
        </div>

        {/* Filter Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleApplyFilters}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-testid="apply-filters-btn"
          >
            Apply Filters
          </button>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
              data-testid="clear-filters-btn"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Events List */}
      <div className="mb-4">
        <h3 className="text-md font-semibold mb-2">
          Audit Events ({total} total)
        </h3>

        {isLoading ? (
          <div className="text-center py-8 text-gray-500" data-testid="loading">
            Loading audit events...
          </div>
        ) : events.length === 0 ? (
          <div
            className="text-center py-8 text-gray-500"
            data-testid="no-events"
          >
            No audit events found
          </div>
        ) : (
          <div className="space-y-2" data-testid="events-list">
            {events.map((event) => {
              const isExpanded = expandedEventIds.has(event.event_id);
              return (
                <div
                  key={event.event_id}
                  className="border border-gray-200 rounded-md bg-white"
                  data-testid={`event-${event.event_id}`}
                >
                  {/* Event Header */}
                  <div className="flex items-center justify-between p-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="font-medium text-sm"
                          data-testid="event-type"
                        >
                          {event.event_type}
                        </span>
                        <span
                          className="text-xs text-gray-500"
                          data-testid="event-actor"
                        >
                          by {event.actor}
                        </span>
                      </div>
                      <div
                        className="text-xs text-gray-600"
                        data-testid="event-timestamp"
                      >
                        {formatTimestamp(event.timestamp)}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleEventExpanded(event.event_id)}
                      className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
                      data-testid={`expand-btn-${event.event_id}`}
                      aria-label={
                        isExpanded ? 'Collapse details' : 'Expand details'
                      }
                      aria-expanded={isExpanded}
                    >
                      {isExpanded ? 'Collapse' : 'Expand'}
                    </button>
                  </div>

                  {/* Event Details (Expanded) */}
                  {isExpanded && (
                    <div
                      className="border-t border-gray-200 p-3 bg-gray-50"
                      data-testid="event-details"
                    >
                      <dl className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div>
                          <dt className="font-medium text-gray-700">
                            Event ID:
                          </dt>
                          <dd className="text-gray-600 font-mono text-xs">
                            {event.event_id}
                          </dd>
                        </div>
                        {event.correlation_id && (
                          <div>
                            <dt className="font-medium text-gray-700">
                              Correlation ID:
                            </dt>
                            <dd className="text-gray-600 font-mono text-xs">
                              {event.correlation_id}
                            </dd>
                          </div>
                        )}
                        <div>
                          <dt className="font-medium text-gray-700">
                            Project Key:
                          </dt>
                          <dd className="text-gray-600">{event.project_key}</dd>
                        </div>
                        {event.payload_summary && (
                          <div className="md:col-span-2">
                            <dt className="font-medium text-gray-700 mb-1">
                              Payload Summary:
                            </dt>
                            <dd className="text-gray-600">
                              <pre className="bg-white p-2 rounded border border-gray-200 text-xs overflow-x-auto">
                                {typeof event.payload_summary === 'string'
                                  ? event.payload_summary
                                  : JSON.stringify(
                                      event.payload_summary,
                                      null,
                                      2,
                                    )}
                              </pre>
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-4">
          <div className="text-sm text-gray-600">
            Showing {(page - 1) * pageSize + 1} to{' '}
            {Math.min(page * pageSize, total)} of {total} events
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
              data-testid="prev-page-btn"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm" data-testid="page-info">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
              data-testid="next-page-btn"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
