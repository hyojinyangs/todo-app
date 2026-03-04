# priority-feature Design Document

> **Summary**: Priority levels (high/medium/low) with Apple-style badges, segmented control selector, and intelligent sorting
>
> **Project**: todo-app
> **Version**: 0.0.0
> **Author**: Claude Sonnet 4.5
> **Date**: 2026-03-02
> **Status**: Draft
> **Planning Doc**: [priority-feature.plan.md](../../01-plan/features/priority-feature.plan.md)

---

## 1. Overview

### 1.1 Design Goals

1. **Visual Clarity**: Instant recognition of task priority through color-coded badges
2. **Apple Aesthetic**: Consistent with iOS/macOS design language (SF Pro, rounded corners, subtle shadows)
3. **Minimal Friction**: Priority selection in ≤2 clicks, no modals or popups
4. **Smart Sorting**: Automatic prioritization - high tasks always visible first
5. **Accessibility First**: Screen reader support, keyboard navigation, color-blind friendly
6. **Performance**: Zero impact on render time, optimized sorting with memoization

### 1.2 Design Principles

- **Visual Hierarchy**: Color, size, and position indicate importance
- **Progressive Disclosure**: Priority selector only shown when needed
- **Consistent Patterns**: Reuse existing component patterns (badges similar to filter buttons)
- **Reversible Actions**: Easy to change priority without consequences
- **Apple Design Language**: Rounded, soft shadows, subtle animations, SF Pro typography

---

## 2. Architecture

### 2.1 Component Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                     Priority Feature Architecture             │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Presentation Layer                                          │
│  ┌────────────────┐    ┌────────────────┐                  │
│  │  TodoInput     │    │   TodoItem     │                  │
│  │  (modified)    │    │  (modified)    │                  │
│  │                │    │                │                  │
│  │ ┌────────────┐ │    │ ┌────────────┐ │                  │
│  │ │ Priority   │ │    │ │ Priority   │ │                  │
│  │ │ Selector   │ │    │ │  Badge     │ │                  │
│  │ │  (NEW)     │ │    │ │  (NEW)     │ │                  │
│  │ └────────────┘ │    │ └────────────┘ │                  │
│  └────────────────┘    └────────────────┘                  │
│         │                       │                           │
│         └───────────┬───────────┘                           │
│                     ▼                                       │
│  Application Layer                                          │
│  ┌──────────────────────────────────┐                      │
│  │       useTodos Hook              │                      │
│  │       (modified)                 │                      │
│  │                                  │                      │
│  │  - addTodo(text, priority)       │                      │
│  │  - updatePriority(id, priority)  │                      │
│  │  - sortedTodos (memoized)        │                      │
│  └──────────────────────────────────┘                      │
│         │                                                   │
│         ▼                                                   │
│  Domain Layer                                               │
│  ┌──────────────────────────────────┐                      │
│  │       todo.js                     │                      │
│  │       (modified)                 │                      │
│  │                                  │                      │
│  │  + PRIORITY_LEVELS constant      │                      │
│  │  + priority field in Todo        │                      │
│  │  + isValidPriority() function    │                      │
│  └──────────────────────────────────┘                      │
│         │                                                   │
│         ▼                                                   │
│  Infrastructure Layer                                       │
│  ┌──────────────────────────────────┐                      │
│  │    storageService.js             │                      │
│  │    (no changes)                  │                      │
│  │                                  │                      │
│  │  Handles priority field          │                      │
│  │  automatically                   │                      │
│  └──────────────────────────────────┘                      │
│                                                             │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

