# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A production-ready, accessible todo application built with React 19, Vite, and vanilla CSS. Features include task management with priorities, calendar view with streaks and stats, date filtering, and localStorage persistence.

**Tech Stack:**
- React 19 (latest version with new features)
- Vite 7 for build tooling
- Vanilla CSS with component colocation
- JSDoc for type documentation (no TypeScript)

## Development Commands

### Core Commands
- **Dev server**: `npm run dev` - Starts Vite dev server with HMR
- **Build**: `npm run build` - Creates production build in `dist/`
- **Preview**: `npm run preview` - Preview production build locally
- **Lint**: `npm run lint` - Run ESLint on all JS/JSX files

### Port Information
- Dev server runs on default Vite port (typically http://localhost:5173)

### ESLint Configuration Note
- Custom rule in `eslint.config.js:26` allows unused variables that start with capital letters or underscores
- Pattern: `varsIgnorePattern: '^[A-Z_]'` - useful for exported constants and components

## Architecture

### Layered Architecture Pattern

The codebase follows a clean layered architecture:

1. **Domain Layer** (`src/types/todo.js`)
   - Pure domain logic with no external dependencies
   - Factory functions: `createTodo()`, `updateTodo()`
   - Validation and business rules centralized here
   - Constants: `FILTER_TYPES`, `PRIORITY_LEVELS`, `PRIORITY_CONFIG`

2. **Service Layer** (`src/services/storageService.js`)
   - Abstraction over localStorage for persistence
   - Handles storage availability checks and error recovery
   - Designed to allow easy swapping of storage backends

3. **State Management** (`src/hooks/useTodos.js`)
   - Custom hook centralizing all todo operations
   - Manages state, side effects, and computed values
   - Provides interface between UI and domain/service layers
   - Handles automatic persistence and data migration

4. **Component Layer** (`src/components/`)
   - Presentation components with collocated CSS
   - Exported through `src/components/index.js` barrel file
   - Each component is self-contained with its styles

### Data Flow

```
User Action → Component → useTodos Hook → Domain Functions → Storage Service
                                        ↓
                    State Update → Re-render
```

### Key Design Patterns

- **Factory Functions**: `createTodo()` and `updateTodo()` ensure consistent data structure
- **Custom Hooks**: `useTodos()` encapsulates state logic; `useCalendar()` manages calendar state
- **Barrel Exports**: Components exported through `src/components/index.js`
- **Validation**: Domain layer validates all mutations (text length, empty checks)
- **Automatic Timestamps**: `completedDate` auto-set when todo marked complete

### Priority and Sorting System

Todos are sorted by:
1. Completion status (incomplete first)
2. For incomplete: priority (high → medium → low) then creation time (oldest first)
3. For complete: completion time (most recent first)

Priority configuration in `src/types/todo.js` includes colors, emojis, and aria labels for each level.

### Date and Calendar Features

The calendar is a complex feature with multiple responsibilities:

- **Date Utilities** (`src/utils/dateUtils.js`):
  - `generateCalendarDays()` creates 35-42 day grid including adjacent month days for proper layout
  - `calculateStreak()` walks backward from today counting consecutive days with completed todos
  - `calculateDayStats()` and `calculateMonthStats()` aggregate todo completion data
  - Date matching uses either `dueDate` or falls back to `createdAt`

- **Calendar Hook** (`src/hooks/useCalendar.js`): Month navigation, day statistics, and date selection state
- **Calendar Components**: Five-component calendar view (View, Header, Grid, Day, Stats) showing todo counts and completion rates
- **Date Filtering**: When date selected, filters todos by matching due date or creation date

### Constants and Configuration

- **Application Constants** (`src/utils/constants.js`): Centralized location for:
  - Validation limits (`MAX_TODO_LENGTH`: 500 characters)
  - Timing constants (`ERROR_AUTO_DISMISS`, `DEBOUNCE_DELAY`)
  - Keyboard key constants for accessibility (`KEYS.ENTER`, `KEYS.ESCAPE`, etc.)
  - Storage keys

When adding app-wide constants, add them here rather than hardcoding values.

### Accessibility Patterns

Accessibility is built into the design throughout:
- **Semantic HTML**: Proper landmarks and heading hierarchy
- **ARIA labels**: Priority badges include `ariaLabel` in `PRIORITY_CONFIG`
- **Keyboard navigation**: Constants in `src/utils/constants.js` define standard keys
- **Skip link**: `index.html:12` provides skip-to-content for keyboard users
- **Live regions**: Loading and error states use `aria-live` for screen readers
- **Focus management**: Components handle focus states for keyboard users

When building new components, follow these accessibility patterns.

## Important Implementation Notes

### UI Interaction Patterns

- **Double-click to edit**: TodoItem uses double-click for inline editing. The app footer reminds users of this pattern. When implementing similar editable elements, follow this convention.
- **Keyboard shortcuts**: Use constants from `src/utils/constants.js` (e.g., `KEYS.ENTER`, `KEYS.ESCAPE`) for consistent keyboard handling
- **Inline editing**: Enter to save, Escape to cancel is the standard pattern

### Adding New Todo Properties

When adding properties to the todo model:
1. Update typedef in `src/types/todo.js`
2. Add default value in `createTodo()` factory
3. Handle migration in `useTodos.js` `useEffect` (around line 36-44)
4. Update validation in `updateTodo()` if needed

### Storage and Migration

The app automatically migrates existing todos on load. See `useTodos.js` line 36-44 for migration pattern. New properties should have sensible defaults to handle legacy data.

### Component Styling

- Each component has a collocated CSS file (e.g., `TodoItem.jsx` + `TodoItem.css`)
- Global styles in `src/index.css` and `src/App.css`
- CSS custom properties used for theming (see `index.css` for color palette)
- No CSS-in-JS or utility frameworks - vanilla CSS for simplicity

### State Persistence

- Todos persist automatically via `useEffect` in `useTodos.js`
- Filter preference also persists to localStorage
- Storage abstraction allows easy backend swapping without changing components

### Error Handling

- Domain functions throw errors for validation failures
- `useTodos` hook catches errors and sets error state
- `ErrorMessage` component displays errors with dismiss action
- Storage failures log warnings but don't break the app
- Error auto-dismiss timing configured in `src/utils/constants.js`

### Type Documentation

- Uses JSDoc comments for type documentation (no TypeScript)
- Type definitions in `src/types/todo.js` using `@typedef`
- VSCode provides IntelliSense based on JSDoc annotations
- When adding functions, include JSDoc with `@param` and `@returns`
