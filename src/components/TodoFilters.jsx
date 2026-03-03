/**
 * TodoFilters Component
 *
 * Provides filtering controls and summary statistics.
 * Features:
 * - Filter buttons with active state
 * - Item count display
 * - Clear completed action
 * - Accessible button group
 */

import { FILTER_TYPES } from '../types/todo';
import './TodoFilters.css';

/**
 * @param {Object} props
 * @param {import('../types/todo').FilterType} props.filter - Current active filter
 * @param {(filter: import('../types/todo').FilterType) => void} props.onFilterChange - Filter change callback
 * @param {number} props.activeCount - Number of active todos
 * @param {number} props.completedCount - Number of completed todos
 * @param {number} props.totalCount - Total number of todos
 * @param {() => void} props.onClearCompleted - Clear completed callback
 */
export function TodoFilters({
  filter,
  onFilterChange,
  activeCount,
  completedCount,
  totalCount,
  onClearCompleted,
}) {
  // Don't render if there are no todos
  if (totalCount === 0) {
    return null;
  }

  const filterButtons = [
    { value: FILTER_TYPES.ALL, label: 'All' },
    { value: FILTER_TYPES.ACTIVE, label: 'Active' },
    { value: FILTER_TYPES.COMPLETED, label: 'Completed' },
  ];

  return (
    <div className="todo-filters">
      <div className="todo-filters-count" aria-live="polite">
        <strong>{activeCount}</strong> {activeCount === 1 ? 'item' : 'items'} left
      </div>

      <div
        className="todo-filters-buttons"
        role="group"
        aria-label="Filter todos"
      >
        {filterButtons.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            className={`todo-filter-button ${filter === value ? 'todo-filter-button--active' : ''}`}
            onClick={() => onFilterChange(value)}
            aria-pressed={filter === value}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="todo-filters-actions">
        {completedCount > 0 && (
          <button
            type="button"
            className="todo-clear-button"
            onClick={onClearCompleted}
            aria-label={`Clear ${completedCount} completed ${completedCount === 1 ? 'item' : 'items'}`}
          >
            Clear completed
          </button>
        )}
      </div>
    </div>
  );
}
