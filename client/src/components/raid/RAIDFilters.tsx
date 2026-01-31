import { RAIDType, RAIDStatus, RAIDPriority } from '../../types/raid';
import './RAIDFilters.css';

export interface RAIDFiltersState {
  type?: RAIDType;
  status?: RAIDStatus;
  priority?: RAIDPriority;
  owner?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
}

interface RAIDFiltersProps {
  filters: RAIDFiltersState;
  onFiltersChange: (filters: RAIDFiltersState) => void;
  owners: string[];
}

export function RAIDFilters({ filters, onFiltersChange, owners }: RAIDFiltersProps) {
  const handleTypeChange = (type: RAIDType | '') => {
    onFiltersChange({
      ...filters,
      type: type || undefined,
    });
  };

  const handleStatusChange = (status: RAIDStatus | '') => {
    onFiltersChange({
      ...filters,
      status: status || undefined,
    });
  };

  const handlePriorityChange = (priority: RAIDPriority | '') => {
    onFiltersChange({
      ...filters,
      priority: priority || undefined,
    });
  };

  const handleOwnerChange = (owner: string) => {
    onFiltersChange({
      ...filters,
      owner: owner || undefined,
    });
  };

  const handleDueDateFromChange = (date: string) => {
    onFiltersChange({
      ...filters,
      dueDateFrom: date || undefined,
    });
  };

  const handleDueDateToChange = (date: string) => {
    onFiltersChange({
      ...filters,
      dueDateTo: date || undefined,
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== undefined);

  return (
    <div className="raid-filters">
      <div className="raid-filters-header">
        <h3>Filters</h3>
        {hasActiveFilters && (
          <button
            className="clear-filters-btn"
            onClick={handleClearFilters}
            type="button"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="raid-filters-grid">
        <div className="filter-group">
          <label htmlFor="filter-type">Type</label>
          <select
            id="filter-type"
            value={filters.type || ''}
            onChange={(e) => handleTypeChange(e.target.value as RAIDType | '')}
          >
            <option value="">All Types</option>
            <option value={RAIDType.RISK}>Risk</option>
            <option value={RAIDType.ASSUMPTION}>Assumption</option>
            <option value={RAIDType.ISSUE}>Issue</option>
            <option value={RAIDType.DEPENDENCY}>Dependency</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="filter-status">Status</label>
          <select
            id="filter-status"
            value={filters.status || ''}
            onChange={(e) => handleStatusChange(e.target.value as RAIDStatus | '')}
          >
            <option value="">All Statuses</option>
            <option value={RAIDStatus.OPEN}>Open</option>
            <option value={RAIDStatus.IN_PROGRESS}>In Progress</option>
            <option value={RAIDStatus.MITIGATED}>Mitigated</option>
            <option value={RAIDStatus.CLOSED}>Closed</option>
            <option value={RAIDStatus.ACCEPTED}>Accepted</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="filter-priority">Priority</label>
          <select
            id="filter-priority"
            value={filters.priority || ''}
            onChange={(e) => handlePriorityChange(e.target.value as RAIDPriority | '')}
          >
            <option value="">All Priorities</option>
            <option value={RAIDPriority.LOW}>Low</option>
            <option value={RAIDPriority.MEDIUM}>Medium</option>
            <option value={RAIDPriority.HIGH}>High</option>
            <option value={RAIDPriority.CRITICAL}>Critical</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="filter-owner">Owner</label>
          <select
            id="filter-owner"
            value={filters.owner || ''}
            onChange={(e) => handleOwnerChange(e.target.value)}
          >
            <option value="">All Owners</option>
            {owners.map((owner) => (
              <option key={owner} value={owner}>
                {owner}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="filter-date-from">Due Date From</label>
          <input
            id="filter-date-from"
            type="date"
            value={filters.dueDateFrom || ''}
            onChange={(e) => handleDueDateFromChange(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="filter-date-to">Due Date To</label>
          <input
            id="filter-date-to"
            type="date"
            value={filters.dueDateTo || ''}
            onChange={(e) => handleDueDateToChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
