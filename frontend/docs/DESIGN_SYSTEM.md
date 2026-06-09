# DESIGN SYSTEM

## Design Direction

Inspired by:

* Linear
* Raycast
* Notion
* Vercel Dashboard

Characteristics:

* Minimal
* Professional
* Information Dense
* Fast
* Clean
* Functional

Avoid:

* Glassmorphism
* Heavy shadows
* Excessive gradients
* Decorative UI
* Oversized cards

The UI should prioritize productivity over visual effects.

---

# Typography

## Font Family

Primary:

Satoshi

Fallback:

Inter

---

## Type Scale

Display

Used for:

* Marketing headlines only

Heading

Used for:

* Page titles

Title

Used for:

* Section titles
* Dialog titles

Body

Used for:

* Main content

Caption

Used for:

* Metadata
* Helper text

Use typography consistently.

Do not invent custom font sizes for individual screens.

---

# Spacing System

Use a consistent spacing scale.

Base Unit:

4px

Scale:

4px
8px
12px
16px
20px
24px
32px
40px
48px
64px

All spacing should derive from this system.

Avoid arbitrary spacing values.

---

# Radius System

sm = 6px

md = 8px

lg = 12px

xl = 16px

Avoid excessive rounding.

The product should feel professional rather than playful.

---

# Shadow System

Use subtle shadows only.

Levels:

sm
md
lg

Purpose:

* Surface separation
* Depth indication

Avoid floating-card aesthetics.

Linear and Vercel should be the reference.

---

# Theme Strategy

Support:

* Dark Theme
* Light Theme
* System Theme

Dark Mode is the primary design language.

Light Mode must be equally polished.

Every component must support both themes.

---

# Semantic Color Tokens

## Core

background
foreground

## Surfaces

card
card-foreground

popover
popover-foreground

## Actions

primary
primary-foreground

secondary
secondary-foreground

accent
accent-foreground

destructive
destructive-foreground

## Utility

muted
muted-foreground

border

input

ring

## Sidebar

sidebar

sidebar-foreground

sidebar-border

sidebar-accent

sidebar-accent-foreground

---

# Component Rules

Components may only use semantic tokens.

Allowed:

bg-background

text-foreground

border-border

bg-card

Not Allowed:

bg-black

bg-white

text-gray-300

border-zinc-800

Hardcoded theme colors are forbidden.

---

# Layout Principles

Application Layout:

Sidebar

Topbar

Main Content Area

Information should be structured using hierarchy rather than decoration.

---

# Data Density

The application is a productivity tool.

Prefer:

* Dense layouts
* Efficient spacing
* Visible information

Avoid:

* Oversized cards
* Massive padding
* Empty whitespace

Users should be able to scan large amounts of information quickly.

---

# Responsive Design

Support:

* Desktop
* Tablet
* Mobile

Mobile should not be treated as an afterthought.

Layouts should adapt gracefully.

---

# Interaction Design

Support:

* Keyboard navigation
* Focus states
* Hover states
* Active states

Interactions should feel immediate and responsive.

Avoid unnecessary animations.

Animations should communicate state changes, not decorate the UI.

---

# Component Philosophy

Prefer:

* Composition
* Reusability
* Predictability

Avoid:

* One-off components
* Deep component hierarchies
* Business logic inside UI

A component should do one thing well.