```
Priority Assignment Flow:
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  User Action: Select Priority                             │
│       │                                                    │
│       ├─ Click on segmented control (HIGH/MED/LOW)        │
│       │         │                                          │
│       │         └─ Visual feedback (selected state)       │
│       │                                                    │
│       ├─ Type text in input                               │
│       │                                                    │
│       └─ Press Enter / Click Add                          │
│                 │                                          │
│                 ▼                                          │
│      useTodos.addTodo(text, priority)                    │
│                 │                                          │
│                 ├─ createTodo(text, priority)             │
│                 │     │                                    │
│                 │     ├─ Validate priority                │
│                 │     ├─ Default to 'medium' if invalid   │
│                 │     └─ Create todo object               │
│                 │                                          │
│                 ├─ setTodos([...prev, newTodo])           │
│                 │                                          │
│                 └─ useMemo triggers sortedTodos           │
│                           │                                │
│                           ▼                                │
│                  Sort by priority + status                │
│                     │                                      │
│                     ├─ Incomplete: high → medium → low    │
│                     └─ Complete: by completion time       │
│                           │                                │
│                           ▼                                │
│                  TodoList re-renders with sorted order    │
│                           │                                │
│                           ▼                                │
│                  PriorityBadge displays color indicator   │
│                                                            │
└────────────────────────────────────────────────────────────┘

Priority Update Flow:
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  User Action: Click Priority Badge                        │
│       │                                                    │
│       ├─ Badge shows current priority                     │
│       │                                                    │
│       └─ Click badge                                       │
│                 │                                          │
│                 ▼                                          │
│         Toggle priority (high → medium → low → high)      │
│                 │                                          │
│                 ▼                                          │
│      useTodos.updatePriority(id, newPriority)            │
│                 │                                          │
│                 ├─ updateTodo(todo, { priority })         │
│                 │                                          │
│                 ├─ setTodos with updated todo             │
│                 │                                          │
│                 └─ Re-sort triggers                        │
│                           │                                │
│                           ▼                                │
│                  List re-orders based on new priority     │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 3. Data Model

### 3.1 Entity Definition

```typescript
/**
 * Priority Levels (Domain Constants)
 */
export const PRIORITY_LEVELS = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
} as const;

export type Priority = typeof PRIORITY_LEVELS[keyof typeof PRIORITY_LEVELS];

/**
 * Updated Todo Entity
 */
interface Todo {
  id: string;           // Unique identifier
  text: string;         // Todo content (1-500 chars)
  completed: boolean;   // Completion status
  priority: Priority;   // NEW: Priority level (high/medium/low)
  createdAt: number;    // Creation timestamp
  updatedAt: number;    // Last update timestamp
}

/**
 * Priority Metadata
 */
interface PriorityConfig {
  value: Priority;      // 'high' | 'medium' | 'low'
  label: string;        // 'High' | 'Medium' | 'Low'
  color: string;        // '#FF3B30' | '#FFCC00' | '#007AFF'
  emoji: string;        // '🔴' | '🟡' | '🔵'
  sortOrder: number;    // 1 | 2 | 3
}
```

### 3.2 Priority Configuration

```javascript
// Priority metadata for UI rendering
export const PRIORITY_CONFIG = {
  high: {
    value: 'high',
    label: 'High',
    color: '#FF3B30',     // iOS Red
    emoji: '🔴',
    sortOrder: 1,
    ariaLabel: 'High priority',
  },
  medium: {
    value: 'medium',
    label: 'Medium',
    color: '#FFCC00',     // iOS Yellow
    emoji: '🟡',
    sortOrder: 2,
    ariaLabel: 'Medium priority',
  },
  low: {
    value: 'low',
    label: 'Low',
    color: '#007AFF',     // iOS Blue
    emoji: '🔵',
    sortOrder: 3,
    ariaLabel: 'Low priority',
  },
};
```

### 3.3 LocalStorage Schema

```javascript
// Updated storage structure
localStorage.setItem('todo-app-todos', JSON.stringify([
  {
    "id": "1709340000000-abc123",
    "text": "Complete urgent report",
    "completed": false,
    "priority": "high",      // NEW FIELD
    "createdAt": 1709340000000,
    "updatedAt": 1709340000000
  },
  {
    "id": "1709340001000-def456",
    "text": "Review documentation",
    "completed": false,
    "priority": "medium",    // NEW FIELD
    "createdAt": 1709340001000,
    "updatedAt": 1709340001000
  },
  {
    "id": "1709340002000-ghi789",
    "text": "Check email",
    "completed": false,
    "priority": "low",       // NEW FIELD
    "createdAt": 1709340002000,
    "updatedAt": 1709340002000
  }
]));

