# KANBAN PROJECT MANAGEMENT SYSTEM

## Product Vision

Build a modern SaaS Project Management System inspired by:

* Linear
* Notion
* Raycast
* Vercel Dashboard

The product should feel:

* Fast
* Professional
* Minimal
* Responsive
* Keyboard Friendly
* Information Dense

This is not a marketing website.

This is a production-grade application used daily by teams to manage projects, tasks, and collaboration.

---

# Tech Stack

## Framework

* Next.js 15+
* TypeScript

## Styling

* Tailwind CSS
* shadcn/ui

## State Management

* Zustand

## Server State

* TanStack Query

## Forms

* React Hook Form
* Zod

## Drag & Drop

* dnd-kit

## Icons

* Lucide React

## Typography

Primary:

* Satoshi

Fallback:

* Inter

---

# Frontend Principles

Always:

* Use TypeScript strict mode.
* Prefer composition over inheritance.
* Build reusable components.
* Build accessible components.
* Build responsive layouts.
* Follow App Router conventions.
* Use semantic design tokens.
* Prefer Server Components where possible.
* Keep components focused and maintainable.

Never:

* Use `any`.
* Hardcode colors.
* Hardcode spacing values repeatedly.
* Duplicate UI.
* Store API state inside Zustand.
* Place business logic inside presentational components.
* Create giant page files.
* Create giant reusable components.

---

# State Management Rules

## Zustand

Use only for:

* Sidebar state
* Theme preferences
* Drawer state
* Modal state
* Command palette state
* UI preferences

## TanStack Query

Use for:

* API data
* Query caching
* Query invalidation
* Mutations
* Server synchronization

Never duplicate server state inside Zustand.

---

# Backend Integration

Backend is production-ready FastAPI.

Frontend must consume real APIs.

Do not mock API responses unless explicitly requested.

API Base:

/api/v1

Authentication:

* JWT Access Token
* Refresh Token Cookie

Never invent API request or response shapes.

Always follow API_CONTRACTS.md.

---

# Design Philosophy

Inspired by:

* Linear
* Notion
* Raycast
* Vercel Dashboard

Prioritize:

* Usability
* Information Density
* Speed
* Clarity
* Consistency

Avoid:

* Glassmorphism
* Excessive gradients
* Decorative UI
* Dribbble-style fake dashboards
* Empty whitespace-heavy layouts

The UI should feel like a professional productivity tool.

---

# Theme Support

The application must support:

* Dark Mode
* Light Mode
* System Theme

Dark Mode is the primary design reference.

However:

* Light Mode must be equally polished.
* Light Mode must not feel like an afterthought.
* Every component must support both themes.
* Theme switching must persist across sessions.

Never hardcode theme-specific colors.

Good:

bg-background

text-foreground

border-border

bg-card

Bad:

bg-black

bg-white

text-gray-300

border-zinc-800

---

# Theme Validation

Before considering any task complete:

* Verify Dark Mode
* Verify Light Mode
* Verify Theme Switching

A component is not complete until all three pass.

---

# Accessibility Requirements

All interactive elements must:

* Support keyboard navigation
* Have visible focus states
* Use semantic HTML
* Meet accessibility standards

Accessibility is not optional.

---

# Performance Requirements

Prefer:

* Server Components
* Lazy loading when appropriate
* Query caching
* Memoization only when needed

Avoid premature optimization.

Optimize based on actual bottlenecks.

---

# Development Workflow

Before implementing any feature:

1. Analyze requirements
2. Review architecture
3. Review existing docs
4. Create component hierarchy
5. Create state strategy
6. Create query strategy

Do not implement first and think later.

Architecture comes before implementation.
