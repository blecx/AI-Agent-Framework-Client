import type { ReactNode } from 'react';

export type TableSortOrder = 'asc' | 'desc';

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
}

export interface TableFilterOption {
  value: string;
  label: string;
}

export interface TableFilter<T> {
  key: string;
  label: string;
  type: 'search' | 'select';
  placeholder?: string;
  options?: TableFilterOption[];
  accessor?: (row: T) => string;
  predicate?: (row: T, value: string) => boolean;
}

export interface TableState {
  sortKey?: string;
  sortOrder: TableSortOrder;
  page: number;
  pageSize: number;
  filters: Record<string, string>;
}
