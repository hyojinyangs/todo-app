/**
 * useCalendar Hook
 *
 * Custom hook that manages calendar state and provides date utilities.
 * Handles month navigation, day statistics, and date checking.
 */

import { useState, useMemo, useCallback } from 'react';
import {
  generateCalendarDays,
  calculateMonthStats,
  calculateDayStats,
  isSameDay,
  isInMonth
} from '../utils/dateUtils';

/**
 * Hook for managing calendar state and operations
 * @param {Array<Todo>} todos - All todos
 * @param {number|null} selectedDate - Currently selected date timestamp
 * @returns {Object} Calendar state and utilities
 */
export function useCalendar(todos, selectedDate) {
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());

  // Generate calendar days for current month
  const calendarDays = useMemo(() => {
    return generateCalendarDays(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  // Calculate statistics for current month
  const monthStats = useMemo(() => {
    return calculateMonthStats(todos, currentYear, currentMonth);
  }, [todos, currentYear, currentMonth]);

  // Get statistics for a specific day
  const getDayStats = useCallback((date) => {
    return calculateDayStats(todos, date);
  }, [todos]);

  // Navigation: Previous month
  const goToPreviousMonth = useCallback(() => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  }, [currentMonth]);

  // Navigation: Next month
  const goToNextMonth = useCallback(() => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  }, [currentMonth]);

  // Navigation: Jump to today
  const goToToday = useCallback(() => {
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  }, []);

  // Check if a date is today
  const isToday = useCallback((date) => {
    return isSameDay(date, Date.now());
  }, []);

  // Check if a date is selected
  const isSelected = useCallback((date) => {
    return selectedDate ? isSameDay(date, selectedDate) : false;
  }, [selectedDate]);

  // Check if a date is in the current month
  const isCurrentMonth = useCallback((date) => {
    return isInMonth(date, currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  return {
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
  };
}
