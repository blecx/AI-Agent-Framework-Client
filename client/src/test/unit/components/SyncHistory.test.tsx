import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SyncHistory from '../../../components/SyncHistory';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'sync.history.title': 'Sync history',
        'sync.state.clean': 'In sync',
        'sync.state.failed': 'Sync failed',
        'sync.history.synced': 'Synchronization completed successfully.',
        'sync.history.failed': 'Synchronization failed.',
      };
      return translations[key] ?? key;
    },
  }),
}));

describe('SyncHistory', () => {
  it('renders title and event rows', () => {
    render(
      <SyncHistory
        events={[
          {
            id: '1',
            timestamp: new Date('2026-02-14T10:00:00.000Z'),
            state: 'clean',
            message: 'sync.history.synced',
          },
          {
            id: '2',
            timestamp: new Date('2026-02-14T09:00:00.000Z'),
            state: 'failed',
            message: 'sync.history.failed',
          },
        ]}
      />,
    );

    expect(screen.getByText('Sync history')).toBeInTheDocument();
    expect(screen.getByText('In sync')).toBeInTheDocument();
    expect(screen.getByText('Sync failed')).toBeInTheDocument();
    expect(screen.getByText('Synchronization completed successfully.')).toBeInTheDocument();
  });
});
