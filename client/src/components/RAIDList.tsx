import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t, i18n } = useTranslation();
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
        throw new Error(response.error || t('raid.list.errors.failedToLoadItems'));
      }
      return response.data;
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language, {
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
          <h2>{t('raid.list.title')}</h2>
        </header>
        <div className="raid-table">
          <table>
            <thead>
              <tr>
                <th>{t('raid.list.table.type')}</th>
                <th>{t('raid.list.table.title')}</th>
                <th>{t('raid.list.table.status')}</th>
                <th>{t('raid.list.table.priority')}</th>
                <th>{t('raid.list.table.owner')}</th>
                <th>{t('raid.list.table.created')}</th>
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
          <h2>{t('raid.list.title')}</h2>
        </header>
        <div className="error-message">
          {t('raid.list.errors.loadingWithMessage', { message: (queryError as Error).message })}
        </div>
      </div>
    );
  }

  const items = filteredItems;

  // Check if any filters are actually set
  const hasActiveFilters = Object.values(selectedFilters).some(
    (value) => value !== undefined && value !== null && value !== '',
  );

  if (items.length === 0 && !hasActiveFilters) {
    return (
      <div className="raid-list-container">
        <header className="raid-list-header">
          <h2>{t('raid.list.title')}</h2>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            {t('raid.list.actions.addItem')}
          </Button>
        </header>
        <EmptyState
          icon="📋"
          title={t('raid.list.empty.title')}
          description={t('raid.list.empty.description')}
          action={{
            label: t('raid.list.actions.addFirstItem'),
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
          <h2>{t('raid.list.title')}</h2>
          <span className="item-count">
            {t('raid.list.itemCount', { count: items.length })}
          </span>
        </div>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          {t('raid.list.actions.addItem')}
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
          title={t('raid.list.empty.noFilterMatchesTitle')}
          description={t('raid.list.empty.noFilterMatchesDescription')}
        />
      ) : (
        <div className="raid-table">
          <table>
            <thead>
              <tr>
                <th>{t('raid.list.table.type')}</th>
                <th>{t('raid.list.table.title')}</th>
                <th>{t('raid.list.table.status')}</th>
                <th>{t('raid.list.table.priority')}</th>
                <th>{t('raid.list.table.owner')}</th>
                <th>{t('raid.list.table.created')}</th>
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
