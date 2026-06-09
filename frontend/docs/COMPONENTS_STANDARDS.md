# COMPONENT STANDARDS

## General Rules

Components should have a single responsibility.

Keep components focused.

---

## Size Limits

Preferred:

Below 200 lines

Maximum:

300 lines

If larger:

Refactor.

---

## Props

Always type props.

Never use implicit any.

---

## Accessibility

Support:

* Keyboard navigation
* Focus states
* ARIA labels where necessary

---

## Reusability

Ask:

Can this component be reused?

If yes:

Move it to shared components.

---

## Business Logic

Business logic belongs in:

hooks
queries
services

Not inside presentational components.
