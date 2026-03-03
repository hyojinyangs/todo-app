/**
 * CalendarView Component
 *
 * Main calendar container that displays monthly view,
 * statistics, and handles date selection.
 */

import { useCalendar } from '../hooks/useCalendar';
import { CalendarHeader } from './CalendarHeader';
import { CalendarGrid } from './CalendarGrid';
import { CalendarStats } from './CalendarStats';
import './CalendarView.css';

/**
 * CalendarView - Main calendar container
 * @param {Object} props
 * @param {Array<Todo>} props.todos - All todos
 * @param {Function} props.onDateSelect - Date selection callback
 * @param {number|null} props.selectedDate - Currently selected date
 */
export function CalendarView({ todos, onDateSelect, selectedDate }) {
  const {
    currentMonth,
    currentYear,
    calendarDays,
    monthStats,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    getDayStats,
    isToday,
    isSelected,
    isCurrentMonth
  } = useCalendar(todos, selectedDate);

  return (
    <div className="calendar-view">
      <CalendarHeader
        month={currentMonth}
        year={currentYear}
        onPrevious={goToPreviousMonth}
        onNext={goToNextMonth}
        onToday={goToToday}
      />

      <CalendarGrid
        days={calendarDays}
        onDayClick={onDateSelect}
        getDayStats={getDayStats}
        isToday={isToday}
        isSelected={isSelected}
        isCurrentMonth={isCurrentMonth}
      />

      <CalendarStats stats={monthStats} />
    </div>
  );
}
