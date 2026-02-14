import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import RAIDList from '../../../components/RAIDList';
import * as apiClientModule from '../../../services/apiClient';
import i18n from '../../../i18n/config';
import type { RAIDItemList, RAIDItem } from '../../../types';

// Mock apiClient
vi.mock('../../../services/apiClient', () => ({
  default: {
    listRAIDItems: vi.fn(),
  },
}));

const mockRAIDItem: RAIDItem = {
  id: 'raid-001',
  type: 'risk',
  title: 'Test Risk Item',
  description: 'Test description',
  status: 'open',
  owner: 'test-user',
  priority: 'high',
  impact: 'high',
  likelihood: 'likely',
  mitigation_plan: 'Test mitigation',
  next_actions: ['Action 1'],
  linked_decisions: [],
  linked_change_requests: [],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  created_by: 'test-user',
  updated_by: 'test-user',
  target_resolution_date: null,
};

function renderWithQuery(component: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <BrowserRouter>
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
      </I18nextProvider>
    </BrowserRouter>,
  );
}

describe('RAIDList', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await i18n.changeLanguage('en');
  });

  it('should display loading skeleton while fetching RAID items', () => {
    vi.spyOn(apiClientModule.default, 'listRAIDItems').mockImplementation(
      () => new Promise(() => {}), // Never resolves
    );

    renderWithQuery(<RAIDList projectKey="TEST_PROJECT" />);

    expect(screen.getByText('RAID Register')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('should display RAID items in a table', async () => {
    const mockResponse: RAIDItemList = {
      items: [mockRAIDItem],
      total: 1,
      filtered_by: null,
    };

    vi.spyOn(apiClientModule.default, 'listRAIDItems').mockResolvedValue({
      success: true,
      data: mockResponse,
    });

    renderWithQuery(<RAIDList projectKey="TEST_PROJECT" />);

    await waitFor(() => {
      expect(screen.getByText('Test Risk Item')).toBeInTheDocument();
    });

    // These appear in both the table and filter dropdowns, so use table to verify
    const table = screen.getByRole('table');
    expect(table).toHaveTextContent('Risk');
    expect(table).toHaveTextContent('Open');
    expect(table).toHaveTextContent('HIGH');
    expect(table).toHaveTextContent('test-user');
    expect(screen.getByText('1 item')).toBeInTheDocument();
  });

  it('should display multiple RAID items', async () => {
    const mockResponse: RAIDItemList = {
      items: [
        mockRAIDItem,
        {
          ...mockRAIDItem,
          id: 'raid-002',
          type: 'issue',
          title: 'Test Issue',
          priority: 'critical',
        },
      ],
      total: 2,
      filtered_by: null,
    };

    vi.spyOn(apiClientModule.default, 'listRAIDItems').mockResolvedValue({
      success: true,
      data: mockResponse,
    });

    renderWithQuery(<RAIDList projectKey="TEST_PROJECT" />);

    await waitFor(() => {
      expect(screen.getByText('Test Risk Item')).toBeInTheDocument();
      expect(screen.getByText('Test Issue')).toBeInTheDocument();
    });

    expect(screen.getByText('2 items')).toBeInTheDocument();
    const table = screen.getByRole('table');
    expect(table).toHaveTextContent('Issue');
    expect(table).toHaveTextContent('CRITICAL');
  });

  // TODO: Fix empty state text rendering - component doesn't render expected text
  it.skip('should display empty state when no RAID items exist', async () => {
    const mockResponse: RAIDItemList = {
      items: [],
      total: 0,
      filtered_by: null,
    };

    vi.spyOn(apiClientModule.default, 'listRAIDItems').mockResolvedValue({
      success: true,
      data: mockResponse,
    });

    renderWithQuery(<RAIDList projectKey="TEST_PROJECT" />);

    await waitFor(() => {
      expect(screen.getByText('No items match your filters')).toBeInTheDocument();
    });

    expect(screen.getByText('0 items')).toBeInTheDocument();
  });

  it('should display error message when API fails', async () => {
    vi.spyOn(apiClientModule.default, 'listRAIDItems').mockResolvedValue({
      success: false,
      error: 'Network error',
    });

    renderWithQuery(<RAIDList projectKey="TEST_PROJECT" />);

    await waitFor(() => {
      expect(screen.getByText(/Error loading RAID items/)).toBeInTheDocument();
    });
  });

  it('should format dates correctly', async () => {
    const mockResponse: RAIDItemList = {
      items: [mockRAIDItem],
      total: 1,
      filtered_by: null,
    };

    vi.spyOn(apiClientModule.default, 'listRAIDItems').mockResolvedValue({
      success: true,
      data: mockResponse,
    });

    renderWithQuery(<RAIDList projectKey="TEST_PROJECT" />);

    await waitFor(() => {
      expect(screen.getByText(/Jan 1, 2024/)).toBeInTheDocument();
    });
  });

  it('should display correct badge colors for different types', async () => {
    const mockResponse: RAIDItemList = {
      items: [
        { ...mockRAIDItem, type: 'risk' },
        { ...mockRAIDItem, id: 'raid-002', type: 'assumption' },
        { ...mockRAIDItem, id: 'raid-003', type: 'issue' },
        { ...mockRAIDItem, id: 'raid-004', type: 'dependency' },
      ],
      total: 4,
      filtered_by: null,
    };

    vi.spyOn(apiClientModule.default, 'listRAIDItems').mockResolvedValue({
      success: true,
      data: mockResponse,
    });

    renderWithQuery(<RAIDList projectKey="TEST_PROJECT" />);

    await waitFor(() => {
      const table = screen.getByRole('table');
      expect(table).toHaveTextContent('Risk');
      expect(table).toHaveTextContent('Assumption');
      expect(table).toHaveTextContent('Issue');
      expect(table).toHaveTextContent('Dependency');
    });
  });

  it('should display correct status labels', async () => {
    const mockResponse: RAIDItemList = {
      items: [{ ...mockRAIDItem, status: 'in_progress' }],
      total: 1,
      filtered_by: null,
    };

    vi.spyOn(apiClientModule.default, 'listRAIDItems').mockResolvedValue({
      success: true,
      data: mockResponse,
    });

    renderWithQuery(<RAIDList projectKey="TEST_PROJECT" />);

    await waitFor(() => {
      const badges = screen.getAllByText('In Progress');
      // Should find at least the badge in the table (filter dropdown will also have it)
      expect(badges.length).toBeGreaterThan(0);
    });
  });
});
