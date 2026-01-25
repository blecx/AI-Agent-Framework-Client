import { describe, it, expect } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { Table } from './Table';

type Row = { name: string; count: number };

describe('Table', () => {
  it('sorts when clicking sortable header', () => {
    const rows: Row[] = [
      { name: 'b', count: 2 },
      { name: 'a', count: 1 },
    ];

    render(
      <Table<Row>
        rows={rows}
        columns={[
          {
            key: 'name',
            header: 'Name',
            accessor: (r) => r.name,
            sortable: true,
            sortValue: (r) => r.name,
          },
          {
            key: 'count',
            header: 'Count',
            accessor: (r) => r.count,
          },
        ]}
      />,
    );

    // Initial order is as provided
    const bodyRows1 = screen.getAllByRole('row').slice(1);
    expect(within(bodyRows1[0]).getByText('b')).toBeInTheDocument();

    // Click Name header to sort asc
    fireEvent.click(screen.getByRole('button', { name: /name/i }));

    const bodyRows2 = screen.getAllByRole('row').slice(1);
    expect(within(bodyRows2[0]).getByText('a')).toBeInTheDocument();

    // Click again to sort desc
    fireEvent.click(screen.getByRole('button', { name: /name/i }));

    const bodyRows3 = screen.getAllByRole('row').slice(1);
    expect(within(bodyRows3[0]).getByText('b')).toBeInTheDocument();
  });
});
