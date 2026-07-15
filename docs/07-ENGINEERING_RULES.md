# Engineering Rules

## Purpose

This document defines the engineering standards, architecture constraints, naming conventions, and development guidelines for the KISFA Progress Dashboard project.

All generated code must follow these rules.

This document is considered a source of truth alongside:

* 01-PRD.md
* 02-UI_UX_SPEC.md
* 03-DATABASE_SCHEMA.md
* 04-API_SPEC.md
* 05-DESIGN_SYSTEM.md
* 06-TASKS.md

---

# Core Principles

## Simplicity First

Prefer simple solutions over complex solutions.

Avoid unnecessary abstractions.

Do not introduce complexity that is not required by the MVP.

---

## Type Safety

All code must be fully typed.

Requirements:

* TypeScript strict mode enabled
* No usage of any
* No implicit types
* Explicit interfaces preferred

Bad:

```ts
const student: any = {}
```

Good:

```ts
const student: Student
```

---

## Reusability

Components should be reusable whenever possible.

Avoid duplicated UI implementations.

If the same UI pattern appears more than twice:

Create a reusable component.

---

## Separation of Concerns

Business logic must not live inside UI components.

Bad:

```tsx
DashboardCard.tsx
```

Contains:

* API calls
* Data transformation
* UI rendering

Good:

```tsx
services/dashboard.service.ts
```

Handles:

* data fetching
* transformations

```tsx
DashboardCard.tsx
```

Handles:

* rendering only

---

# Project Architecture

## Folder Structure

```text
src/

app/

components/
ui/
layout/
dashboard/

services/

types/

hooks/

lib/

constants/

utils/
```

---

# Component Rules

## Component Size

Preferred:

* less than 150 lines

Maximum:

* 300 lines

If component exceeds 300 lines:

Split into smaller components.

---

## Component Responsibilities

One component should have one responsibility.

Bad:

```tsx
Dashboard.tsx

- Fetch Data
- Transform Data
- Render Layout
- Render Tables
- Render Charts
```

Good:

```tsx
DashboardPage

DashboardHeader

KPICards

ProgressChart

TeacherNotes
```

---

# Naming Conventions

## Components

PascalCase

Example:

```text
StudentProfileCard.tsx

ProgressChart.tsx

TeacherNotesCard.tsx
```

---

## Hooks

camelCase with use prefix

Example:

```text
useStudentData.ts

useDashboardData.ts
```

---

## Services

camelCase

Example:

```text
studentService.ts

dashboardService.ts
```

---

## Types

PascalCase

Example:

```ts
Student

DashboardData

TeacherNote
```

---

# API Rules

## API Routes

Use REST naming conventions.

Good:

```text
/api/login

/api/dashboard

/api/student
```

Bad:

```text
/api/getStudentData

/api/fetchDashboard
```

---

## Response Format

Success:

```json
{
  "success": true,
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Student not found"
}
```

---

# State Management

## Preferred Order

1. React Server Components
2. Server Actions
3. React State
4. Context API

Avoid introducing Redux or Zustand unless absolutely necessary.

The MVP does not require global state libraries.

---

# Data Fetching

Use:

```text
Server Components First
```

Whenever possible.

Avoid unnecessary client-side fetching.

---

# Styling Rules

## Framework

Tailwind CSS

Only Tailwind CSS should be used.

Do not introduce:

* Bootstrap
* Material UI
* Chakra UI

---

## Components

Use:

shadcn/ui

for:

* Dialog
* Sheet
* Table
* Card
* Form
* Button

---

# UI Principles

Design must feel:

* Fun
* Friendly
* Modern
* Child-Friendly

Inspired by:

* Duolingo
* Khan Academy Kids

Avoid:

* Corporate Dashboard Feel
* Enterprise UI
* Dark Heavy Layouts

---

# Color Rules

Use only colors defined in:

05-DESIGN_SYSTEM.md

Do not invent new primary colors.

---

# Accessibility

All interactive elements must include:

* aria-label
* keyboard support
* focus states

---

# Error Handling

Every API call must handle:

* Loading
* Success
* Empty State
* Error State

No silent failures allowed.

---

# Performance Rules

Use:

* next/image
* dynamic imports where appropriate
* memoization when necessary

Avoid premature optimization.

---

# Security Rules

Never expose:

* Google API Keys
* Service Account Credentials
* Secrets

Use environment variables only.

---

# Logging

Development:

console.log allowed

Production:

remove unnecessary logs

---

# Testing

Minimum Requirements:

* Authentication flow
* Dashboard data loading
* KPI calculation logic

Preferred:

* Vitest
* React Testing Library

---

# Git Commit Convention

Format:

```text
type(scope): description
```

Examples:

```text
feat(auth): add student login

feat(dashboard): add KPI cards

fix(chart): resolve tooltip issue

refactor(service): simplify sheet parser
```

---

# Definition of Done

A task is complete only if:

* Code compiles
* TypeScript passes
* ESLint passes
* Responsive on mobile
* Responsive on desktop
* No console errors
* Loading states exist
* Error states exist
* Empty states exist

---

# AI Agent Instructions

Before generating any code:

1. Read all files inside /docs
2. Follow architecture rules
3. Follow naming conventions
4. Follow design system
5. Follow engineering standards
6. Avoid introducing technologies not listed in the documentation

If a requirement is ambiguous:

Do not guess.

Document assumptions and ask for clarification.

END OF DOCUMENT
