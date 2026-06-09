# FRONTEND ARCHITECTURE

## Folder Structure

src/

app/
components/
features/
services/
hooks/
stores/
providers/
types/
constants/
lib/

---

## Shared Components

Location:

components/

Contains:

* UI primitives
* Layouts
* Navigation
* Shared reusable components

No business logic.

---

## Feature Structure

Each feature owns its implementation.

Example:

features/auth

components/
hooks/
services/
queries/
types/

Example:

features/task

components/
hooks/
services/
queries/
types/

---

## Data Flow

Backend API

↓

Service Layer

↓

TanStack Query

↓

Feature Components

↓

Shared Components

Never call APIs directly from UI components.

---

## API Layer

All API communication belongs in:

services/

Example:

services/auth.service.ts
services/project.service.ts
services/task.service.ts

---

## Query Layer

All server state belongs inside:

features/*/queries

Use:

* useQuery
* useMutation
* query invalidation

Never store server state globally.

---

## Global State

Only UI state belongs inside stores/.

Examples:

* Sidebar open state
* Theme preferences
* Active drawer
* Command palette state

No API data.
