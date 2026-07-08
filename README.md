# KANDo — Professional Project Management Workspace

KANDo is a production-grade project management platform inspired by modern developer productivity tools like Linear, Plane, Notion, Raycast, and GitHub Projects. It features a polished SaaS user experience, keyboard-first workflows, progressive disclosure, and a fast, responsive interface.

---

## 📸 Screenshots & Showcase

<!-- Slide Carousel / Screenshots Grid Placeholders -->
| Dashboard Overview | Kanban Board (Ultrawide) | Create Task Dialog |
|:---:|:---:|:---:|
| ![Dashboard Placeholder](docs/screenshots/dashboard.png) | ![Kanban Board Placeholder](docs/screenshots/kanban.png) | ![Create Task Placeholder](docs/screenshots/create_task.png) |

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js (App Router, Turbopack)
- **Styling**: Tailwind CSS v4 (Vanilla CSS Custom Tokens)
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod (Validation Schema)
- **HTTP Client**: Axios (with custom interceptors for JWT token lifecycle)
- **Iconography**: Lucide React
- **Language**: TypeScript 5+

### Backend
- **Framework**: FastAPI (Python 3.13+)
- **ORM**: SQLAlchemy 2.0 (Asyncpg driver)
- **Database**: PostgreSQL (UUIDv7 primary keys, Timezone-aware schema)
- **Migration Engine**: Alembic
- **Package Management**: `uv` (Fastest Python package installer and workspace tool)
- **Security**: JWT Access/Refresh tokens, Passlib (bcrypt)

---

## 🏛️ Architectural Decisions

### 1. Feature-Driven Frontend Architecture
The frontend codebase is organized by business domain features (`workspaces/`, `projects/`, `boards/`, `columns/`, `tasks/`) rather than flat components. This ensures isolated domain state, collocated hooks, and reusable visual primitives.

### 2. Modular Monolith Backend
The backend follows a strict multi-tiered pattern:
```text
Router (Validation/Serialization) 
  ↓
Service (Business Logic/Authorization) 
  ↓
Repository (Database Queries) 
  ↓
PostgreSQL DB (UUIDv7 Partitioning-ready)
```
This separation prevents database access leaking into routers and consolidates business rules within Services.

---

## ⚖️ Technical Tradeoffs

### 1. Compile-time Theme Variables vs. Native Utilities (Tailwind v4)
* **Tradeoff**: While the design system defines custom variables (like `--spacing-dialog-pad`) for layout consistency, Next.js dev server caching under Turbopack sometimes failed to rebuild CSS stylesheets during `@theme` modifications.
* **Resolution**: To prevent unstyled modals on hot-reloads, we adopted standard Tailwind v4 utility classes (like `p-6` and `rounded-2xl`) directly inside modal components. This guarantees 100% compile-time safety and instant rendering.

### 2. Centered CSS Overlays vs. React Portals
* **Tradeoff**: Standard React portals mount overlays outside the main tree, adding React DOM wrapper code. We decided to keep overlays inline for simpler component-scoped error handling and state propagation.
* **Resolution**: Standard inline overlays can conflict with parent `transform` contexts (like keyframe animations). We handled this by sanitizing page-level keyframes to animate opacity only, preserving exact center layout constraints.

---

## 🚧 Difficulties Faced & Resolved

### 1. CSS Stacking Context Centering Bug
* **Difficulty**: Modals displayed in pages would position relative to the content area (shifted to the right of the sidebar) instead of centering on the viewport, clipping under the top navigation bars.
* **Root Cause**: Page containers had `animate-fade-in` active, which included a `translateY` transform. Under CSS specification, any transform property causes the element to act as the containing block for all `fixed` positioned children.
* **Resolution**: Modified the `fade-in` animation in `globals.css` to only transition opacity, eliminating the transform and restoring standard screen centering.

### 2. Background Dot Grid Bleed-Through
* **Difficulty**: The background dot patterns would bleed through primary action buttons, rendering dark spots over white surfaces.
* **Root Cause**: The absolute `.dots-pattern` container sat on top of the static `EmptyState` card because the card lacked a positioned stacking context.
* **Resolution**: Elevated the empty state wrapper component to `relative z-10` in `primitives.tsx` globally, raising button and text components above layout decorations.

### 3. Dual Backend Context Conflict
* **Difficulty**: The project contains two backend folders: `/app` and `/backend/app`. Running uvicorn from the subdirectory loaded database configurations referencing obsolete `is_archived` flags, crashing on data queries.
* **Resolution**: Consolidated backend execution context at the workspace root directory using `uv run uvicorn app.main:app` to leverage alembic's latest `archived_at` migrations.

---

## 🏁 Progress Report

### Completed So Far
- [x] **Light/Dark Mode**: High contrast, professional dark/light palette inspired by Linear.
- [x] **Full-Width Kanban Boards**: Stretchable column configurations (`flex-1 min-w-[320px] max-w-none`) that span ultrawide viewports seamlessly.
- [x] **Layout-Aware Loading Skeletons**: Replaced generic spinners with dashboard, project, and board layout skeletons.
- [x] **SaaS Modal Polish**: Clean, 24px padded standard dialog layouts for creating Tasks, Projects, Workspaces, Columns, and Boards.
- [x] **Unified Error Boundaries**: Centralized Next.js build compilation with type-safety checks.

### What's Left to Complete
- [ ] **Real-Time Collaboration**: Integrating WebSockets for live Kanban column updates.
- [ ] **Social Authentication**: Google and GitHub OAuth providers.
- [ ] **Labels & Tagging**: Custom text/color labels for tasks.
- [ ] **AI Summaries**: Sprint risk analysis and semantic task search using PostgreSQL `pgvector`.
