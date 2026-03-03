/**
 * TodoHeader Component
 *
 * Application header with:
 * - Title
 * - Toggle all checkbox (when todos exist)
 * - Subtle branding
 */

import './TodoHeader.css';

/**
 * @param {Object} props
 * @param {number} props.totalCount - Total number of todos
 * @param {boolean} props.allCompleted - Whether all todos are completed
 * @param {() => void} props.onToggleAll - Toggle all callback
 */
export function TodoHeader({ totalCount, allCompleted, onToggleAll }) {
  return (
    <header className="todo-header">
      <h1 className="todo-header-title">
        <span className="todo-header-icon" aria-hidden="true">
          <ChecklistIcon />
        </span>
        Todo App
      </h1>

      {totalCount > 0 && (
        <label className="todo-header-toggle">
          <input
            type="checkbox"
            className="todo-header-toggle-input"
            checked={allCompleted}
            onChange={onToggleAll}
            aria-label={allCompleted ? 'Mark all as incomplete' : 'Mark all as complete'}
          />
          <span className="todo-header-toggle-custom" aria-hidden="true">
            <ToggleIcon checked={allCompleted} />
          </span>
          <span className="todo-header-toggle-text">
            {allCompleted ? 'Uncheck all' : 'Check all'}
          </span>
        </label>
      )}
    </header>
  );
}

/**
 * Checklist icon for header
 */
function ChecklistIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

/**
 * Toggle icon with checked state
 * @param {Object} props
 * @param {boolean} props.checked - Whether checked
 */
function ToggleIcon({ checked }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {checked ? (
        <>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </>
      ) : (
        <circle cx="12" cy="12" r="10" />
      )}
    </svg>
  );
}
