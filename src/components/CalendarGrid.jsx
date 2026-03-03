/**
 * CalendarGrid Component
 *
 * 7×5-6 grid of calendar days with weekday headers.
 * Displays the monthly calendar layout.
 */

import { CalendarDay } from './CalendarDay';
import './CalendarGrid.css';

/**
 * CalendarGrid - Grid of calendar days
 * @param {Object} props
 * @param {Array<number>} props.days - Array of day timestamps
 * @param {Function} props.onDayClick - Day click handler
 * @param {Function} props.getDayStats - Get statistics for a day
 * @param {Function} props.isToday - Check if day is today
 * @param {Function} props.isSelected - Check if day is selected
 * @param {Function} props.isCurrentMonth - Check if day is in current month
 */
export function CalendarGrid({
  days,
  onDayClick,
  getDayStats,
  isToday,
  isSelected,
  isCurrentMonth
}) {
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="calendar-grid">
      {/* Week day headers */}
      <div className="calendar-weekdays">
        {weekDays.map(day => (
          <div key={day} className="calendar-weekday">
            {day}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="calendar-days">
        {days.map(date => {
          const stats = getDayStats(date);
          return (
            <CalendarDay
              key={date}
              date={date}
              stats={stats}
              isToday={isToday(date)}
              isSelected={isSelected(date)}
              isCurrentMonth={isCurrentMonth(date)}
              onClick={() => onDayClick(date)}
            />
          );
        })}
      </div>
    </div>
  );
}
