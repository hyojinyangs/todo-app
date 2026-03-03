/**
 * Application Constants
 *
 * Centralized location for app-wide constants.
 * This promotes consistency and makes changes easier to manage.
 */

/**
 * Application metadata
 */
export const APP_NAME = 'Todo App';
export const APP_VERSION = '1.0.0';

/**
 * Storage keys for localStorage
 */
export const STORAGE_KEYS = {
  TODOS: 'todo-app-todos',
  FILTER: 'todo-app-filter',
};

/**
 * Validation limits
 */
export const VALIDATION = {
  MAX_TODO_LENGTH: 500,
  MIN_TODO_LENGTH: 1,
};

/**
 * UI timing constants (in milliseconds)
 */
export const TIMING = {
  ERROR_AUTO_DISMISS: 5000,
  DEBOUNCE_DELAY: 300,
};

/**
 * Keyboard key codes for accessibility
 */
export const KEYS = {
  ENTER: 'Enter',
  ESCAPE: 'Escape',
  SPACE: ' ',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
};
