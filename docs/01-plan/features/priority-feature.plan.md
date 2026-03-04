# priority-feature Planning Document

> **Summary**: Add priority levels (high, medium, low) to todos with visual indicators, sorting, and filtering
>
> **Project**: todo-app
> **Version**: 0.0.0
> **Author**: Claude Sonnet 4.5
> **Date**: 2026-03-02
> **Status**: Draft

---

## 1. Overview

### 1.1 Purpose

Enable users to prioritize their todos by assigning importance levels (high, medium, low), helping them focus on critical tasks first. This feature provides visual indicators and sorting capabilities to better organize and manage task priorities.

### 1.2 Background

Current todo app lacks task prioritization, making it difficult for users to distinguish urgent tasks from less important ones. Users have requested the ability to:
- Visually identify high-priority tasks at a glance
- Sort tasks by priority to focus on what matters most
- Maintain the Apple design aesthetic with elegant priority indicators

### 1.3 Related Documents

- Base Implementation: `docs/01-plan/features/todo-app.plan.md`
- Design System: Apple-style design tokens in `src/index.css`
- Architecture: Clean 4-layer architecture (Domain → Infrastructure → Application → Presentation)

---

## 2. Scope

### 2.1 In Scope

- [ ] Add priority field to Todo entity (high, medium, low)
- [ ] Priority selector in TodoInput component
- [ ] Visual priority indicators on todo items (colored tags/badges)
- [ ] Sort todos by priority (high → medium → low)
- [ ] Default priority (medium) for new todos
- [ ] Edit priority on existing todos
- [ ] Persist priority in localStorage
- [ ] Apple-style visual design for priority indicators
- [ ] Accessibility: Screen reader support for priority levels
- [ ] Keyboard navigation for priority selector

### 2.2 Out of Scope

- Custom priority levels (only 3 levels: high, medium, low)
- Priority-based notifications or reminders
- Due dates or deadlines
- Priority statistics or analytics
- Drag-and-drop priority reordering
- Priority color customization by user
- Recurring tasks with priority
- Priority inheritance or dependencies

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | Add priority field to Todo entity with validation | High | Pending |
| FR-02 | Priority selector (dropdown/segmented control) in add todo form | High | Pending |
| FR-03 | Visual priority badge on todo items (colored, Apple-style) | High | Pending |
| FR-04 | Sort todos by priority: high → medium → low → completed | High | Pending |
| FR-05 | Default new todos to medium priority | Medium | Pending |
| FR-06 | Edit priority on existing todos (click badge to change) | Medium | Pending |
| FR-07 | Persist priority to localStorage | High | Pending |
| FR-08 | Screen reader announces priority level | Medium | Pending |
| FR-09 | Keyboard navigation for priority selector (arrow keys) | Low | Pending |
| FR-10 | Priority retained when editing todo text | High | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | No impact on render time (< 200ms) | Chrome DevTools Performance |
| Usability | Priority change in ≤ 2 clicks | User testing |
| Accessibility | WCAG 2.1 AA compliance maintained | axe-core, manual testing |
| Visual Design | Consistent with Apple design system | Design review |
| Code Quality | Zero ESLint errors, clean architecture | `npm run lint` |
| Data Migration | Existing todos default to medium priority | Manual verification |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] All 10 functional requirements implemented
- [ ] Priority field added to domain model with validation
- [ ] UI components updated with Apple-style priority selector
- [ ] Sorting algorithm prioritizes high → medium → low
- [ ] Existing todos migrated with default priority
- [ ] Unit tests for priority logic
- [ ] Accessibility testing passed (keyboard, screen reader)
- [ ] Documentation updated (design, architecture)

### 4.2 Quality Criteria

- [ ] Zero lint errors
- [ ] Build succeeds
- [ ] No regression in existing functionality
- [ ] Priority sorting performance < 50ms for 100 todos
- [ ] Visual design approved (matches Apple aesthetic)
- [ ] Accessibility score remains > 95 (Lighthouse)

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Data migration breaks existing todos | High | Low | Add migration logic with fallback to default priority |
| Priority UI clutters interface | Medium | Medium | Use subtle, compact badges; hide when not important |
| Performance impact on sorting | Low | Low | Use efficient sorting (memoized), test with large datasets |
| Accessibility regression | Medium | Low | Test with screen readers, maintain ARIA labels |
| User confusion on priority levels | Low | Medium | Clear visual hierarchy (red=high, yellow=medium, blue=low) |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Characteristics | Recommended For | Selected |
|-------|-----------------|-----------------|:--------:|
| **Starter** | Simple structure (`components/`, `lib/`, `types/`) | Static sites, portfolios, landing pages | ☑ |
| **Dynamic** | Feature-based modules, BaaS integration (bkend.ai) | Web apps with backend, SaaS MVPs, fullstack apps | ☐ |
| **Enterprise** | Strict layer separation, DI, microservices | High-traffic systems, complex architectures | ☐ |

