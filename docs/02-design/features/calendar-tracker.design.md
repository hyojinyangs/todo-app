# Design: Calendar Tracker Feature

**Feature Name**: calendar-tracker
**Created**: 2026-03-03
**Status**: Design
**Plan Reference**: [calendar-tracker.plan.md](../../01-plan/features/calendar-tracker.plan.md)

---

## 1. Architecture Overview

### 1.1 System Context

```
┌─────────────────────────────────────────────────────┐
│                    Todo App                         │
│  ┌──────────────┐  ┌─────────────────────────────┐ │
│  │   TodoList   │  │      CalendarView           │ │
│  │  (existing)  │←→│        (NEW)                │ │
│  └──────────────┘  └─────────────────────────────┘ │
│         ↓                      ↓                    │
│  ┌──────────────────────────────────────────────┐  │
│  │           useTodos Hook (extended)            │  │
│  └──────────────────────────────────────────────┘  │
│         ↓                                           │
│  ┌──────────────────────────────────────────────┐  │
│  │     storageService (with date support)        │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### 1.2 Layer Assignment

Following the existing 4-layer clean architecture:

| Layer | Components | Responsibility |
|-------|------------|----------------|
| **Domain** | `types/todo.js` (extended) | Add dueDate, completedDate to Todo type |
| **Infrastructure** | `services/storageService.js`, `utils/dateUtils.js` | Date persistence, calculations |
| **Application** | `hooks/useTodos.js` (extended), `hooks/useCalendar.js` | State management, date filtering |
| **Presentation** | `CalendarView.jsx`, `CalendarGrid.jsx`, `CalendarDay.jsx`, etc. | UI components |

---

## 2. Data Model Design

### 2.1 Extended Todo Type

```javascript
/**
 * @typedef {Object} Todo
 * @property {string} id - Unique identifier
 * @property {string} text - Todo text content
 * @property {boolean} completed - Completion status
 * @property {'high'|'medium'|'low'} priority - Priority level
 * @property {number|null} dueDate - Due date timestamp (optional)
 * @property {number|null} completedDate - Completion timestamp (optional)
 * @property {number} createdAt - Creation timestamp
 * @property {number} updatedAt - Last update timestamp
 */
```

### 2.2 Calendar State Type

```javascript
/**
 * @typedef {Object} CalendarState
 * @property {number} currentMonth - Month (0-11)
 * @property {number} currentYear - Year (e.g., 2026)
 * @property {number|null} selectedDate - Selected date timestamp
 * @property {boolean} isCalendarVisible - Calendar panel visibility
 */

/**
 * @typedef {Object} DayStats
 * @property {number} total - Total todos for the day
 * @property {number} completed - Completed todos
 * @property {number} active - Active todos
 * @property {Array<Todo>} todos - List of todos for the day
 */

/**
 * @typedef {Object} MonthStats
 * @property {number} totalTodos - Total todos in month
 * @property {number} completedTodos - Completed todos in month
 * @property {number} completionRate - Completion percentage (0-100)
 * @property {number} currentStreak - Consecutive days with completed todos
 * @property {number|null} mostProductiveDay - Day number with most completions
 */
```

### 2.3 Migration Strategy

```javascript
/**
 * Migration logic for existing todos
 * Runs once on first load after update
 */
function migrateTodosWithDates(todos) {
  return todos.map(todo => ({
    ...todo,
    dueDate: todo.dueDate ?? null,
    completedDate: todo.completed && !todo.completedDate
      ? todo.updatedAt  // Use updatedAt as fallback
      : (todo.completedDate ?? null)
  }));
}
```

---

## 3. Component Design

### 3.1 Component Tree

```
App
├── TodoHeader
├── TodoInput (extended with DatePicker)
├── CalendarView (NEW)
│   ├── CalendarHeader
│   │   ├── MonthYearDisplay
│   │   └── NavigationButtons
│   ├── CalendarGrid
│   │   └── CalendarDay (×35-42 cells)
│   ├── CalendarStats
│   └── DayDetailModal (conditional)
├── TodoList (with date filtering)
└── TodoFilters
```

### 3.2 CalendarView Component

**File**: `src/components/CalendarView.jsx`

```javascript
/**
 * CalendarView - Main calendar container
 *
 * @param {Object} props
 * @param {Array<Todo>} props.todos - All todos
 * @param {Function} props.onDateSelect - Callback when date selected
 * @param {number|null} props.selectedDate - Currently selected date
 * @param {Function} props.onToggleTodo - Todo toggle callback
 * @param {Function} props.onDeleteTodo - Todo delete callback
 */
