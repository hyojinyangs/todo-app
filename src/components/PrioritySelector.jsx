/**
 * PrioritySelector Component
 *
 * Apple-style segmented control for selecting todo priority.
 * Provides three options: High, Medium, Low with visual indicators.
 */

import { PRIORITY_CONFIG } from '../types/todo';
import './PrioritySelector.css';

/**
 * PrioritySelector - Segmented control for priority selection
 * @param {Object} props
 * @param {string} props.value - Current selected priority ('high' | 'medium' | 'low')
 * @param {Function} props.onChange - Callback when priority changes
 * @param {boolean} props.disabled - Whether the selector is disabled
 */
export function PrioritySelector({ value = 'medium', onChange, disabled = false }) {
  const priorities = ['high', 'medium', 'low'];

  return (
    <div className="priority-selector" role="radiogroup" aria-label="Priority level">
      {priorities.map((priority) => {
        const config = PRIORITY_CONFIG[priority];
        const isSelected = value === priority;

        return (
          <button
            key={priority}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={config.ariaLabel}
            className={`priority-button priority-button--${priority} ${
              isSelected ? 'selected' : ''
            }`}
            onClick={() => onChange(priority)}
            disabled={disabled}
          >
            <span className="priority-button-emoji" aria-hidden="true">
              {config.emoji}
            </span>
            <span className="priority-button-label">{config.label}</span>
          </button>
        );
      })}
    </div>
  );
}
