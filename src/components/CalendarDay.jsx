/**
 * CalendarDay Component
 *
 * Individual day cell in the calendar grid.
 * Shows day number and todo count indicator.
 * Color-coded by completion status.
 */

import './CalendarDay.css';

/**
 * CalendarDay - Individual day cell with todo indicators
 * @param {Object} props
 * @param {number} props.date - Day timestamp
 * @param {Object} props.stats - Day statistics (total, completed, active)
 * @param {boolean} props.isToday - Whether this is today
 * @param {boolean} props.isSelected - Whether this day is selected
 * @param {boolean} props.isCurrentMonth - Whether this day is in the displayed month
 * @param {Function} props.onClick - Click handler
 */
export function CalendarDay({
  date,
  stats,
  isToday,
  isSelected,
  isCurrentMonth,
  onClick
}) {
  const dayNumber = new Date(date).getDate();
  const isEmpty = stats.total === 0;
  const isAllComplete = stats.total > 0 && stats.completed === stats.total;
  const isPartialComplete = stats.completed > 0 && stats.completed < stats.total;

  const getStatusClass = () => {
    if (isEmpty) return '';
    if (isAllComplete) return 'calendar-day--complete';
    if (isPartialComplete) return 'calendar-day--partial';
    return 'calendar-day--incomplete';
  };

  return (
    <button
      className={`calendar-day ${getStatusClass()} ${
        isToday ? 'calendar-day--today' : ''
      } ${isSelected ? 'calendar-day--selected' : ''} ${
        !isCurrentMonth ? 'calendar-day--other-month' : ''
      }`}
      onClick={onClick}
      aria-label={`${new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })}. ${stats.total} todos, ${stats.completed} completed`}
    >
      <span className="calendar-day-number">{dayNumber}</span>

      {!isEmpty && (
        <span className="calendar-day-badge">
          {stats.total}
        </span>
      )}
    </button>
  );
}