// Migration: Existing todos without priority default to 'medium'
```

---

## 4. UI/UX Design

### 4.1 Priority Selector Component (New)

**Location**: `src/components/PrioritySelector.jsx`

```
┌────────────────────────────────────────────────┐
│  Priority Selector (Segmented Control)         │
├────────────────────────────────────────────────┤
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │  [🔴 High] [🟡 Medium] [🔵 Low]         │ │
│  │     ▲         ─           ─              │ │
│  │   selected   normal     normal           │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  Apple-style segmented control:                │
│  - Rounded background (#F2F2F7)               │
│  - Selected: Colored background + white text  │
│  - Unselected: Transparent + gray text        │
│  - Smooth transition on selection             │
│  - Touch-friendly (44px height)               │
│                                                │
└────────────────────────────────────────────────┘

States:
1. Default: Medium selected
2. Hover: Subtle background on unselected
3. Selected: Full color background + white text
4. Focus: Blue outline (keyboard navigation)
5. Disabled: Opacity 0.5, cursor not-allowed
```

**CSS Specifications**:
```css
.priority-selector {
  display: flex;
  background: var(--surface-muted);
  padding: var(--space-1);
  border-radius: var(--radius-md);
  gap: var(--space-1);
}

.priority-button {
  flex: 1;
  padding: var(--space-2) var(--space-3);
  font-size: var(--font-size-sm);
  font-weight: 600;
  border: none;
  border-radius: var(--radius-sm);
  transition: all var(--transition-normal);
  cursor: pointer;
}

.priority-button--high.selected {
  background: #FF3B30;
  color: white;
  box-shadow: 0 2px 8px rgba(255, 59, 48, 0.3);
}

.priority-button--medium.selected {
  background: #FFCC00;
  color: #000000;
  box-shadow: 0 2px 8px rgba(255, 204, 0, 0.3);
}

.priority-button--low.selected {
  background: #007AFF;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3);
}
```

### 4.2 Priority Badge Component (New)

**Location**: `src/components/PriorityBadge.jsx`

```
┌────────────────────────────────────────────────┐
│  Priority Badge (on TodoItem)                  │
├────────────────────────────────────────────────┤
│                                                │
│  Size: Compact (20px height)                  │
│  ┌─────────────┐                              │
│  │  🔴 HIGH   │  ← High priority              │
│  └─────────────┘                              │
│                                                │
│  ┌─────────────┐                              │
│  │  🟡 MED    │  ← Medium priority            │
│  └─────────────┘                              │
│                                                │
│  ┌─────────────┐                              │
│  │  🔵 LOW    │  ← Low priority               │
│  └─────────────┘                              │
│                                                │
│  Interaction:                                  │
│  - Click badge to cycle priority              │
│  - Hover: Subtle scale (1.05)                 │
│  - Cursor: pointer (indicates clickable)      │
│                                                │
└────────────────────────────────────────────────┘

Badge States:
1. Normal: Small, compact, colored background
2. Hover: Scale 1.05, brighter shadow
3. Active: Scale 0.98 (pressed)
4. Focus: Outline for keyboard nav
```

**CSS Specifications**:
```css
.priority-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  font-size: var(--font-size-xs);
  font-weight: 700;
  letter-spacing: 0.02em;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-normal);
  user-select: none;
}

.priority-badge--high {
  background: rgba(255, 59, 48, 0.12);
  color: #FF3B30;
}

.priority-badge--medium {
  background: rgba(255, 204, 0, 0.12);
  color: #D99F00;
}

.priority-badge--low {
  background: rgba(0, 122, 255, 0.12);
  color: #007AFF;
}

.priority-badge:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

### 4.3 Updated TodoInput Layout

```
┌────────────────────────────────────────────────────────────┐
│  Add New Todo                                              │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Priority Selector (above input)                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │  [🔴 High] [🟡 Medium] [🔵 Low]                │    │
│  └──────────────────────────────────────────────────┘    │
│                                                            │
│  Text Input + Add Button                                  │
│  ┌────────────────────────────────────────┐  ┌────────┐  │
│  │  Enter your todo...                    │  │  Add   │  │
│  └────────────────────────────────────────┘  └────────┘  │
│                                                            │
└────────────────────────────────────────────────────────────┘

Layout Changes:
- Priority selector added above input field
- Maintains spacing: 12px between selector and input
- Mobile: Stack vertically with same order
```

