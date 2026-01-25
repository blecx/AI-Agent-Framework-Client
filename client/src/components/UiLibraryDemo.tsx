import { useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Badge, Button, Input, Modal, Select, Table, Textarea } from './ui';

type DemoRow = { name: string; status: 'ready' | 'blocked'; count: number };

export default function UiLibraryDemo() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');

  const rows: DemoRow[] = useMemo(
    () => [
      { name: 'Issue #26', status: 'ready', count: 3 },
      { name: 'Issue #27', status: 'blocked', count: 12 },
      { name: 'Issue #28', status: 'ready', count: 1 },
    ],
    [],
  );

  return (
    <div style={{ padding: '1.5rem 2rem' }}>
      <h2 style={{ marginBottom: '1rem' }}>UI Component Library</h2>

      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '0.75rem' }}>Buttons</h3>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button onClick={() => setIsModalOpen(true)}>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button isLoading>Loading</Button>
        </div>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '0.75rem' }}>Badges</h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Badge variant="neutral">Neutral</Badge>
          <Badge variant="primary">Primary</Badge>
          <Badge variant="danger">Danger</Badge>
        </div>
      </section>

      <section style={{ marginBottom: '2rem', maxWidth: 520 }}>
        <h3 style={{ marginBottom: '0.75rem' }}>Form</h3>
        <div style={{ display: 'grid', gap: '0.85rem' }}>
          <Input
            label="Name"
            value={name}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setName(e.target.value)
            }
            placeholder="Type something..."
            hint="Used to demonstrate Input styling"
          />
          <Select
            label="Status"
            value="ready"
            options={[
              { label: 'Ready', value: 'ready' },
              { label: 'Blocked', value: 'blocked' },
            ]}
            onChange={() => undefined}
          />
          <Textarea label="Notes" placeholder="Textarea example..." rows={3} />
        </div>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '0.75rem' }}>Table (sortable)</h3>
        <Table
          caption="Demo table"
          rows={rows}
          columns={[
            {
              key: 'name',
              header: 'Name',
              accessor: (r: DemoRow) => r.name,
              sortable: true,
              sortValue: (r: DemoRow) => r.name,
            },
            {
              key: 'status',
              header: 'Status',
              accessor: (r: DemoRow) => (
                <Badge variant={r.status === 'ready' ? 'primary' : 'danger'}>
                  {r.status}
                </Badge>
              ),
              sortable: true,
              sortValue: (r: DemoRow) => r.status,
              width: '160px',
            },
            {
              key: 'count',
              header: 'Count',
              accessor: (r: DemoRow) => r.count,
              sortable: true,
              sortValue: (r: DemoRow) => r.count,
              width: '120px',
            },
          ]}
        />
      </section>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Example modal"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Close
            </Button>
            <Button onClick={() => setIsModalOpen(false)}>OK</Button>
          </>
        }
      >
        <p style={{ margin: 0 }}>
          This is a reusable modal shell. It locks body scrolling and closes on
          Escape.
        </p>
      </Modal>
    </div>
  );
}