**Note**: Maintaining Starter level with clean architecture principles.

### 6.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| Priority Type | Enum / String / Number | **String enum** | Type-safe, readable in storage |
| Priority Storage | Separate field / Nested object | **Separate field** | Simple, no nesting needed |
| Priority Selector | Dropdown / Segmented Control / Radio | **Segmented Control** | Apple-style, compact, visual |
| Priority Badge | Text / Icon / Color dot | **Color badge with text** | Accessible, clear visual hierarchy |
| Sort Strategy | Client-side / Server-side | **Client-side** | Local-only app, no server |
| Default Priority | None / Low / Medium / High | **Medium** | Neutral default, user can adjust |

### 6.3 Clean Architecture Approach

```
Priority Feature Layer Assignment:

Domain Layer (src/types/todo.js):
  - Add priority field to Todo type
  - Add PRIORITY_LEVELS constant { HIGH, MEDIUM, LOW }
  - Update createTodo() to accept priority parameter
  - Update updateTodo() to validate priority
  - Add isValidPriority() validation function

Infrastructure Layer (src/services/storageService.js):
  - No changes needed (handles any Todo structure)

Application Layer (src/hooks/useTodos.js):
  - Add priority parameter to addTodo(text, priority)
  - Add updatePriority(id, priority) action
  - Add sortByPriority() memo for sorted todos
  - Update filtering to respect priority sort

Presentation Layer:
  - src/components/TodoInput.jsx: Add priority selector
  - src/components/TodoItem.jsx: Add priority badge
  - src/components/PrioritySelector.jsx: NEW component
  - src/components/PriorityBadge.jsx: NEW component
```

---

## 7. Convention Prerequisites

### 7.1 Existing Project Conventions

Check which conventions already exist in the project:

- [x] ESLint configuration (`.eslintrc.*`)
- [x] Apple design system (CSS custom properties)
- [x] Component naming: PascalCase
- [x] Function naming: camelCase
- [x] Clean architecture: 4-layer separation
- [x] JSDoc documentation
- [ ] Unit tests (configured but not implemented)

### 7.2 Conventions to Define/Verify

| Category | Current State | To Define | Priority |
|----------|---------------|-----------|:--------:|
| **Priority Colors** | N/A | high=red, medium=yellow, low=blue | High |
| **Priority Order** | N/A | high → medium → low → completed | High |
| **Default Priority** | N/A | medium for new todos | High |
| **Priority Validation** | N/A | Only allow high/medium/low | High |
| **Priority Icons** | N/A | Optional flag/star icons | Low |

### 7.3 Environment Variables Needed

| Variable | Purpose | Scope | To Be Created |
|----------|---------|-------|:-------------:|
| N/A | No environment variables needed | - | N/A |

### 7.4 Pipeline Integration

Not using 9-phase pipeline for this feature (incremental enhancement).

---

## 8. Design Decisions

### 8.1 Priority Levels

```javascript
// Domain Constants
export const PRIORITY_LEVELS = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

// Visual Design (Apple-style)
HIGH:   Red badge, #FF3B30 (iOS red)
MEDIUM: Yellow badge, #FFCC00 (iOS yellow)
LOW:    Blue badge, #007AFF (iOS blue)
```

### 8.2 UI Components

**Priority Selector (Segmented Control)**:
```
┌─────────────────────────────────────┐
│  [🔴 High] [🟡 Medium] [🔵 Low]   │
└─────────────────────────────────────┘
```

**Priority Badge on Todo Item**:
```
┌────────────────────────────────────────┐
│ ☐  🔴 HIGH  Buy groceries    [✏️] [🗑️] │
│ ☐  🟡 MED   Write docs       [✏️] [🗑️] │
│ ☐  🔵 LOW   Check email      [✏️] [🗑️] │
└────────────────────────────────────────┘
```

### 8.3 Sorting Logic

```
Sort Order:
1. Incomplete todos (sorted by priority: high → medium → low)
2. Completed todos (sorted by completion time, recent first)

Within same priority:
- Sort by creation date (oldest first)
```

---

## 9. Next Steps

1. [ ] Create design document (`priority-feature.design.md`)
2. [ ] Update domain model (todo.js)
3. [ ] Create PrioritySelector component
4. [ ] Create PriorityBadge component
5. [ ] Update TodoInput component
6. [ ] Update TodoItem component
7. [ ] Update useTodos hook with sorting
8. [ ] Add migration logic for existing todos
9. [ ] Test and verify

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-03-02 | Initial draft | Claude Sonnet 4.5 |