### 4.4 Updated TodoItem Layout

```
┌────────────────────────────────────────────────────────────┐
│  Todo Item with Priority Badge                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  [☐] [🔴 HIGH] Write urgent report      [Edit] [Delete]  │
│       ▲                                                    │
│       Priority badge (clickable)                          │
│                                                            │
│  [☐] [🟡 MED] Review documentation      [Edit] [Delete]  │
│                                                            │
│  [☐] [🔵 LOW] Check email               [Edit] [Delete]  │
│                                                            │
│  [☑] [🟡 MED] Completed task            [Edit] [Delete]  │
│       ▲                                                    │
│       Completed todos retain priority badge (grayed out)  │
│                                                            │
└────────────────────────────────────────────────────────────┘

Component Order:
1. Checkbox (26px)
2. Priority Badge (auto-width, ~60-70px)
3. Todo Text (flex: 1)
4. Action Buttons (Edit, Delete)

Spacing: 12px gap between elements
```

### 4.5 Sorting Visual Behavior

```
┌────────────────────────────────────────────────────────────┐
│  Sorted Todo List                                          │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌───────────────── HIGH PRIORITY ─────────────────────┐ │
│  │  ☐ 🔴 HIGH  Complete urgent report                  │ │
│  │  ☐ 🔴 HIGH  Submit quarterly review                 │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌───────────────── MEDIUM PRIORITY ───────────────────┐ │
│  │  ☐ 🟡 MED  Write documentation                      │ │
│  │  ☐ 🟡 MED  Review pull requests                     │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌───────────────── LOW PRIORITY ──────────────────────┐ │
│  │  ☐ 🔵 LOW  Check email                              │ │
│  │  ☐ 🔵 LOW  Organize files                           │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                            │
│  ─────────────────── COMPLETED ───────────────────────   │
│  │  ☑ 🟡 MED  Yesterday's task                         │ │
│  │  ☑ 🔵 LOW  Old task                                 │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                            │
└────────────────────────────────────────────────────────────┘

Sorting Rules:
1. Incomplete todos first, sorted by priority (high → medium → low)
2. Within same priority: oldest first (createdAt ascending)
3. Completed todos last, sorted by completion time (recent first)
4. Visual separation: Slight spacing between priority groups
```

---

## 5. Component Specifications

### 5.1 PrioritySelector Component

**File**: `src/components/PrioritySelector.jsx`

```jsx
/**
 * PrioritySelector - Segmented control for selecting priority
 *
 * Apple-style segmented control with three options: High, Medium, Low
 */
export function PrioritySelector({
  value = 'medium',
  onChange,
  disabled = false
}) {
  const priorities = ['high', 'medium', 'low'];

  return (
    <div className="priority-selector" role="radiogroup" aria-label="Priority level">
      {priorities.map((priority) => (
        <button
          key={priority}
          type="button"
          role="radio"
          aria-checked={value === priority}
          aria-label={PRIORITY_CONFIG[priority].ariaLabel}
          className={`priority-button priority-button--${priority} ${
            value === priority ? 'selected' : ''
          }`}
          onClick={() => onChange(priority)}
          disabled={disabled}
        >
          <span aria-hidden="true">{PRIORITY_CONFIG[priority].emoji}</span>
          {PRIORITY_CONFIG[priority].label}
        </button>
      ))}
    </div>
  );
}
```

**Props**:
- `value`: Current selected priority ('high' | 'medium' | 'low')
- `onChange`: Callback when priority changes
- `disabled`: Disable selector during submission

### 5.2 PriorityBadge Component

**File**: `src/components/PriorityBadge.jsx`

