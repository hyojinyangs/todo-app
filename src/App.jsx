/**
 * Todo App - Main Application Component
 *
 * A production-ready todo application featuring:
 * - Add, edit, and delete todos
 * - Mark todos as complete/incomplete
 * - Filter by status (all, active, completed)
 * - Persistent storage (localStorage)
 * - Responsive design
 * - Accessibility support
 *
 * Architecture:
 * - Domain logic in types/todo.js
 * - Storage abstraction in services/storageService.js
 * - State management in hooks/useTodos.js
 * - Reusable UI components in components/
 */

import { useTodos } from './hooks/useTodos';
import {
  TodoHeader,
  TodoInput,
  TodoList,
  TodoFilters,
  ErrorMessage,
  CalendarView,
} from './components';
import { formatDate } from './utils/dateUtils';
import './App.css';

function App() {
  const {
    todos,
    allTodos,
    filter,
    selectedDate,
    isLoading,
    error,
    activeCount,
    completedCount,
    totalCount,
    allCompleted,
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
  } = useTodos();

  // Show loading state briefly on initial load
  if (isLoading) {
    return (
      <div className="app">
        <main className="todo-container">
          <div className="loading-state" aria-live="polite">
            Loading your todos...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <main className="todo-container" role="main">
        <TodoHeader
          totalCount={totalCount}
          allCompleted={allCompleted}
          onToggleAll={toggleAll}
        />

        <TodoInput onAdd={addTodo} />

        {error && (
          <ErrorMessage message={error} onDismiss={clearError} />
        )}

        <CalendarView
          todos={allTodos}
          onDateSelect={selectDate}
          selectedDate={selectedDate}
        />

        {selectedDate && (
          <div className="date-filter-indicator">
            <span className="date-filter-text">
              Showing todos for {formatDate(selectedDate, 'short')}
            </span>
            <button
              className="date-filter-clear"
              onClick={clearDateFilter}
            >
              Clear filter
            </button>
          </div>
        )}

        <TodoList
          todos={todos}
          onToggle={toggleTodo}
          onDelete={deleteTodo}
          onEdit={editTodo}
          onUpdatePriority={updatePriority}
          filter={filter}
        />

        <TodoFilters
          filter={filter}
          onFilterChange={changeFilter}
          activeCount={activeCount}
          completedCount={completedCount}
          totalCount={totalCount}
          onClearCompleted={clearCompleted}
        />
      </main>

      <footer className="app-footer">
        <p>Double-click a todo to edit it</p>
      </footer>
    </div>
  );
}

export default App;