export function CalendarView({
  todos,
  onDateSelect,
  selectedDate,
  onToggleTodo,
  onDeleteTodo
}) {
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
    isSelected
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
      />
      <CalendarStats stats={monthStats} />
    </div>
  );
}
```

### 3.3 CalendarHeader Component

**File**: `src/components/CalendarHeader.jsx`

```javascript
/**
 * CalendarHeader - Month/Year display and navigation
 */
export function CalendarHeader({ month, year, onPrevious, onNext, onToday }) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

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
        {monthNames[month]} {year}
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
```

### 3.4 CalendarGrid Component

**File**: `src/components/CalendarGrid.jsx`

```javascript
/**
 * CalendarGrid - 7×5-6 grid of calendar days
 */
export function CalendarGrid({
  days,
  onDayClick,
  getDayStats,
  isToday,
  isSelected
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
              onClick={() => onDayClick(date)}
            />
          );
        })}
      </div>
    </div>
  );
}
```

### 3.5 CalendarDay Component

**File**: `src/components/CalendarDay.jsx`

```javascript
/**
 * CalendarDay - Individual day cell with todo indicators
 */
export function CalendarDay({ date, stats, isToday, isSelected, onClick }) {
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
      } ${isSelected ? 'calendar-day--selected' : ''}`}
      onClick={onClick}
      aria-label={`${dayNumber}. ${stats.total} todos, ${stats.completed} completed`}
    >
      <span className="calendar-day-number">{dayNumber}</span>

      {!isEmpty && (
        <div className="calendar-day-indicators">
          <span className="calendar-day-badge">
            {stats.total}
          </span>
        </div>
      )}
    </button>
  );
}
```

### 3.6 CalendarStats Component

**File**: `src/components/CalendarStats.jsx`

```javascript
/**
 * CalendarStats - Monthly statistics panel
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
          {stats.currentStreak} days
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
```

---

## 4. Hook Design

### 4.1 useCalendar Hook

**File**: `src/hooks/useCalendar.js`

```javascript
/**
 * useCalendar - Calendar state and date utilities
 *
 * @param {Array<Todo>} todos - All todos
 * @param {number|null} selectedDate - Currently selected date
 * @returns {Object} Calendar state and utilities
 */
export function useCalendar(todos, selectedDate) {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

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

  // Navigation functions
  const goToPreviousMonth = useCallback(() => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  }, [currentMonth]);

  const goToNextMonth = useCallback(() => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  }, [currentMonth]);

  const goToToday = useCallback(() => {
    const now = new Date();
    setCurrentMonth(now.getMonth());
    setCurrentYear(now.getFullYear());
  }, []);

  // Date checkers
  const isToday = useCallback((date) => {
    return isSameDay(date, Date.now());
  }, []);

  const isSelected = useCallback((date) => {
    return selectedDate ? isSameDay(date, selectedDate) : false;
  }, [selectedDate]);

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
    isSelected
  };
}
```

### 4.2 Extended useTodos Hook

Add date filtering capabilities:

```javascript
// In src/hooks/useTodos.js

// Add new state
const [selectedDate, setSelectedDate] = useState(null);

// Add date filtering to filteredTodos
const filteredTodos = useMemo(() => {
  let filtered = todos;

  // Apply date filter if selected
  if (selectedDate) {
    filtered = filtered.filter(todo => {
      const todoDate = todo.dueDate || todo.createdAt;
      return isSameDay(todoDate, selectedDate);
    });
  }

  // Apply status filter
  switch (filter) {
    case FILTER_TYPES.ACTIVE:
      filtered = filtered.filter(todo => !todo.completed);
      break;
    case FILTER_TYPES.COMPLETED:
      filtered = filtered.filter(todo => todo.completed);
      break;
    default:
      break;
  }

  // Sort as before...
  return filtered;
}, [todos, filter, selectedDate]);

// Add date selection functions
const selectDate = useCallback((date) => {
  setSelectedDate(date);
}, []);

const clearDateFilter = useCallback(() => {
  setSelectedDate(null);
}, []);

// Return new functions
return {
  // ... existing returns
  selectedDate,
  selectDate,
  clearDateFilter,
};
```