```jsx
/**
 * PriorityBadge - Compact badge showing priority level
 *
 * Clickable badge that cycles through priorities on click
 */
export function PriorityBadge({
  priority,
  onClick,
  disabled = false,
  readonly = false
}) {
  const config = PRIORITY_CONFIG[priority];

  const handleClick = () => {
    if (readonly || disabled) return;

    // Cycle through priorities: high → medium → low → high
    const nextPriority = {
      high: 'medium',
      medium: 'low',
      low: 'high'
    }[priority];

    onClick(nextPriority);
  };

  return (
    <button
      type="button"
      className={`priority-badge priority-badge--${priority}`}
      onClick={handleClick}
      disabled={disabled || readonly}
      aria-label={`${config.ariaLabel}. Click to change priority.`}
      title="Click to change priority"
    >
      <span aria-hidden="true">{config.emoji}</span>
      <span className="priority-badge-text">{config.label.toUpperCase()}</span>
    </button>
  );
}
```

**Props**:
- `priority`: Current priority level
- `onClick`: Callback with new priority when clicked
- `disabled`: Disable interactions
- `readonly`: Show badge but don't allow changes

### 5.3 Updated TodoInput Component

**Modifications**:
```jsx
export function TodoInput({ onAddTodo }) {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState('medium');  // NEW STATE
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const success = onAddTodo(text, priority);  // PASS PRIORITY

    if (success) {
      setText('');
      setPriority('medium');  // RESET TO DEFAULT
    }
    setIsSubmitting(false);
  };

  return (
    <form className="todo-input-form" onSubmit={handleSubmit}>
      {/* NEW: Priority Selector */}
      <PrioritySelector
        value={priority}
        onChange={setPriority}
        disabled={isSubmitting}
      />

      {/* Existing input field */}
      <input
        type="text"
        className="todo-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter your todo..."
        disabled={isSubmitting}
        maxLength={500}
      />

      <button
        type="submit"
        className="todo-input-button"
        disabled={!text.trim() || isSubmitting}
      >
        Add
      </button>
    </form>
  );
}
```

### 5.4 Updated TodoItem Component

**Modifications**:
```jsx
export function TodoItem({
  todo,
  onToggle,
  onDelete,
  onEdit,
  onUpdatePriority  // NEW PROP
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  const handlePriorityChange = (newPriority) => {
    onUpdatePriority(todo.id, newPriority);
  };

  return (
    <div className={`todo-item ${todo.completed ? 'todo-item--completed' : ''}`}>
      <div className="todo-item-content">
        {/* Existing checkbox */}
        <label className="todo-item-checkbox-wrapper">
          <input
            type="checkbox"
            className="todo-item-checkbox"
            checked={todo.completed}
            onChange={() => onToggle(todo.id)}
          />
          <span className="todo-item-checkbox-custom">
            {todo.completed && <CheckIcon />}
          </span>
        </label>

        {/* NEW: Priority Badge */}
        <PriorityBadge
          priority={todo.priority}
          onClick={handlePriorityChange}
          disabled={isEditing}
          readonly={todo.completed}
        />

        {/* Existing todo text */}
        {isEditing ? (
          <input
            type="text"
            className="todo-item-edit-input"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleEditKeyDown}
            onBlur={handleEditBlur}
            autoFocus
          />
        ) : (
          <span
            className="todo-item-text"
            onDoubleClick={() => !todo.completed && setIsEditing(true)}
            tabIndex={0}
          >
            {todo.text}
          </span>
        )}
      </div>

      {/* Existing action buttons */}
      <div className="todo-item-actions">
        <button
          className="todo-item-edit-button"
          onClick={() => setIsEditing(true)}
          disabled={todo.completed || isEditing}
        >
          Edit
        </button>
        <button
          className="todo-item-delete-button"
          onClick={() => onDelete(todo.id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
```

---

## 6. Implementation Guide

### 6.1 File Changes

| File | Type | Changes |
|------|------|---------|
| `src/types/todo.js` | Modify | Add PRIORITY_LEVELS, priority field, validation |
| `src/hooks/useTodos.js` | Modify | Add priority param, sorting logic, updatePriority |
| `src/components/PrioritySelector.jsx` | Create | New segmented control component |
| `src/components/PriorityBadge.jsx` | Create | New badge component |
| `src/components/PrioritySelector.css` | Create | Styles for selector |
| `src/components/PriorityBadge.css` | Create | Styles for badge |
| `src/components/TodoInput.jsx` | Modify | Add priority selector |
| `src/components/TodoInput.css` | Modify | Update layout for selector |
| `src/components/TodoItem.jsx` | Modify | Add priority badge |
| `src/components/TodoItem.css` | Modify | Update layout for badge |
| `src/components/index.js` | Modify | Export new components |

