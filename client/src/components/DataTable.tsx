import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import EmptyState from './ui/EmptyState';
import { LoadingSkeleton } from './LoadingSkeleton';
import TableFilters from './TableFilters';
import type { TableColumn, TableFilter, TableSortOrder } from '../types/table';
import './DataTable.css';

interface DataTableProps<T> {
  columns: Array<TableColumn<T>>;
  data: T[];
  getRowId: (row: T) => string;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  filters?: Array<TableFilter<T>>;
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  queryKeyPrefix?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyCta?: string;
  onEmptyCta?: () => void;
}

function compareValues(a: string | number, b: string | number): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), undefined, { sensitivity: 'base' });
}

export default function DataTable<T>({
  columns,
  data,
  getRowId,
  onRowClick,
  loading = false,
  filters = [],
  pageSizeOptions = [10, 20, 50],
  defaultPageSize = 10,
  queryKeyPrefix = 'table',
  emptyTitle,
  emptyDescription,
  emptyCta,
  onEmptyCta,
}: DataTableProps<T>) {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const queryKey = (name: string) => `${queryKeyPrefix}_${name}`;

  const [sortKey, setSortKey] = useState<string | undefined>(
    searchParams.get(queryKey('sort')) || undefined,
  );
  const [sortOrder, setSortOrder] = useState<TableSortOrder>(
    (searchParams.get(queryKey('order')) as TableSortOrder) || 'asc',
  );
  const [page, setPage] = useState<number>(Number(searchParams.get(queryKey('page')) || '1'));
  const [pageSize, setPageSize] = useState<number>(
    Number(searchParams.get(queryKey('pageSize')) || String(defaultPageSize)),
  );
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(0);

  const [filterValues, setFilterValues] = useState<Record<string, string>>(() => {
    const values: Record<string, string> = {};
    filters.forEach((filter) => {
      const paramValue = searchParams.get(queryKey(`filter_${filter.key}`));
      if (paramValue) values[filter.key] = paramValue;
    });
    return values;
  });

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams);

    if (sortKey) nextParams.set(queryKey('sort'), sortKey);
    else nextParams.delete(queryKey('sort'));

    nextParams.set(queryKey('order'), sortOrder);
    nextParams.set(queryKey('page'), String(page));
    nextParams.set(queryKey('pageSize'), String(pageSize));

    filters.forEach((filter) => {
      const key = queryKey(`filter_${filter.key}`);
      const value = filterValues[filter.key];
      if (value) nextParams.set(key, value);
      else nextParams.delete(key);
    });

    setSearchParams(nextParams, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortKey, sortOrder, page, pageSize, filterValues, setSearchParams]);

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      return filters.every((filter) => {
        const value = (filterValues[filter.key] || '').trim();
        if (!value) return true;

        if (filter.predicate) return filter.predicate(row, value);

        const rowText = (filter.accessor?.(row) || '').toLowerCase();
        if (filter.type === 'search') {
          return rowText.includes(value.toLowerCase());
        }
        return rowText === value.toLowerCase();
      });
    });
  }, [data, filters, filterValues]);

  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    const column = columns.find((c) => String(c.key) === sortKey);
    if (!column || !column.sortable) return filteredData;

    const sorted = [...filteredData].sort((a, b) => {
      const aVal = column.sortValue ? column.sortValue(a) : String((a as Record<string, unknown>)[sortKey] || '');
      const bVal = column.sortValue ? column.sortValue(b) : String((b as Record<string, unknown>)[sortKey] || '');
      return compareValues(aVal, bVal);
    });

    return sortOrder === 'asc' ? sorted : sorted.reverse();
  }, [columns, filteredData, sortKey, sortOrder]);

  const total = sortedData.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const pagedData = sortedData.slice(startIndex, endIndex);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  useEffect(() => {
    setSelectedRowIndex(0);
  }, [page, pageSize, sortKey, sortOrder, filterValues]);

  const toggleSort = (key: string) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortOrder('asc');
      return;
    }
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const onTableKeyDown = (e: React.KeyboardEvent) => {
    if (!pagedData.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedRowIndex((prev) => Math.min(prev + 1, pagedData.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedRowIndex((prev) => Math.max(prev - 1, 0));
    }
    if (e.key === 'Enter' && onRowClick) {
      e.preventDefault();
      onRowClick(pagedData[selectedRowIndex]);
    }
  };

  if (loading) {
    return (
      <div className="data-table-loading">
        <LoadingSkeleton count={6} />
      </div>
    );
  }

  if (!total) {
    return (
      <EmptyState
        title={emptyTitle || t('table.emptyTitle')}
        description={emptyDescription || t('table.emptyDescription')}
        ctaLabel={emptyCta}
        ctaAction={onEmptyCta}
      />
    );
  }

  return (
    <div className="data-table-wrapper">
      {filters.length > 0 && (
        <TableFilters filters={filters} values={filterValues} onChange={handleFilterChange} />
      )}

      <div className="data-table-desktop" tabIndex={0} onKeyDown={onTableKeyDown}>
        <table className="data-table" role="table">
          <thead>
            <tr>
              {columns.map((column) => {
                const key = String(column.key);
                const isSorted = sortKey === key;
                return (
                  <th key={key} style={column.width ? { width: column.width } : undefined}>
                    {column.sortable ? (
                      <button
                        type="button"
                        className="data-table-sort"
                        onClick={() => toggleSort(key)}
                      >
                        {column.label}
                        <span aria-hidden="true">
                          {isSorted ? (sortOrder === 'asc' ? ' ↑' : ' ↓') : ' ↕'}
                        </span>
                      </button>
                    ) : (
                      column.label
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {pagedData.map((row, index) => (
              <tr
                key={getRowId(row)}
                className={`${onRowClick ? 'data-table-clickable' : ''} ${selectedRowIndex === index ? 'data-table-selected' : ''}`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => {
                  const key = String(column.key);
                  return (
                    <td key={key}>
                      {column.render
                        ? column.render(row)
                        : String((row as Record<string, unknown>)[key] ?? '')}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="data-table-mobile">
        {pagedData.map((row) => (
          <article key={getRowId(row)} className="data-card" onClick={() => onRowClick?.(row)}>
            {columns.map((column) => {
              const key = String(column.key);
              return (
                <div key={key} className="data-card-row">
                  <span className="data-card-label">{column.label}</span>
                  <span className="data-card-value">
                    {column.render
                      ? column.render(row)
                      : String((row as Record<string, unknown>)[key] ?? '')}
                  </span>
                </div>
              );
            })}
          </article>
        ))}
      </div>

      <div className="data-table-pagination">
        <span>
          {t('table.showing', {
            start: startIndex + 1,
            end: endIndex,
            total,
          })}
        </span>

        <div className="data-table-pagination-controls">
          <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
            {t('table.prev')}
          </button>
          <span>
            {page} / {pageCount}
          </span>
          <button type="button" onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={page >= pageCount}>
            {t('table.next')}
          </button>
          <label className="data-table-page-size">
            {t('table.pageSize')}
            <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}