---

## 5. Utility Functions

### 5.1 Date Utilities

**File**: `src/utils/dateUtils.js`

```javascript
/**
 * Date utility functions for calendar operations
 */

/**
 * Check if two timestamps are on the same day
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
 * Get start of day timestamp
 */
export function getStartOfDay(timestamp) {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/**
 * Get end of day timestamp
 */
export function getEndOfDay(timestamp) {
  const date = new Date(timestamp);
  date.setHours(23, 59, 59, 999);
  return date.getTime();
}

/**
 * Generate calendar days for a month
 * Returns array of timestamps for each day to display
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
```

---

## 6. Visual Design

### 6.1 Color Scheme (Apple Design)

```css
/* Calendar-specific colors */
--calendar-day-complete: rgba(52, 199, 89, 0.12);    /* Green */
--calendar-day-partial: rgba(255, 204, 0, 0.12);     /* Yellow */
--calendar-day-incomplete: rgba(255, 59, 48, 0.12);  /* Red */
--calendar-day-today: rgba(0, 122, 255, 0.08);       /* Blue */
--calendar-day-selected: rgba(0, 122, 255, 0.20);    /* Darker Blue */
--calendar-border: rgba(0, 0, 0, 0.08);
```

### 6.2 Layout Specifications

```
Calendar View Container
├── Header (60px height)
│   ├── Previous Button (40px)
│   ├── Month/Year Display (flex-1)
│   ├── Next Button (40px)
│   └── Today Button (80px)
├── Weekday Headers (40px height)
│   └── 7 columns (Sun-Sat)
├── Calendar Grid (auto height)
│   └── 35-42 cells (7 columns × 5-6 rows)
│       └── Each cell: min 60px height, aspect-ratio: 1
└── Stats Panel (auto height)
    └── 3-4 stat cards (inline)
```

### 6.3 Component Sizes

| Component | Desktop | Mobile |
|-----------|---------|--------|
| Calendar Container | 800px max-width | 100% width |
| Day Cell | 80px × 80px | 45px × 45px |
| Header Height | 60px | 50px |
| Stats Panel | Full width | Collapsible |
| Day Badge | 20px diameter | 16px diameter |

---

## 7. User Flows

### 7.1 View Calendar Overview

```
User Journey:
1. User opens app
2. Calendar displays current month with todos
3. Days with todos show count badges
4. Days are color-coded by completion status
5. User sees monthly statistics at bottom
```

### 7.2 Select Date to Filter Todos

```
User Journey:
1. User clicks on a calendar day (e.g., March 15)
2. Calendar day highlights with blue background
3. Todo list below filters to show only todos for March 15
4. List header shows "Todos for March 15, 2026"
5. "Clear filter" button appears
6. User clicks "Clear filter" to return to all todos
```

### 7.3 Navigate Between Months

```
User Journey:
1. User clicks "Next month" arrow
2. Calendar animates transition to next month
3. Todo counts update for new month
4. Statistics recalculate for new month
5. User clicks "Today" button
6. Calendar jumps back to current month
```

### 7.4 Add Todo with Due Date

```
User Journey:
1. User types todo text in input field
2. User clicks date picker icon/field
3. Native date picker opens
4. User selects date (e.g., March 20)
5. Date badge appears next to input
6. User clicks "Add"
7. Todo appears in list and calendar day shows updated count
```

---

## 8. Styling Guidelines

### 8.1 CalendarView.css

```css
.calendar-view {
  background: var(--surface-color);
  backdrop-filter: blur(40px);
  border-radius: var(--radius-xl);
  border: 0.5px solid var(--border-color);
  padding: var(--space-6);
  margin-bottom: var(--space-8);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.calendar-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--text-primary);
}

.calendar-nav-button {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  border: none;
  background: var(--surface-muted);
  color: var(--text-primary);
  font-size: 20px;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.calendar-nav-button:hover {
  background: var(--primary-color);
  color: white;
  transform: scale(1.05);
}

.calendar-today-button {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  border: 1px solid var(--primary-color);
  background: transparent;
  color: var(--primary-color);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.calendar-today-button:hover {
  background: var(--primary-color);
  color: white;
}
```