### 6.2 Implementation Order

1. **Domain Layer** (30 min)
   - [ ] Add PRIORITY_LEVELS constant to todo.js
   - [ ] Add PRIORITY_CONFIG to todo.js
   - [ ] Update createTodo() to accept priority parameter
   - [ ] Update updateTodo() to handle priority updates
   - [ ] Add isValidPriority() validation function

2. **Presentation Layer - Components** (2 hours)
   - [ ] Create PrioritySelector component + styles
   - [ ] Create PriorityBadge component + styles
   - [ ] Test components in isolation

3. **Application Layer** (1 hour)
   - [ ] Update useTodos hook
   - [ ] Add priority parameter to addTodo()
   - [ ] Add updatePriority() action
   - [ ] Add sortedTodos memoized value
   - [ ] Implement sorting algorithm

4. **Integration** (1.5 hours)
   - [ ] Update TodoInput with PrioritySelector
   - [ ] Update TodoItem with PriorityBadge
   - [ ] Wire up event handlers
   - [ ] Test data flow end-to-end

5. **Migration & Testing** (1 hour)
   - [ ] Add migration logic for existing todos
   - [ ] Test with empty state
   - [ ] Test with existing todos
   - [ ] Test priority updates
   - [ ] Test sorting behavior

**Total Estimated Time**: 6 hours

---

## 7. Sorting Algorithm

### 7.1 Sorting Logic

```javascript
/**
 * Sort todos by priority and completion status
 *
 * Sort order:
 * 1. Incomplete todos (by priority: high → medium → low, then by createdAt)
 * 2. Completed todos (by updatedAt desc, recent first)
 */
function sortTodosByPriority(todos) {
  return [...todos].sort((a, b) => {
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
}
```

### 7.2 Performance Considerations

- **Memoization**: Use `useMemo` to cache sorted results
- **Trigger**: Only re-sort when `todos` array changes
- **Complexity**: O(n log n) - efficient for typical todo counts (< 100)
- **Optimization**: Consider virtual scrolling if > 1000 todos

---

## 8. Accessibility

### 8.1 Screen Reader Support

**Priority Selector**:
```html
<div role="radiogroup" aria-label="Priority level">
  <button
    role="radio"
    aria-checked="true"
    aria-label="High priority"
  >
    🔴 High
  </button>
</div>
```

**Priority Badge**:
```html
<button
  aria-label="High priority. Click to change priority."
  title="Click to change priority"
>
  🔴 HIGH
</button>
```

**Announcements**:
- Priority change: "Priority changed to high"
- Todo added: "Todo added with high priority"
- Sort order change: "Todos sorted by priority"

### 8.2 Keyboard Navigation

| Key | Action |
|-----|--------|
| Tab | Navigate between priority buttons |
| Arrow Left/Right | Move between priorities in selector |
| Enter/Space | Select priority or toggle badge |
| Escape | Cancel priority change (if in edit mode) |

### 8.3 Color Accessibility

**Color-blind Friendly**:
- Red (high) vs Blue (low): Distinguishable for protanopia/deuteranopia
- Icons (🔴🟡🔵) provide additional visual cue beyond color
- Text labels (HIGH/MED/LOW) always present
- WCAG AA contrast maintained on all backgrounds

---

## 9. Migration Strategy

### 9.1 Data Migration

```javascript
/**
 * Migrate existing todos without priority field
 * Add default priority: 'medium'
 */
function migrateTodos(todos) {
  return todos.map(todo => ({
    ...todo,
    priority: todo.priority || 'medium'  // Default to medium
  }));
}

// In useTodos hook initialization:
useEffect(() => {
  const savedTodos = storageService.getTodos();
  const migratedTodos = migrateTodos(savedTodos);
  setTodos(migratedTodos);
}, []);
```

### 9.2 Backward Compatibility

- Existing todos without `priority` field default to 'medium'
- No breaking changes to data structure
- Existing filters (all/active/completed) continue to work
- Storage service handles new field automatically

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-03-02 | Complete design specification for priority feature | Claude Sonnet 4.5 |
