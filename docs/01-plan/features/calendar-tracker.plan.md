# Plan: Calendar Tracker Feature

**Feature Name**: calendar-tracker
**Created**: 2026-03-03
**Status**: Planning
**Priority**: Medium

---

## 1. Overview

Add a calendar view to the todo app that allows users to track and visualize their todos across time. Users can see an overview of their productivity, completion patterns, and upcoming tasks organized by date.

## 2. Problem Statement

Currently, the todo app only shows a linear list of tasks without any temporal context. Users cannot:
- See which tasks were completed on specific dates
- Track their productivity over time
- View an overview of their task completion patterns
- Plan tasks for future dates
- Get insights into their productivity trends

## 3. Goals

### Primary Goals
- Provide a monthly calendar view showing todo activity
- Allow users to see completed vs incomplete todos per day
- Display daily todo counts and completion statistics
- Enable navigation between months
- Show current day highlight

### Secondary Goals
- Add due date support to todos
- Show productivity heatmap (days with high activity)
- Display weekly/monthly completion trends
- Filter calendar by priority level
- Show visual indicators for high-priority days

## 4. Functional Requirements

### FR-01: Calendar View Component
- Display a monthly calendar grid (7 columns × 5-6 rows)
- Show month/year header with navigation arrows
- Highlight current day
- Display day numbers for each cell
- Show mini indicators for todos on each day

### FR-02: Todo Date Tracking
- Add `dueDate` field to todo data model (optional)
- Add `completedDate` field (auto-set when completed)
- Migrate existing todos (completedDate = updatedAt for completed todos)
- Store dates as ISO 8601 timestamps

### FR-03: Daily Overview
- Show todo count badges on calendar days (e.g., "3 todos")
- Color-code days by completion status:
  - All complete: Green indicator
  - Partially complete: Yellow indicator
  - None complete: Red indicator
  - No todos: Neutral
- Click on a day to see todo list for that date

### FR-04: Date Selection & Filtering
- Click calendar day to filter todo list by date
- Show "Todos for [Date]" header when filtered
- "Clear filter" button to return to all todos
- Maintain existing All/Active/Completed filters alongside date filter

### FR-05: Statistics Panel
- Show monthly completion rate (%)
- Display total completed vs total todos for selected month
- Show current streak (consecutive days with completed todos)
- Display most productive day of the month

### FR-06: Todo Input Enhancement
- Add optional "Due Date" picker to TodoInput
- Default to today's date (can be changed or cleared)
- Use native date input with Apple design styling

### FR-07: Navigation
- Previous/Next month navigation buttons
- "Today" button to jump to current month
- Month/Year display in header
- Smooth transitions between months

### FR-08: Mobile Responsiveness
- Compact calendar view on mobile (smaller day cells)
- Swipe gestures for month navigation
- Collapsible statistics panel
- Full-screen day detail view on tap

## 5. Non-Functional Requirements

### NFR-01: Performance
- Calendar renders in < 100ms
- Smooth animations (60fps) for month transitions
- Efficient date calculations (no unnecessary re-renders)

### NFR-02: Data Persistence
- Due dates and completion dates stored in localStorage
- Backward compatible with existing todos
- Migration runs automatically on first load

### NFR-03: Accessibility
- ARIA labels for all calendar cells
- Keyboard navigation (arrow keys to navigate days, Enter to select)
- Screen reader support for statistics
- Focus indicators on calendar cells

### NFR-04: Design Consistency
- Follow existing Apple design language
- Match color palette and typography
- Glassmorphism effects for calendar container
- Smooth transitions and micro-interactions

## 6. Out of Scope

- Multi-calendar support (personal, work, etc.)
- Recurring todos
- Calendar export (iCal, Google Calendar sync)
- Time-of-day scheduling (todos are day-level only)
- Reminders/notifications
- Team collaboration features
- Integration with external calendar apps

## 7. Technical Approach