### 8.2 CalendarGrid.css

```css
.calendar-grid {
  margin-bottom: var(--space-6);
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.calendar-weekday {
  text-align: center;
  font-size: var(--font-size-sm);
  font-weight: 700;
  color: var(--text-secondary);
  padding: var(--space-2);
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--space-2);
}

.calendar-day {
  aspect-ratio: 1;
  min-height: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  border-radius: var(--radius-lg);
  border: 1px solid var(--calendar-border);
  background: var(--surface-color);
  cursor: pointer;
  transition: all var(--transition-normal);
  position: relative;
}

.calendar-day:hover {
  border-color: var(--primary-color);
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.calendar-day--today {
  background: var(--calendar-day-today);
  border-color: var(--primary-color);
  font-weight: 700;
}

.calendar-day--selected {
  background: var(--calendar-day-selected);
  border-color: var(--primary-color);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.calendar-day--complete {
  background: var(--calendar-day-complete);
  border-color: var(--success-color);
}

.calendar-day--partial {
  background: var(--calendar-day-partial);
  border-color: #FFCC00;
}

.calendar-day--incomplete {
  background: var(--calendar-day-incomplete);
  border-color: var(--danger-color);
}

.calendar-day-number {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--text-primary);
}

.calendar-day-badge {
  font-size: var(--font-size-xs);
  font-weight: 700;
  background: var(--primary-color);
  color: white;
  padding: 2px 6px;
  border-radius: var(--radius-full);
  min-width: 20px;
  text-align: center;
}

/* Responsive */
@media (max-width: 768px) {
  .calendar-day {
    min-height: 45px;
    font-size: var(--font-size-sm);
  }

  .calendar-day-badge {
    font-size: 10px;
    padding: 1px 4px;
    min-width: 16px;
  }
}
```

### 8.3 CalendarStats.css

```css
.calendar-stats {
  display: flex;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--surface-muted);
  border-radius: var(--radius-lg);
  flex-wrap: wrap;
}

.calendar-stat {
  flex: 1;
  min-width: 120px;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.calendar-stat-label {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.calendar-stat-value {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--text-primary);
}

@media (max-width: 480px) {
  .calendar-stats {
    flex-direction: column;
  }

  .calendar-stat {
    min-width: 100%;
  }
}
```

---

## 9. Integration Points

### 9.1 App.jsx Integration

```javascript
// In App.jsx

import { CalendarView } from './components/CalendarView';

function App() {
  const {
    todos,
    // ... other hooks
    selectedDate,
    selectDate,
    clearDateFilter,
  } = useTodos();

  return (
    <div className="app">
      <main className="todo-container">
        <TodoHeader /* ... */ />
        <TodoInput /* ... */ />

        {/* NEW: Calendar View */}
        <CalendarView
          todos={todos}
          onDateSelect={selectDate}
          selectedDate={selectedDate}
          onToggleTodo={toggleTodo}
          onDeleteTodo={deleteTodo}
        />

        {/* Show date filter indicator */}
        {selectedDate && (
          <div className="date-filter-indicator">
            <span>Showing todos for {formatDate(selectedDate, 'short')}</span>
            <button onClick={clearDateFilter}>Clear filter</button>
          </div>
        )}

        <TodoList /* ... */ />
        <TodoFilters /* ... */ />
      </main>
    </div>
  );
}
```

### 9.2 TodoInput Integration

```javascript
// In TodoInput.jsx - add date picker

const [dueDate, setDueDate] = useState(null);

const handleSubmit = (e) => {
  e.preventDefault();
  const success = onAdd(text, priority, dueDate);
  if (success) {
    setText('');
    setPriority('medium');
    setDueDate(null); // Reset date
  }
};

// In render:
<input
  type="date"
  className="todo-date-input"
  value={dueDate ? new Date(dueDate).toISOString().split('T')[0] : ''}
  onChange={(e) => setDueDate(e.target.value ? new Date(e.target.value).getTime() : null)}
/>
```

