/**
 * TodoList Component
 *
 * Renders the list of todos with:
 * - Empty state handling
 * - Proper list semantics for accessibility
 * - Animation-ready structure
 */

import { TodoItem } from './TodoItem';
import './TodoList.css';

/**
 * @param {Object} props
 * @param {Array<import('../types/todo').Todo>} props.todos - Array of todos to display
 * @param {(id: string) => void} props.onToggle - Toggle completion callback
 * @param {(id: string) => void} props.onDelete - Delete callback
 * @param {(id: string, text: string) => boolean} props.onEdit - Edit callback
 * @param {(id: string, priority: string) => void} props.onUpdatePriority - Update priority callback
 * @param {string} props.filter - Current filter for empty state messaging
 */
export function TodoList({ todos, onToggle, onDelete, onEdit, onUpdatePriority, filter }) {
  if (todos.length === 0) {
    return (
      <div className="todo-list-empty" role="status" aria-live="polite">
        <EmptyStateIcon />
        <p className="todo-list-empty-text">
          {getEmptyMessage(filter)}
        </p>
      </div>
    );
  }

  return (
    <ul className="todo-list" aria-label="Todo list">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
          onUpdatePriority={onUpdatePriority}
        />
      ))}
    </ul>
  );
}

/**
 * Returns appropriate empty state message based on filter
 * @param {string} filter - Current filter
 * @returns {string} Empty state message
 */
function getEmptyMessage(filter) {
  switch (filter) {
    case 'active':
      return 'No active todos. Great job!';
    case 'completed':
      return 'No completed todos yet.';
    default:
      return 'No todos yet. Add one above to get started!';
  }
}

/**
 * Empty state illustration
 */
function EmptyStateIcon() {
  return (
    <svg
      className="todo-list-empty-icon"
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="60" cy="60" r="50" stroke="currentColor" strokeWidth="2" opacity="0.2" />
      <rect x="35" y="40" width="50" height="8" rx="2" fill="currentColor" opacity="0.15" />
      <rect x="35" y="56" width="40" height="8" rx="2" fill="currentColor" opacity="0.15" />
      <rect x="35" y="72" width="30" height="8" rx="2" fill="currentColor" opacity="0.15" />
      <circle cx="28" cy="44" r="4" stroke="currentColor" strokeWidth="2" opacity="0.3" />
      <circle cx="28" cy="60" r="4" stroke="currentColor" strokeWidth="2" opacity="0.3" />
      <circle cx="28" cy="76" r="4" stroke="currentColor" strokeWidth="2" opacity="0.3" />
    </svg>
  );
}
