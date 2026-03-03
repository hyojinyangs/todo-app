/**
 * Storage Service
 *
 * Provides an abstraction layer over localStorage for todo persistence.
 * This separation allows for easy swapping to different storage backends
 * (e.g., IndexedDB, REST API) without changing the rest of the application.
 */

const STORAGE_KEY = 'todo-app-todos';
const FILTER_KEY = 'todo-app-filter';

/**
 * Checks if localStorage is available
 * @returns {boolean} True if localStorage is available
 */
function isStorageAvailable() {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Storage service with methods for persisting and retrieving todos
 */
export const storageService = {
  /**
   * Retrieves all todos from storage
   * @returns {Array<import('../types/todo').Todo>} Array of todos
   */
  getTodos() {
    if (!isStorageAvailable()) {
      console.warn('localStorage is not available. Data will not persist.');
      return [];
    }

    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return [];
      }

      const parsed = JSON.parse(data);

      // Validate the data structure
      if (!Array.isArray(parsed)) {
        console.warn('Invalid data structure in storage. Returning empty array.');
        return [];
      }

      // Filter out invalid todos and ensure proper structure
      return parsed.filter(
        (todo) =>
          todo &&
          typeof todo.id === 'string' &&
          typeof todo.text === 'string' &&
          typeof todo.completed === 'boolean'
      );
    } catch (error) {
      console.error('Error reading from storage:', error);
      return [];
    }
  },

  /**
   * Saves todos to storage
   * @param {Array<import('../types/todo').Todo>} todos - Array of todos to save
   * @returns {boolean} True if save was successful
   */
  saveTodos(todos) {
    if (!isStorageAvailable()) {
      console.warn('localStorage is not available. Data will not persist.');
      return false;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
      return true;
    } catch (error) {
      console.error('Error saving to storage:', error);
      // Handle quota exceeded error
      if (error.name === 'QuotaExceededError') {
        console.error('Storage quota exceeded. Consider clearing old data.');
      }
      return false;
    }
  },

  /**
   * Retrieves the saved filter preference
   * @returns {import('../types/todo').FilterType} The saved filter or 'all'
   */
  getFilter() {
    if (!isStorageAvailable()) {
      return 'all';
    }

    try {
      const filter = localStorage.getItem(FILTER_KEY);
      if (filter && ['all', 'active', 'completed'].includes(filter)) {
        return filter;
      }
      return 'all';
    } catch {
      return 'all';
    }
  },

  /**
   * Saves the filter preference
   * @param {import('../types/todo').FilterType} filter - The filter to save
   */
  saveFilter(filter) {
    if (!isStorageAvailable()) {
      return;
    }

    try {
      localStorage.setItem(FILTER_KEY, filter);
    } catch (error) {
      console.error('Error saving filter:', error);
    }
  },

  /**
   * Clears all app data from storage
   */
  clearAll() {
    if (!isStorageAvailable()) {
      return;
    }

    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(FILTER_KEY);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },
};
