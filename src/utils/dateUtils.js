/**
 * Date Utility Functions for Calendar Operations
 *
 * Provides comprehensive date manipulation and calculation utilities
 * for the calendar tracker feature.
 */

/**
 * Check if two timestamps are on the same day
 * @param {number} timestamp1 - First timestamp
 * @param {number} timestamp2 - Second timestamp
 * @returns {boolean} True if same day
 */
export function isSameDay(timestamp1, timestamp2) {
  const d1 = new Date(timestamp1);
  const d2 = new Date(timestamp2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/**
 * Get start of day timestamp (00:00:00.000)
 * @param {number} timestamp - Input timestamp
 * @returns {number} Start of day timestamp
 */
export function getStartOfDay(timestamp) {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/**
 * Get end of day timestamp (23:59:59.999)
 * @param {number} timestamp - Input timestamp
 * @returns {number} End of day timestamp
 */
export function getEndOfDay(timestamp) {
  const date = new Date(timestamp);
  date.setHours(23, 59, 59, 999);
  return date.getTime();
}

/**
 * Generate calendar days for a month
 * Returns array of timestamps for each day to display
 * Includes leading/trailing days from adjacent months for grid layout
 *
 * @param {number} year - Year (e.g., 2026)
 * @param {number} month - Month (0-11)
 * @returns {number[]} Array of day timestamps
 */
export function generateCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday
  const daysInMonth = lastDay.getDate();

  const days = [];

  // Add previous month's trailing days
  for (let i = 0; i < startingDayOfWeek; i++) {
    const date = new Date(year, month, 0 - (startingDayOfWeek - i - 1));
    days.push(date.getTime());
  }

  // Add current month's days
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    days.push(date.getTime());
  }

  // Add next month's leading days to complete the grid
  const remainingCells = 35 - days.length; // Minimum 5 weeks
  for (let i = 1; i <= remainingCells; i++) {
    const date = new Date(year, month + 1, i);
    days.push(date.getTime());
  }

  // If we need 6 weeks (42 cells), add more
  if (days.length < 42 && days.length > 35) {
    const additionalDays = 42 - days.length;
    for (let i = 1; i <= additionalDays; i++) {
      const date = new Date(year, month + 1, remainingCells + i);
      days.push(date.getTime());
    }
  }

  return days;
}

/**
 * Calculate statistics for a specific day
 * @param {Array<Todo>} todos - All todos
 * @param {number} date - Day timestamp
 * @returns {Object} Day statistics
 */
export function calculateDayStats(todos, date) {
  const startOfDay = getStartOfDay(date);
  const endOfDay = getEndOfDay(date);

  const dayTodos = todos.filter(todo => {
    const todoDate = todo.dueDate || todo.createdAt;
    return todoDate >= startOfDay && todoDate <= endOfDay;
  });

  return {
    total: dayTodos.length,
    completed: dayTodos.filter(t => t.completed).length,
    active: dayTodos.filter(t => !t.completed).length,
    todos: dayTodos
  };
}

/**
 * Calculate statistics for a month
 * @param {Array<Todo>} todos - All todos
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 * @returns {Object} Month statistics
 */
export function calculateMonthStats(todos, year, month) {
  const firstDay = new Date(year, month, 1).getTime();
  const lastDay = new Date(year, month + 1, 0, 23, 59, 59, 999).getTime();

  const monthTodos = todos.filter(todo => {
    const todoDate = todo.completedDate || todo.dueDate || todo.createdAt;
    return todoDate >= firstDay && todoDate <= lastDay;
  });

  const completed = monthTodos.filter(t => t.completed);
  const completionRate = monthTodos.length > 0
    ? Math.round((completed.length / monthTodos.length) * 100)
    : 0;

  // Calculate streak (consecutive days with completed todos)
  const streak = calculateStreak(todos, year, month);

  // Find most productive day
  const productivityMap = {};
  completed.forEach(todo => {
    const day = new Date(todo.completedDate || todo.updatedAt).getDate();
    productivityMap[day] = (productivityMap[day] || 0) + 1;
  });

  const mostProductiveDay = Object.entries(productivityMap)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  return {
    totalTodos: monthTodos.length,
    completedTodos: completed.length,
    completionRate,
    currentStreak: streak,
    mostProductiveDay: mostProductiveDay ? parseInt(mostProductiveDay) : null
  };
}

/**
 * Calculate current streak of days with completed todos
 * @param {Array<Todo>} todos - All todos
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 * @returns {number} Streak count
 */
export function calculateStreak(todos, year, month) {
  const today = new Date();
  let streak = 0;
  let currentDate = new Date(today);

  // Only count streak within current month
  const firstDayOfMonth = new Date(year, month, 1);

  while (currentDate >= firstDayOfMonth) {
    const dayStats = calculateDayStats(todos, currentDate.getTime());

    if (dayStats.completed > 0) {
      streak++;
    } else {
      break; // Streak broken
    }

    // Move to previous day
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
}

/**
 * Format date for display
 * @param {number} timestamp - Timestamp to format
 * @param {string} format - Format type ('short' | 'long')
 * @returns {string} Formatted date string
 */
export function formatDate(timestamp, format = 'long') {
  const date = new Date(timestamp);

  if (format === 'short') {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Get month name from month number
 * @param {number} month - Month (0-11)
 * @returns {string} Month name
 */
export function getMonthName(month) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return monthNames[month];
}

/**
 * Check if a date is in the current month
 * @param {number} timestamp - Date timestamp
 * @param {number} year - Target year
 * @param {number} month - Target month (0-11)
 * @returns {boolean} True if in current month
 */
export function isInMonth(timestamp, year, month) {
  const date = new Date(timestamp);
  return date.getFullYear() === year && date.getMonth() === month;
}

/**
 * Get todos for a specific date
 * @param {Array<Todo>} todos - All todos
 * @param {number} date - Date timestamp
 * @returns {Array<Todo>} Todos for that date
 */
export function getTodosForDate(todos, date) {
  const startOfDay = getStartOfDay(date);
  const endOfDay = getEndOfDay(date);

  return todos.filter(todo => {
    const todoDate = todo.dueDate || todo.createdAt;
    return todoDate >= startOfDay && todoDate <= endOfDay;
  });
}
