/**
 * Todo Domain Types and Factory
 *
 * This module defines the core domain model for todos.
 * Using a factory function pattern for creating todos ensures
 * consistent structure and validation.
 */

/**
 * Valid filter values for todo list
 * @typedef {'all' | 'active' | 'completed'} FilterType
 */

/**
 * Valid priority values for todos
 * @typedef {'high' | 'medium' | 'low'} Priority
 */

/**
 * @typedef {Object} Todo
 * @property {string} id - Unique identifier
 * @property {string} text - Todo content
 * @property {boolean} completed - Completion status
 * @property {Priority} priority - Priority level (high, medium, low)
 * @property {number|null} dueDate - Due date timestamp (optional)
 * @property {number|null} completedDate - Completion date timestamp (optional)
 * @property {number} createdAt - Creation timestamp
 * @property {number} updatedAt - Last update timestamp
 */

/**
 * Creates a new todo with validated properties
 * @param {string} text - The todo text
 * @param {Priority} priority - Priority level (defaults to 'medium')
 * @param {number|null} dueDate - Optional due date timestamp
 * @returns {Todo} A new todo object
 * @throws {Error} If text is empty or invalid
 */
export function createTodo(text, priority = 'medium', dueDate = null) {
  const trimmedText = text?.trim();

  if (!trimmedText) {
    throw new Error('Todo text cannot be empty');
  }

  if (trimmedText.length > 500) {
    throw new Error('Todo text cannot exceed 500 characters');
  }

  // Validate priority, default to medium if invalid
  const validPriority = isValidPriority(priority) ? priority : 'medium';

  const now = Date.now();

  return {
    id: generateId(),
    text: trimmedText,
    completed: false,
    priority: validPriority,
    dueDate: dueDate,
    completedDate: null,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Updates an existing todo with new values
 * @param {Todo} todo - The todo to update
 * @param {Partial<Omit<Todo, 'id' | 'createdAt'>>} updates - Properties to update
 * @returns {Todo} Updated todo object
 */
export function updateTodo(todo, updates) {
  const validUpdates = {};

  if (updates.text !== undefined) {
    const trimmedText = updates.text?.trim();
    if (!trimmedText) {
      throw new Error('Todo text cannot be empty');
    }
    if (trimmedText.length > 500) {
      throw new Error('Todo text cannot exceed 500 characters');
    }
    validUpdates.text = trimmedText;
  }

  if (updates.completed !== undefined) {
    validUpdates.completed = Boolean(updates.completed);
    // Auto-set completedDate when marking as complete
    if (validUpdates.completed && !todo.completed) {
      validUpdates.completedDate = Date.now();
    }
    // Clear completedDate when marking as incomplete
    if (!validUpdates.completed && todo.completed) {
      validUpdates.completedDate = null;
    }
  }

  if (updates.priority !== undefined) {
    if (isValidPriority(updates.priority)) {
      validUpdates.priority = updates.priority;
    }
  }

  if (updates.dueDate !== undefined) {
    validUpdates.dueDate = updates.dueDate;
  }

  if (updates.completedDate !== undefined) {
    validUpdates.completedDate = updates.completedDate;
  }

  return {
    ...todo,
    ...validUpdates,
    updatedAt: Date.now(),
  };
}

/**
 * Generates a unique identifier
 * Uses a combination of timestamp and random string for uniqueness
 * @returns {string} Unique ID
 */
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Filter type constants
 */
export const FILTER_TYPES = {
  ALL: 'all',
  ACTIVE: 'active',
  COMPLETED: 'completed',
};

/**
 * Validates if a value is a valid filter type
 * @param {string} filter - The filter to validate
 * @returns {boolean} True if valid
 */
export function isValidFilter(filter) {
  return Object.values(FILTER_TYPES).includes(filter);
}

/**
 * Priority level constants
 */
export const PRIORITY_LEVELS = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

/**
 * Priority configuration for UI rendering
 */
export const PRIORITY_CONFIG = {
  high: {
    value: 'high',
    label: 'High',
    color: '#FF3B30',
    emoji: '🔴',
    sortOrder: 1,
    ariaLabel: 'High priority',
  },
  medium: {
    value: 'medium',
    label: 'Medium',
    color: '#FFCC00',
    emoji: '🟡',
    sortOrder: 2,
    ariaLabel: 'Medium priority',
  },
  low: {
    value: 'low',
    label: 'Low',
    color: '#007AFF',
    emoji: '🔵',
    sortOrder: 3,
    ariaLabel: 'Low priority',
  },
};

/**
 * Validates if a value is a valid priority
 * @param {string} priority - The priority to validate
 * @returns {boolean} True if valid
 */
export function isValidPriority(priority) {
  return Object.values(PRIORITY_LEVELS).includes(priority);
}
