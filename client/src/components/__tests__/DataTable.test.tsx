import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import DataTable from '../DataTable';
import type { TableColumn, TableFilter } from '../../types/table';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, string | number>) => {
      if (key === 'table.showing') {
        return `Showing ${options?.start}-${options?.end} of ${options?.total}`;
      }

      const translations: Record<string, string> = {
        'table.all': 'All',
        'table.search': 'Search',
        'table.emptyTitle': 'No data available',
        'table.emptyDescription': 'Try adjusting filters',
        'table.prev': 'Previous',
        'table.next': 'Next',
        'table.pageSize': 'Page size',
      };

      return translations[key] ?? key;
    },
  }),
}));

type Row = {
  id: string;
  name: string;
  status: string;
  score: number;
};

const rows: Row[] = [
  { id: '1', name: 'Bravo', status: 'open', score: 2 },
  { id: '2', name: 'Alpha', status: 'closed', score: 3 },
  { id: '3', name: 'Charlie', status: 'open', score: 1 },
  { id: '4', name: 'Delta', status: 'closed', score: 5 },
  { id: '5', name: 'Echo', status: 'open', score: 4 },
  { id: '6', name: 'Foxtrot', status: 'open', score: 6 },
];

const columns: Array<TableColumn<Row>> = [
  { key: 'name', label: 'Name', sortable: true, sortValue: (row) => row.name },
  { key: 'status', label: 'Status', sortable: true, sortValue: (row) => row.status },
  { key: 'score', label: 'Score', sortable: true, sortValue: (row) => row.score },
];

const filters: Array<TableFilter<Row>> = [
  {
    key: 'search',
    label: 'Search',
    type: 'search',
    accessor: (row) => `${row.name} ${row.status}`.toLowerCase(),
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    accessor: (row) => row.status,
    options: [
      { label: 'Open', value: 'open' },
      { label: 'Closed', value: 'closed' },
    ],
  },
];

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location-search">{location.search}</div>;
}

function renderTable(onRowClick?: (row: Row) => void, initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route
          path="/"
          element={(
            <>
              <DataTable
                columns={columns}
                data={rows}
                filters={filters}
                getRowId={(row) => row.id}
                onRowClick={onRowClick}
                queryKeyPrefix="test"
                defaultPageSize={5}
              />
              <LocationProbe />
            </>
          )}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('DataTable', () => {
  it('sorts rows when column header clicked', async () => {
    const user = userEvent.setup();
    renderTable();

    const nameSort = screen.getByRole('button', { name: /name/i });
    await user.click(nameSort);

    const tableRows = screen.getAllByRole('row');
    expect(tableRows[1]).toHaveTextContent('Alpha');

    await user.click(nameSort);
    const rowsDesc = screen.getAllByRole('row');
    expect(rowsDesc[1]).toHaveTextContent('Foxtrot');
  });

  it('filters by search and select controls', async () => {
    const user = userEvent.setup();
    renderTable();

    await user.type(screen.getByRole('textbox', { name: 'Search' }), 'alpha');
    expect(screen.getAllByText('Alpha').length).toBeGreaterThan(0);
    expect(screen.queryAllByText('Bravo')).toHaveLength(0);

    await user.clear(screen.getByRole('textbox', { name: 'Search' }));
    await user.selectOptions(screen.getByRole('combobox', { name: 'Status' }), 'closed');

    expect(screen.getAllByText('Alpha').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Delta').length).toBeGreaterThan(0);
    expect(screen.queryAllByText('Bravo')).toHaveLength(0);
  });

  it('paginates data and allows next page navigation', async () => {
    const user = userEvent.setup();
    renderTable();

    expect(screen.getByText('Showing 1-5 of 6')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Next' }));

    expect(screen.getByText('Showing 6-6 of 6')).toBeInTheDocument();
    expect(screen.getAllByText('Foxtrot').length).toBeGreaterThan(0);
  });

  it('syncs state to query params', async () => {
    const user = userEvent.setup();
    renderTable();

    await user.click(screen.getByRole('button', { name: /score/i }));
    await user.type(screen.getByRole('textbox', { name: 'Search' }), 'bravo');

    const queryString = screen.getByTestId('location-search').textContent || '';
    expect(queryString).toContain('test_sort=score');
    expect(queryString).toContain('test_filter_search=bravo');
  });

  it('supports keyboard navigation and enter activation', async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    renderTable(onRowClick);

    const tableContainer = screen.getByRole('table').closest('.data-table-desktop') as HTMLElement | null;
    tableContainer?.focus();

    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');

    expect(onRowClick).toHaveBeenCalledTimes(1);
    expect(onRowClick).toHaveBeenCalledWith(expect.objectContaining({ name: 'Charlie' }));
  });

  it('renders empty state when no rows are available', () => {
    render(
      <MemoryRouter>
        <DataTable
          columns={columns}
          data={[]}
          getRowId={(row) => row.id}
          queryKeyPrefix="empty"
          emptyTitle="Nothing here"
          emptyDescription="Create something first"
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Nothing here')).toBeInTheDocument();
    expect(screen.getByText('Create something first')).toBeInTheDocument();
  });
});
