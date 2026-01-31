import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RAIDFilters, type RAIDFiltersState } from '../../../components/raid/RAIDFilters';
import { RAIDType, RAIDStatus, RAIDPriority } from '../../../types/raid';

describe('RAIDFilters', () => {
  const mockOnFiltersChange = vi.fn();
  const mockOwners = ['John Doe', 'Jane Smith', 'Bob Wilson'];

  const defaultProps = {
    filters: {},
    onFiltersChange: mockOnFiltersChange,
    owners: mockOwners,
  };

  beforeEach(() => {
    mockOnFiltersChange.mockClear();
  });

  it('should render all filter controls', () => {
    render(<RAIDFilters {...defaultProps} />);

    expect(screen.getByLabelText('Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
    expect(screen.getByLabelText('Priority')).toBeInTheDocument();
    expect(screen.getByLabelText('Owner')).toBeInTheDocument();
    expect(screen.getByLabelText('Due Date From')).toBeInTheDocument();
    expect(screen.getByLabelText('Due Date To')).toBeInTheDocument();
  });

  it('should display current filter values', () => {
    const filters: RAIDFiltersState = {
      type: RAIDType.RISK,
      status: RAIDStatus.OPEN,
      priority: RAIDPriority.HIGH,
    };

    render(<RAIDFilters {...defaultProps} filters={filters} />);

    expect(screen.getByLabelText('Type')).toHaveValue(RAIDType.RISK);
    expect(screen.getByLabelText('Status')).toHaveValue(RAIDStatus.OPEN);
    expect(screen.getByLabelText('Priority')).toHaveValue(RAIDPriority.HIGH);
  });

  it('should call onFiltersChange when type changes', () => {
    render(<RAIDFilters {...defaultProps} />);

    const typeSelect = screen.getByLabelText('Type');
    fireEvent.change(typeSelect, { target: { value: RAIDType.ISSUE } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      type: RAIDType.ISSUE,
    });
  });

  it('should call onFiltersChange when status changes', () => {
    render(<RAIDFilters {...defaultProps} />);

    const statusSelect = screen.getByLabelText('Status');
    fireEvent.change(statusSelect, { target: { value: RAIDStatus.IN_PROGRESS } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      status: RAIDStatus.IN_PROGRESS,
    });
  });

  it('should call onFiltersChange when priority changes', () => {
    render(<RAIDFilters {...defaultProps} />);

    const prioritySelect = screen.getByLabelText('Priority');
    fireEvent.change(prioritySelect, { target: { value: RAIDPriority.CRITICAL } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      priority: RAIDPriority.CRITICAL,
    });
  });

  it('should call onFiltersChange when owner changes', () => {
    render(<RAIDFilters {...defaultProps} />);

    const ownerSelect = screen.getByLabelText('Owner');
    fireEvent.change(ownerSelect, { target: { value: 'John Doe' } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      owner: 'John Doe',
    });
  });

  it('should call onFiltersChange when due date from changes', () => {
    render(<RAIDFilters {...defaultProps} />);

    const dateInput = screen.getByLabelText('Due Date From');
    fireEvent.change(dateInput, { target: { value: '2024-01-01' } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      dueDateFrom: '2024-01-01',
    });
  });

  it('should call onFiltersChange when due date to changes', () => {
    render(<RAIDFilters {...defaultProps} />);

    const dateInput = screen.getByLabelText('Due Date To');
    fireEvent.change(dateInput, { target: { value: '2024-12-31' } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      dueDateTo: '2024-12-31',
    });
  });

  it('should render owner options', () => {
    render(<RAIDFilters {...defaultProps} />);

    const ownerSelect = screen.getByLabelText('Owner');
    const options = Array.from(ownerSelect.querySelectorAll('option'));
    const optionTexts = options.map(opt => opt.textContent);

    expect(optionTexts).toContain('All Owners');
    expect(optionTexts).toContain('John Doe');
    expect(optionTexts).toContain('Jane Smith');
    expect(optionTexts).toContain('Bob Wilson');
  });

  it('should show clear filters button when filters are active', () => {
    const filters: RAIDFiltersState = {
      type: RAIDType.RISK,
    };

    render(<RAIDFilters {...defaultProps} filters={filters} />);

    expect(screen.getByText('Clear All')).toBeInTheDocument();
  });

  it('should not show clear filters button when no filters are active', () => {
    render(<RAIDFilters {...defaultProps} />);

    expect(screen.queryByText('Clear All')).not.toBeInTheDocument();
  });

  it('should clear all filters when clear button clicked', () => {
    const filters: RAIDFiltersState = {
      type: RAIDType.RISK,
      status: RAIDStatus.OPEN,
      priority: RAIDPriority.HIGH,
    };

    render(<RAIDFilters {...defaultProps} filters={filters} />);

    const clearButton = screen.getByText('Clear All');
    fireEvent.click(clearButton);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({});
  });

  it('should clear filter when empty value selected', () => {
    const filters: RAIDFiltersState = {
      type: RAIDType.RISK,
    };

    render(<RAIDFilters {...defaultProps} filters={filters} />);

    const typeSelect = screen.getByLabelText('Type');
    fireEvent.change(typeSelect, { target: { value: '' } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({});
  });

  it('should preserve other filters when one changes', () => {
    const filters: RAIDFiltersState = {
      type: RAIDType.RISK,
      status: RAIDStatus.OPEN,
    };

    render(<RAIDFilters {...defaultProps} filters={filters} />);

    const prioritySelect = screen.getByLabelText('Priority');
    fireEvent.change(prioritySelect, { target: { value: RAIDPriority.HIGH } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      type: RAIDType.RISK,
      status: RAIDStatus.OPEN,
      priority: RAIDPriority.HIGH,
    });
  });
});
