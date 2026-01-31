import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/apiClient';
import type { RAIDItem, RAIDType, RAIDStatus, RAIDPriority } from '../types';
import EmptyState from './ui/EmptyState';
import { Button } from './ui/Button';
import { TypeBadge, StatusBadge, PriorityBadge } from './raid/RAIDBadge';
import './RAIDList.css';

interface RAIDListProps {
  projectKey: string;
}

export default function RAIDList({ projectKey }: RAIDListProps) {
  const [selectedFilters] = useState<{
    type?: RAIDType;
    status?: RAIDStatus;
    priority?: RAIDPriority;
  }>({});

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

  const items = raidResponse?.items || [];

  if (items.length === 0) {
    return (
      <div className="raid-list-container">
        <header className="raid-list-header">
          <h2>RAID Register</h2>
          <Button
            variant="primary"
            onClick={() => {
              /* TODO: Open create modal */
            }}
          >
            + Add RAID Item
          </Button>
        </header>
        <EmptyState
          icon="📋"
          title="No RAID items yet"
          description="Track Risks, Assumptions, Issues, and Dependencies for this project."
          action={{
            label: 'Add First Item',
            onClick: () => {
              /* TODO: Open create modal */
            },
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
        <Button
          variant="primary"
          onClick={() => {
            /* TODO: Open create modal */
          }}
        >
          + Add RAID Item
        </Button>
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
    </div>
  );
}
