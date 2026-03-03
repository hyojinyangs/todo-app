/**
 * TodoInput Component
 *
 * Handles the creation of new todos.
 * Features:
 * - Form submission with validation
 * - Clear visual feedback
 * - Keyboard accessibility (Enter to submit)
 */

import { useState, useCallback } from 'react';
import { PrioritySelector } from './PrioritySelector';
import './TodoInput.css';

/**
 * @param {Object} props
 * @param {(text: string, priority: string, dueDate: number|null) => boolean} props.onAdd - Callback when a todo is added
 */
export function TodoInput({ onAdd }) {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();

      const trimmedText = text.trim();
      if (!trimmedText) {
        return;
      }

      setIsSubmitting(true);

      // Convert date string to timestamp if provided
      const dueDateTimestamp = dueDate ? new Date(dueDate).getTime() : null;

      // Call the add function and check if successful
      const success = onAdd(trimmedText, priority, dueDateTimestamp);

      if (success) {
        setText('');
        setPriority('medium'); // Reset to default after adding
        setDueDate(''); // Reset date
      }

      setIsSubmitting(false);
    },
    [text, priority, dueDate, onAdd]
  );

  const handleChange = useCallback((event) => {
    setText(event.target.value);
  }, []);

  const handlePriorityChange = useCallback((newPriority) => {
    setPriority(newPriority);
  }, []);

  const handleDateChange = useCallback((event) => {
    setDueDate(event.target.value);
  }, []);

  return (
    <form className="todo-input-form" onSubmit={handleSubmit}>
      <PrioritySelector
        value={priority}
        onChange={handlePriorityChange}
        disabled={isSubmitting}
      />

      <div className="todo-date-picker">
        <label htmlFor="todo-date-input" className="todo-date-label">
          Due Date (Optional)
        </label>
        <input
          id="todo-date-input"
          type="date"
          className="todo-date-input"
          value={dueDate}
          onChange={handleDateChange}
          disabled={isSubmitting}
        />
      </div>

      <div className="todo-input-row">
        <label htmlFor="todo-input" className="visually-hidden">
          What needs to be done?
        </label>
        <input
          id="todo-input"
          type="text"
          className="todo-input"
          placeholder="What needs to be done?"
          value={text}
          onChange={handleChange}
          disabled={isSubmitting}
          maxLength={500}
          autoComplete="off"
          aria-describedby="todo-input-hint"
        />
        <span id="todo-input-hint" className="visually-hidden">
          Press Enter or click Add to create a new todo
        </span>
        <button
          type="submit"
          className="todo-input-button"
          disabled={isSubmitting || !text.trim()}
          aria-label="Add todo"
        >
          Add
        </button>
      </div>
    </form>
  );
}
