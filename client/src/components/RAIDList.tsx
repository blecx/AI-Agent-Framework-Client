import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../services/apiClient';
import type { RAIDItem, RAIDType, RAIDStatus, RAIDPriority } from '../types';
import EmptyState from './ui/EmptyState';
import { Button } from './ui/Button';
import { TypeBadge, StatusBadge, PriorityBadge } from './raid/RAIDBadge';
import { RAIDFilters, type RAIDFiltersState } from './raid/RAIDFilters';
import { RAIDCreateModal } from './raid/RAIDCreateModal';
import './RAIDList.css';

interface RAIDListProps {
  projectKey: string;
}

export default function RAIDList({ projectKey }: RAIDListProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Initialize filters from URL params
  const [selectedFilters, setSelectedFilters] = useState<RAIDFiltersState>(
    () => {
      const type = searchParams.get('type') as RAIDType | null;
      const status = searchParams.get('status') as RAIDStatus | null;
      const priority = searchParams.get('priority') as RAIDPriority | null;
      const owner = searchParams.get('owner');
      const dueDateFrom = searchParams.get('dueDateFrom');
      const dueDateTo = searchParams.get('dueDateTo');

      return {
        type: type || undefined,
        status: status || undefined,
        priority: priority || undefined,
        owner: owner || undefined,
        dueDateFrom: dueDateFrom || undefined,
        dueDateTo: dueDateTo || undefined,
      };
    },
  );

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedFilters.type) params.set('type', selectedFilters.type);
    if (selectedFilters.status) params.set('status', selectedFilters.status);
    if (selectedFilters.priority)
      params.set('priority', selectedFilters.priority);
    if (selectedFilters.owner) params.set('owner', selectedFilters.owner);
    if (selectedFilters.dueDateFrom)
      params.set('dueDateFrom', selectedFilters.dueDateFrom);
    if (selectedFilters.dueDateTo)
      params.set('dueDateTo', selectedFilters.dueDateTo);
    setSearchParams(params, { replace: true });
  }, [selectedFilters, setSearchParams]);

  // Fetch RAID items
  const {
    data: raidResponse,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ['raid', projectKey, selectedFilters],
    queryFn: async () => {
      const response = await apiClient.listRAIDItems(
        projectKey,
        selectedFilters,
      );
      if (!response.success) {
        throw new Error(response.error || 'Failed to load RAID items');
      }
      return response.data;
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Extract unique owners for filter dropdown
  const uniqueOwners = useMemo(() => {
    if (!raidResponse?.items) return [];
    const owners = new Set<string>();
    raidResponse.items.forEach((item: RAIDItem) => {
      if (item.owner) owners.add(item.owner);
    });
    return Array.from(owners).sort();
  }, [raidResponse]);

  // Filter items locally by date range (API doesn't support date filtering)
  const filteredItems = useMemo(() => {
    if (!raidResponse?.items) return [];
    let items = raidResponse.items;

    // Apply date range filter
    if (selectedFilters.dueDateFrom || selectedFilters.dueDateTo) {
      items = items.filter((item: RAIDItem) => {
        if (!item.target_resolution_date) return false;
        const itemDate = new Date(item.target_resolution_date);

        if (selectedFilters.dueDateFrom) {
          const fromDate = new Date(selectedFilters.dueDateFrom);
          if (itemDate < fromDate) return false;
        }

        if (selectedFilters.dueDateTo) {
          const toDate = new Date(selectedFilters.dueDateTo);
          if (itemDate > toDate) return false;
        }

        return true;
      });
    }

    return items;
  }, [raidResponse, selectedFilters.dueDateFrom, selectedFilters.dueDateTo]);

  const handleFiltersChange = (newFilters: RAIDFiltersState) => {
    setSelectedFilters(newFilters);
  };

  if (isLoading) {
    return (
      <div className="raid-list-container">
        <header className="raid-list-header">
          <h2>RAID Register</h2>
        </header>
        <div className="raid-table">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Title</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Owner</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              <tr className="skeleton-row" aria-busy="true">
                <td>
                  <div className="skeleton" />
                </td>
                <td>
                  <div className="skeleton" />
                </td>
                <td>
                  <div className="skeleton" />
                </td>
                <td>
                  <div className="skeleton" />
                </td>
                <td>
                  <div className="skeleton" />
                </td>
                <td>
                  <div className="skeleton" />
                </td>
              </tr>
              <tr className="skeleton-row" aria-busy="true">
                <td>
                  <div className="skeleton" />
                </td>
                <td>
                  <div className="skeleton" />
                </td>
                <td>
                  <div className="skeleton" />
                </td>
                <td>
                  <div className="skeleton" />
                </td>
                <td>
                  <div className="skeleton" />
                </td>
                <td>
                  <div className="skeleton" />
                </td>
              </tr>
              <tr className="skeleton-row" aria-busy="true">
                <td>
                  <div className="skeleton" />
                </td>
                <td>
                  <div className="skeleton" />
                </td>
                <td>
                  <div className="skeleton" />
                </td>
                <td>
                  <div className="skeleton" />
                </td>
                <td>
                  <div className="skeleton" />
                </td>
                <td>
                  <div className="skeleton" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (queryError) {
    return (
      <div className="raid-list-container">
        <header className="raid-list-header">
          <h2>RAID Register</h2>
        </header>
        <div className="error-message">
          Error loading RAID items: {(queryError as Error).message}
        </div>
      </div>
    );
  }

  const items = filteredItems;

  if (items.length === 0 && Object.keys(selectedFilters).length === 0) {
    return (
      <div className="raid-list-container">
        <header className="raid-list-header">
          <h2>RAID Register</h2>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            + Add RAID Item
          </Button>
        </header>
        <EmptyState
          icon="📋"
          title="No RAID items yet"
          description="Track Risks, Assumptions, Issues, and Dependencies for this project."
          action={{
            label: 'Add First Item',
            onClick: () => setShowCreateModal(true),
          }}
        />
      </div>
    );
  }

  return (
    <div className="raid-list-container">
      <header className="raid-list-header">
        <div className="header-left">
          <h2>RAID Register</h2>
          <span className="item-count">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
        </div>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          + Add RAID Item
        </Button>
      </header>

      <RAIDFilters
        filters={selectedFilters}
        onFiltersChange={handleFiltersChange}
        owners={uniqueOwners}
      />

      {items.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No items match your filters"
          description="Try adjusting or clearing your filters to see more results."
        />
      ) : (
        <div className="raid-table">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Title</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Owner</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: RAIDItem) => (
                <tr
                  key={item.id}
                  className="raid-row"
                  onClick={() => {
                    /* TODO: Navigate to detail view */
                  }}
                >
                  <td>
                    <TypeBadge value={item.type} size="sm" />
                  </td>
                  <td className="raid-title">{item.title}</td>
                  <td>
                    <StatusBadge value={item.status} size="sm" />
                  </td>
                  <td>
                    <PriorityBadge value={item.priority} size="sm" />
                  </td>
                  <td>{item.owner}</td>
                  <td className="raid-date">{formatDate(item.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreateModal && (
        <RAIDCreateModal
          projectKey={projectKey}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}
