import { useMemo, useState } from 'react';
import './ui.css';

export type SortDirection = 'asc' | 'desc';

export interface TableColumn<T> {
  key: string;
  header: string;
  accessor: (row: T) => React.ReactNode;
  sortValue?: (row: T) => string | number | boolean | null | undefined;
  sortable?: boolean;
  width?: string;
}

export interface TableProps<T> {
  rows: T[];
  columns: Array<TableColumn<T>>;
  caption?: string;
  initialSort?: { key: string; direction: SortDirection };
  emptyState?: React.ReactNode;
}

function defaultCompare(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (typeof a === 'boolean' && typeof b === 'boolean')
    return Number(a) - Number(b);
  return String(a).localeCompare(String(b));
}

export function Table<T>({
  rows,
  columns,
  caption,
  initialSort,
  emptyState,
}: TableProps<T>) {
  const [sort, setSort] = useState<{
    key: string;
    direction: SortDirection;
  } | null>(initialSort || null);

  const sortedRows = useMemo(() => {
    if (!sort) return rows;

    const column = columns.find((c) => c.key === sort.key);
    if (!column || !column.sortable) return rows;

    const sortValue = column.sortValue;
    if (!sortValue) return rows;

    const direction = sort.direction === 'asc' ? 1 : -1;

    return [...rows].sort((ra, rb) => {
      const a = sortValue(ra);
      const b = sortValue(rb);
      return defaultCompare(a, b) * direction;
    });
  }, [rows, columns, sort]);

  const onToggleSort = (key: string) => {
    const column = columns.find((c) => c.key === key);
    if (!column || !column.sortable) return;

    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, direction: 'asc' };
      return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
    });
  };

  if (!rows.length) {
    return <div>{emptyState || 'No data.'}</div>;
  }

  return (
    <table className="ui-table">
      {caption ? (
        <caption className="ui-visually-hidden">{caption}</caption>
      ) : null}
      <thead>
        <tr>
          {columns.map((c) => {
            const isSorted = sort?.key === c.key;
            const sortIcon = !c.sortable
              ? null
              : isSorted
                ? sort?.direction === 'asc'
                  ? '▲'
                  : '▼'
                : '↕';

            return (
              <th
                key={c.key}
                style={c.width ? { width: c.width } : undefined}
                scope="col"
                aria-sort={
                  c.sortable
                    ? isSorted
                      ? sort?.direction === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                    : undefined
                }
              >
                {c.sortable ? (
                  <button
                    type="button"
                    className="ui-table__sortButton"
                    onClick={() => onToggleSort(c.key)}
                  >
                    <span>{c.header}</span>
                    <span className="ui-table__sortIcon" aria-hidden="true">
                      {sortIcon}
                    </span>
                  </button>
                ) : (
                  c.header
                )}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {sortedRows.map((row, idx) => (
          <tr key={idx}>
            {columns.map((c) => (
              <td key={c.key}>{c.accessor(row)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
