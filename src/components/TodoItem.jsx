/**
 * TodoItem Component
 *
 * Displays a single todo with actions for:
 * - Toggling completion
 * - Inline editing
 * - Deletion
 *
 * Features:
 * - Double-click to edit
 * - Escape to cancel edit
 * - Enter to save edit
 * - Keyboard accessible
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { PriorityBadge } from './PriorityBadge';
import './TodoItem.css';

/**
 * @param {Object} props
 * @param {import('../types/todo').Todo} props.todo - The todo item
 * @param {(id: string) => void} props.onToggle - Toggle completion callback
 * @param {(id: string) => void} props.onDelete - Delete callback
 * @param {(id: string, text: string) => boolean} props.onEdit - Edit callback
 * @param {(id: string, priority: string) => void} props.onUpdatePriority - Update priority callback
 */
export function TodoItem({ todo, onToggle, onDelete, onEdit, onUpdatePriority }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const editInputRef = useRef(null);

  // Focus the edit input when entering edit mode
  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

  const handleToggle = useCallback(() => {
    onToggle(todo.id);
  }, [todo.id, onToggle]);

  const handleDelete = useCallback(() => {
    onDelete(todo.id);
  }, [todo.id, onDelete]);

  const handleDoubleClick = useCallback(() => {
    if (!todo.completed) {
      setIsEditing(true);
      setEditText(todo.text);
    }
  }, [todo.completed, todo.text]);

  const handleEditChange = useCallback((event) => {
    setEditText(event.target.value);
  }, []);

  const handleEditSubmit = useCallback(() => {
    const trimmed = editText.trim();

    if (!trimmed) {
      // If empty, revert to original
      setEditText(todo.text);
      setIsEditing(false);
      return;
    }

    if (trimmed !== todo.text) {
      const success = onEdit(todo.id, trimmed);
      if (!success) {
        // If edit failed, revert
        setEditText(todo.text);
      }
    }

    setIsEditing(false);
  }, [editText, todo.id, todo.text, onEdit]);

  const handleEditKeyDown = useCallback(
    (event) => {
      if (event.key === 'Enter') {
        handleEditSubmit();
      } else if (event.key === 'Escape') {
        setEditText(todo.text);
        setIsEditing(false);
      }
    },
    [handleEditSubmit, todo.text]
  );

  const handleEditBlur = useCallback(() => {
    handleEditSubmit();
  }, [handleEditSubmit]);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleToggle();
      }
    },
    [handleToggle]
  );

  const handlePriorityChange = useCallback(
    (newPriority) => {
      onUpdatePriority(todo.id, newPriority);
    },
    [todo.id, onUpdatePriority]
  );

  return (
    <li className={`todo-item ${todo.completed ? 'todo-item--completed' : ''}`}>
      {isEditing ? (
        <div className="todo-item-edit-wrapper">
          <input
            ref={editInputRef}
            type="text"
            className="todo-item-edit-input"
            value={editText}
            onChange={handleEditChange}
            onKeyDown={handleEditKeyDown}
            onBlur={handleEditBlur}
            maxLength={500}
            aria-label="Edit todo text"
          />
        </div>
      ) : (
        <>
          <div className="todo-item-content">
            <label className="todo-item-checkbox-wrapper">
              <input
                type="checkbox"
                className="todo-item-checkbox"
                checked={todo.completed}
                onChange={handleToggle}
                aria-label={`Mark "${todo.text}" as ${todo.completed ? 'incomplete' : 'complete'}`}
              />
              <span className="todo-item-checkbox-custom" aria-hidden="true">
                {todo.completed && (
                  <svg
                    className="todo-item-check-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </span>
            </label>
            <span
              className="todo-item-text"
              onDoubleClick={handleDoubleClick}
              onKeyDown={handleKeyDown}
              tabIndex={0}
              role="button"
              aria-label={`${todo.text}. Double-click to edit.`}
            >
              {todo.text}
            </span>
            <PriorityBadge
              priority={todo.priority}
              onClick={handlePriorityChange}
              readonly={todo.completed}
            />
          </div>
          <div className="todo-item-actions">
            <button
              type="button"
              className="todo-item-edit-button"
              onClick={handleDoubleClick}
              disabled={todo.completed}
              aria-label={`Edit "${todo.text}"`}
            >
              Edit
            </button>
            <button
              type="button"
              className="todo-item-delete-button"
              onClick={handleDelete}
              aria-label={`Delete "${todo.text}"`}
            >
              Delete
            </button>
          </div>
        </>
      )}
    </li>
  );
}
