import { useTranslation } from 'react-i18next';
import type { TableFilter } from '../types/table';
import './TableFilters.css';

interface TableFiltersProps<T> {
  filters: Array<TableFilter<T>>;
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

export default function TableFilters<T>({ filters, values, onChange }: TableFiltersProps<T>) {
  const { t } = useTranslation();

  return (
    <div className="table-filters" role="search">
      {filters.map((filter) => (
        <div key={filter.key} className="table-filter-item">
          {filter.type === 'search' ? (
            <input
              type="text"
              value={values[filter.key] || ''}
              placeholder={filter.placeholder || filter.label}
              aria-label={filter.label}
              onChange={(e) => onChange(filter.key, e.target.value)}
              className="table-filter-input"
            />
          ) : (
            <select
              value={values[filter.key] || ''}
              aria-label={filter.label}
              onChange={(e) => onChange(filter.key, e.target.value)}
              className="table-filter-select"
            >
              <option value="">{t('table.all')}</option>
              {filter.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </div>
      ))}
    </div>
  );
}
