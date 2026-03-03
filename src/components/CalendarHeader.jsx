/**
 * CalendarHeader Component
 *
 * Month/Year display and navigation controls.
 * Allows users to navigate between months and jump to today.
 */

import { getMonthName } from '../utils/dateUtils';
import './CalendarHeader.css';

/**
 * CalendarHeader - Month/Year display with navigation
 * @param {Object} props
 * @param {number} props.month - Current month (0-11)
 * @param {number} props.year - Current year
 * @param {Function} props.onPrevious - Previous month handler
 * @param {Function} props.onNext - Next month handler
 * @param {Function} props.onToday - Today button handler
 */
export function CalendarHeader({ month, year, onPrevious, onNext, onToday }) {
  return (
    <div className="calendar-header">
      <button
        className="calendar-nav-button"
        onClick={onPrevious}
        aria-label="Previous month"
      >
        ←
      </button>

      <h2 className="calendar-title">
        {getMonthName(month)} {year}
      </h2>

      <button
        className="calendar-nav-button"
        onClick={onNext}
        aria-label="Next month"
      >
        →
      </button>

      <button
        className="calendar-today-button"
        onClick={onToday}
      >
        Today
      </button>
    </div>
  );
}
