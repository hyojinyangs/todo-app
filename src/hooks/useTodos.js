/**
 * useTodos Hook
 *
 * Custom hook that encapsulates all todo-related state management and business logic.
 * This hook serves as the primary interface between UI components and the todo domain.
 *
 * Design decisions:
 * - Centralizes all todo operations in one place
 * - Handles persistence automatically
 * - Provides computed values (filtered todos, counts)
 * - Manages error states for operations
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createTodo, updateTodo, FILTER_TYPES } from '../types/todo';
import { storageService } from '../services/storageService';
import { isSameDay } from '../utils/dateUtils';

/**
 * Hook for managing todo state and operations
 * @returns {Object} Todo state and operations
 */
export function useTodos() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState(FILTER_TYPES.ALL);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load initial data from storage with migration
  useEffect(() => {
    try {
      const savedTodos = storageService.getTodos();
      const savedFilter = storageService.getFilter();

      // Migrate existing todos with default values
      const migratedTodos = savedTodos.map(todo => ({
        ...todo,
        priority: todo.priority || 'medium',
        dueDate: todo.dueDate ?? null,
        completedDate: todo.completed && !todo.completedDate
          ? todo.updatedAt  // Use updatedAt as fallback for completed todos
          : (todo.completedDate ?? null)
      }));

      setTodos(migratedTodos);
      setFilter(savedFilter);
    } catch (err) {
      setError('Failed to load todos from storage');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Persist todos to storage whenever they change
  useEffect(() => {
    if (!isLoading) {
      storageService.saveTodos(todos);
    }
  }, [todos, isLoading]);

  // Persist filter preference
  useEffect(() => {
    if (!isLoading) {
      storageService.saveFilter(filter);
    }
  }, [filter, isLoading]);

  /**
   * Adds a new todo
   * @param {string} text - The todo text
   * @param {string} priority - Priority level (defaults to 'medium')
   * @param {number|null} dueDate - Optional due date timestamp
   * @returns {boolean} True if successful
   */
  const addTodo = useCallback((text, priority = 'medium', dueDate = null) => {
    try {
      const newTodo = createTodo(text, priority, dueDate);
      setTodos((prev) => [...prev, newTodo]);
      setError(null);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, []);

  /**
   * Deletes a todo by ID
   * @param {string} id - The todo ID to delete
   */
  const deleteTodo = useCallback((id) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
    setError(null);
  }, []);

  /**
   * Toggles the completed status of a todo
   * @param {string} id - The todo ID to toggle
   */
  const toggleTodo = useCallback((id) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? updateTodo(todo, { completed: !todo.completed }) : todo
      )
    );
    setError(null);
  }, []);

  /**
   * Updates the text of a todo
   * @param {string} id - The todo ID to update
   * @param {string} newText - The new text
   * @returns {boolean} True if successful
   */
  const editTodo = useCallback((id, newText) => {
    try {
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === id ? updateTodo(todo, { text: newText }) : todo
        )
      );
      setError(null);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, []);

  /**
   * Updates the priority of a todo
   * @param {string} id - The todo ID to update
   * @param {string} newPriority - The new priority
   */
  const updatePriority = useCallback((id, newPriority) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? updateTodo(todo, { priority: newPriority }) : todo
      )
    );
    setError(null);
  }, []);

  /**
   * Clears all completed todos
   */
  const clearCompleted = useCallback(() => {
    setTodos((prev) => prev.filter((todo) => !todo.completed));
    setError(null);
  }, []);

  /**
   * Toggles all todos to complete or incomplete
   * If any are incomplete, marks all complete. Otherwise, marks all incomplete.
   */
  const toggleAll = useCallback(() => {
    setTodos((prev) => {
      const allCompleted = prev.every((todo) => todo.completed);
      return prev.map((todo) =>
        updateTodo(todo, { completed: !allCompleted })
      );
    });
    setError(null);
  }, []);

  /**
   * Changes the current filter
   * @param {import('../types/todo').FilterType} newFilter - The new filter
   */
  const changeFilter = useCallback((newFilter) => {
    if ([FILTER_TYPES.ALL, FILTER_TYPES.ACTIVE, FILTER_TYPES.COMPLETED].includes(newFilter)) {
      setFilter(newFilter);
    }
  }, []);

  /**
   * Clears any error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Selects a date for filtering todos
   * @param {number} date - Date timestamp to select
   */
  const selectDate = useCallback((date) => {
    setSelectedDate(date);
  }, []);

  /**
   * Clears date filter
   */
  const clearDateFilter = useCallback(() => {
    setSelectedDate(null);
  }, []);

  // Computed: filtered and sorted todos
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
        filtered = filtered.filter((todo) => !todo.completed);
        break;
      case FILTER_TYPES.COMPLETED:
        filtered = filtered.filter((todo) => todo.completed);
        break;
      default:
        break;
    }

    // Then sort by priority and completion status
    return [...filtered].sort((a, b) => {
      // Completed todos always go last
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }

      // For completed todos, sort by completion time (recent first)
      if (a.completed && b.completed) {
        return b.updatedAt - a.updatedAt;
      }

      // For incomplete todos, sort by priority first
      const priorityOrder = {
        high: 1,
        medium: 2,
        low: 3
      };

      const aPriority = priorityOrder[a.priority] || 2;
      const bPriority = priorityOrder[b.priority] || 2;

      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      // Same priority: sort by creation time (oldest first)
      return a.createdAt - b.createdAt;
    });
  }, [todos, filter, selectedDate]);

  // Computed: count of active (incomplete) todos
  const activeCount = useMemo(() => {
    return todos.filter((todo) => !todo.completed).length;
  }, [todos]);

  // Computed: count of completed todos
  const completedCount = useMemo(() => {
    return todos.filter((todo) => todo.completed).length;
  }, [todos]);

  // Computed: total count of all todos
  const totalCount = todos.length;

  // Computed: whether all todos are completed
  const allCompleted = useMemo(() => {
    return todos.length > 0 && todos.every((todo) => todo.completed);
  }, [todos]);

  return {
    // State
    todos: filteredTodos,
    allTodos: todos,
    filter,
    selectedDate,
    isLoading,
    error,

    // Counts
    activeCount,
    completedCount,
    totalCount,
    allCompleted,

    // Actions
    addTodo,
    deleteTodo,
    toggleTodo,
    editTodo,
    updatePriority,
    clearCompleted,
    toggleAll,
    changeFilter,
    clearError,
    selectDate,
    clearDateFilter,
  };
}
