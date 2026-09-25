import React from 'react';
import { Select } from '../ui/Input';
import { STATUS_LABELS, PRIORITY_LABELS } from '../../utils/constants';
import { useFilters } from '../../hooks/useFilters';

export function TaskFilters() {
  const { getFilter, setFilter, clearFilters } = useFilters();

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    ...Object.entries(STATUS_LABELS).map(([v, l]) => ({ value: v, label: l })),
  ];

  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    ...Object.entries(PRIORITY_LABELS).map(([v, l]) => ({ value: v, label: l })),
  ];

  const overdueOptions = [
    { value: '', label: 'All Tasks' },
    { value: 'true', label: 'Overdue Only' },
  ];

  return (
    <div className="filter-bar">
      <Select
        id="filter-status"
        options={statusOptions}
        value={getFilter('status')}
        onChange={(e) => setFilter('status', e.target.value)}
        label=""
      />
      <Select
        id="filter-priority"
        options={priorityOptions}
        value={getFilter('priority')}
        onChange={(e) => setFilter('priority', e.target.value)}
        label=""
      />
      <Select
        id="filter-overdue"
        options={overdueOptions}
        value={getFilter('isOverdue')}
        onChange={(e) => setFilter('isOverdue', e.target.value)}
        label=""
      />
      {(getFilter('status') || getFilter('priority') || getFilter('isOverdue')) && (
        <button className="btn btn-ghost btn-sm" onClick={clearFilters}>Clear</button>
      )}
    </div>
  );
}