### Architecture
- **Layer**: Presentation Layer (new CalendarView component)
- **State Management**: Extend useTodos hook with calendar utilities
- **Date Library**: Use native JavaScript Date API (no external libs)

### Data Model Changes
```javascript
// Extend Todo type
{
  id: string,
  text: string,
  completed: boolean,
  priority: 'high' | 'medium' | 'low',
  dueDate: number | null,      // NEW: Unix timestamp
  completedDate: number | null, // NEW: Unix timestamp when completed
  createdAt: number,
  updatedAt: number
}
```

### Component Structure
```
App
└── CalendarView
    ├── CalendarHeader (Month/Year + Navigation)
    ├── CalendarGrid (7x5-6 grid of days)
    │   └── CalendarDay (individual day cell)
    ├── CalendarStats (completion statistics)
    └── DayDetailModal (selected day's todos)
```

## 8. Success Criteria

### Minimum Viable Product (MVP)
- [ ] Calendar displays current month correctly
- [ ] Shows todo counts on each day
- [ ] Click day to filter todos by date
- [ ] Add due date to new todos
- [ ] Display basic statistics (completion rate)
- [ ] Previous/Next month navigation

### Enhanced Version
- [ ] Visual heatmap of productivity
- [ ] Weekly completion trends
- [ ] Streak tracking
- [ ] Mobile swipe gestures
- [ ] Animations and transitions

## 9. Implementation Estimate

**Total Estimate**: 12-16 hours

### Breakdown
1. Data Model Changes (1 hour)
   - Add dueDate and completedDate fields
   - Write migration logic
   - Update createTodo and updateTodo functions

2. Calendar Core Components (4 hours)
   - CalendarView container
   - CalendarHeader with navigation
   - CalendarGrid and CalendarDay cells
   - Date calculation utilities

3. Date Filtering Logic (2 hours)
   - Extend useTodos with date filters
   - Add calendar state management
   - Hook up day selection to todo list

4. Statistics Panel (2 hours)
   - Calculate monthly completion rate
   - Compute current streak
   - Display productivity metrics

5. Due Date Input (1.5 hours)
   - Add date picker to TodoInput
   - Style native date input
   - Handle date selection/clearing

6. Visual Design & Styling (2.5 hours)
   - Apple-style calendar CSS
   - Day indicators and badges
   - Hover/active states
   - Responsive layout

7. Testing & Polish (3 hours)
   - Test date edge cases (month boundaries, leap years)
   - Keyboard navigation
   - Mobile responsiveness
   - Performance optimization

## 10. Risks & Mitigation

### Risk 1: Date Calculation Complexity
**Impact**: Medium
**Probability**: Medium
**Mitigation**: Use well-tested date utility functions, extensive edge case testing (leap years, month boundaries, timezone handling)

### Risk 2: Performance with Large Todo Counts
**Impact**: Medium
**Probability**: Low
**Mitigation**: Memoize date calculations, use React.memo for CalendarDay components, limit visible date range

### Risk 3: Mobile UX Complexity
**Impact**: Low
**Probability**: Medium
**Mitigation**: Simplify mobile view, prioritize core functionality, progressive enhancement for gestures

### Risk 4: Backward Compatibility
**Impact**: High
**Probability**: Low
**Mitigation**: Careful migration logic, null-safe date handling, extensive testing with existing data

## 11. Dependencies

- No external dependencies required
- Uses existing React hooks (useState, useMemo, useCallback)
- Native JavaScript Date API
- Existing todo data model and storage service

## 12. Future Enhancements

- Week view option
- Year view for long-term planning
- Export calendar as image
- Recurring todo support
- Integration with device calendar
- Dark mode calendar theme
- Custom color schemes per priority
- Drag-and-drop to reschedule todos

---

**Next Steps**:
1. Review and approve this plan
2. Create design document (`/pdca design calendar-tracker`)
3. Begin implementation (`/pdca do calendar-tracker`)