---

## 10. Accessibility Considerations

### 10.1 ARIA Labels

- Calendar grid: `role="grid"`, `aria-label="Calendar"`
- Day cells: `role="gridcell"`, descriptive `aria-label` with date and todo count
- Navigation buttons: `aria-label` for screen readers
- Month/Year: `role="heading"`, `aria-level="2"`

### 10.2 Keyboard Navigation

| Key | Action |
|-----|--------|
| Arrow Keys | Navigate between days |
| Enter/Space | Select day |
| Tab | Move to next interactive element |
| PageUp | Previous month |
| PageDown | Next month |
| Home | First day of month |
| End | Last day of month |

### 10.3 Focus Management

- Focus visible on all interactive elements
- Focus trap within calendar when navigating with keyboard
- Return focus to selected day after month navigation

---

## 11. Performance Optimization

### 11.1 Memoization Strategy

```javascript
// Memoize expensive calculations
const calendarDays = useMemo(() => generateCalendarDays(...), [month, year]);
const monthStats = useMemo(() => calculateMonthStats(...), [todos, month]);
const getDayStats = useCallback(() => calculateDayStats(...), [todos]);
```

### 11.2 React.memo for Components

```javascript
export const CalendarDay = React.memo(function CalendarDay({ /* props */ }) {
  // Component logic
}, (prevProps, nextProps) => {
  // Custom comparison for memo
  return (
    prevProps.date === nextProps.date &&
    prevProps.stats.total === nextProps.stats.total &&
    prevProps.isToday === nextProps.isToday &&
    prevProps.isSelected === nextProps.isSelected
  );
});
```

### 11.3 Lazy Loading

- Calendar view only renders when visible
- Day detail modal loads on demand
- Statistics calculate only for visible month

---

## 12. Testing Strategy

### 12.1 Unit Tests

- Date utility functions (edge cases: leap years, month boundaries)
- Calendar day generation (different months, years)
- Stats calculations (empty todos, all complete, partial)
- Streak calculation (consecutive days, month boundaries)

### 12.2 Integration Tests

- Date selection updates todo list
- Month navigation updates calendar
- Adding todo with due date updates calendar
- Completing todo updates day color

### 12.3 Edge Cases

- Leap year February (29 days)
- Month with 31 days vs 30 days
- Year transitions (Dec → Jan)
- Timezone handling
- Empty todo list
- Todos without due dates

---

## 13. Implementation Order

### Phase 1: Foundation (3 hours)
1. [ ] Extend Todo type with dueDate and completedDate
2. [ ] Create dateUtils.js with core functions
3. [ ] Add migration logic to useTodos
4. [ ] Create useCalendar hook

### Phase 2: Core Components (4 hours)
5. [ ] CalendarView container
6. [ ] CalendarHeader with navigation
7. [ ] CalendarGrid layout
8. [ ] CalendarDay cells with indicators

### Phase 3: Features (3 hours)
9. [ ] Date selection and filtering
10. [ ] Monthly statistics calculation
11. [ ] CalendarStats component
12. [ ] Integration with TodoList

### Phase 4: Input Enhancement (1.5 hours)
13. [ ] Add date picker to TodoInput
14. [ ] Style native date input
15. [ ] Handle date selection/clearing

### Phase 5: Styling & Polish (2.5 hours)
16. [ ] Apple-style CSS for all components
17. [ ] Hover states and transitions
18. [ ] Mobile responsive layout
19. [ ] Day color coding

### Phase 6: Testing & Optimization (2 hours)
20. [ ] Test date edge cases
21. [ ] Add keyboard navigation
22. [ ] Performance optimization (memoization)
23. [ ] Accessibility audit

**Total Estimate**: 16 hours

---

## 14. Future Enhancements

- Week view toggle
- Drag-and-drop to reschedule
- Recurring todo support
- Export calendar as image
- Custom color themes
- Integration with device calendar
- Time-of-day scheduling
- Multi-calendar support

---

**Next Steps**:
1. Review and approve this design document
2. Begin implementation (`/pdca do calendar-tracker`)
3. Follow implementation order from Phase 1 to Phase 6
