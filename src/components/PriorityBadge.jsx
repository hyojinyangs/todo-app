/**
 * PriorityBadge Component
 *
 * Compact badge displaying todo priority level.
 * Clickable to cycle through priorities: high → medium → low → high
 */

import { PRIORITY_CONFIG } from '../types/todo';
import './PriorityBadge.css';

/**
 * PriorityBadge - Displays and allows changing todo priority
 * @param {Object} props
 * @param {string} props.priority - Current priority ('high' | 'medium' | 'low')
 * @param {Function} props.onClick - Callback with new priority when clicked
 * @param {boolean} props.disabled - Whether the badge is disabled
 * @param {boolean} props.readonly - Show badge but don't allow changes
 */
export function PriorityBadge({
  priority,
  onClick,
  disabled = false,
  readonly = false
}) {
  const config = PRIORITY_CONFIG[priority];

  const handleClick = () => {
    if (readonly || disabled) return;

    // Cycle through priorities: high → medium → low → high
    const nextPriority = {
      high: 'medium',
      medium: 'low',
      low: 'high',
    }[priority];

    onClick(nextPriority);
  };

  const isClickable = !readonly && !disabled;

  return (
    <button
      type="button"
      className={`priority-badge priority-badge--${priority} ${
        readonly ? 'priority-badge--readonly' : ''
      }`}
      onClick={handleClick}
      disabled={disabled || readonly}
      aria-label={
        isClickable
          ? `${config.ariaLabel}. Click to change priority.`
          : config.ariaLabel
      }
      title={isClickable ? 'Click to change priority' : undefined}
    >
      <span className="priority-badge-emoji" aria-hidden="true">
        {config.emoji}
      </span>
      <span className="priority-badge-text">{config.label.toUpperCase()}</span>
    </button>
  );
}
