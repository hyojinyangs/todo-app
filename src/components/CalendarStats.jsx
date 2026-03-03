/**
 * CalendarStats Component
 *
 * Monthly statistics panel showing completion rate,
 * streak, and productivity metrics.
 */

import './CalendarStats.css';

/**
 * CalendarStats - Monthly statistics panel
 * @param {Object} props
 * @param {Object} props.stats - Month statistics
 * @param {number} props.stats.completionRate - Completion percentage (0-100)
 * @param {number} props.stats.completedTodos - Number of completed todos
 * @param {number} props.stats.totalTodos - Total todos in month
 * @param {number} props.stats.currentStreak - Current streak in days
 * @param {number|null} props.stats.mostProductiveDay - Day number with most completions
 */
export function CalendarStats({ stats }) {
  return (
    <div className="calendar-stats">
      <div className="calendar-stat">
        <span className="calendar-stat-label">Completion Rate</span>
        <span className="calendar-stat-value">
          {stats.completionRate}%
        </span>
      </div>

      <div className="calendar-stat">
        <span className="calendar-stat-label">Completed</span>
        <span className="calendar-stat-value">
          {stats.completedTodos}/{stats.totalTodos}
        </span>
      </div>

      <div className="calendar-stat">
        <span className="calendar-stat-label">Current Streak</span>
        <span className="calendar-stat-value">
          {stats.currentStreak} {stats.currentStreak === 1 ? 'day' : 'days'}
        </span>
      </div>

      {stats.mostProductiveDay && (
        <div className="calendar-stat">
          <span className="calendar-stat-label">Most Productive</span>
          <span className="calendar-stat-value">
            Day {stats.mostProductiveDay}
          </span>
        </div>
      )}
    </div>
  );
}
