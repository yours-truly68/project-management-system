# KANDo UI Component Inventory

This catalogue keeps track of all reusable UI components and views, documenting their locations, variants, usage rules, and design system compliance.

---

## 1. Core Primitives

| Component Name | File Path | Variants | Design System Tokens Used | Status |
| :--- | :--- | :--- | :--- | :--- |
| `PageContainer` | `src/components/ui/primitives.tsx` | Fluid, Centered | `--content-xl`, `px-6 md:px-8` | Refined |
| `PageHeader` | `src/components/ui/primitives.tsx` | Default | `pb-5 border-b` | Refined |
| `ActionToolbar` | `src/components/ui/primitives.tsx` | Default | `py-3 border-b` | Refined |
| `Surface` | `src/components/ui/primitives.tsx` | Standard, Elevated | `rounded-surface`, `--surface-1` | Refined |
| `StatCard` | `src/components/ui/primitives.tsx` | Default | `rounded-surface`, `p-surface-pad` | Refined |
| `EntityCard` | `src/components/ui/primitives.tsx` | Interactive | `rounded-surface`, `--motion-hover` | Refined |
| `EmptyState` | `src/components/ui/primitives.tsx` | Layout-integrated | `rounded-surface`, `p-surface-pad` | Refined |
| `ProgressIndicator` | `src/components/ui/primitives.tsx` | Block segments | Segment widths & primary color | Refined |

---

## 2. Listing & Grid Primitives (New)

| Component Name | File Path | Variants | Design System Tokens Used | Status |
| :--- | :--- | :--- | :--- | :--- |
| `ListItem` | `src/components/ui/primitives.tsx` | Default, Interactive | `h-height-sidebar-item`, `--motion-hover` | Added |
| `TableRow` | `src/components/ui/primitives.tsx` | Flex, Grid | `--surface-1`, `px-surface-pad` | Added |
| `PropertyList` | `src/components/ui/primitives.tsx` | Vertical, Horizontal | `gap-card-gap` | Added |
| `SectionList` | `src/components/ui/primitives.tsx` | Divider lines | `border-border/30` | Added |

---

## 3. Overlays & Forms

| Component Name | File Path | Variants | Design System Tokens Used | Status |
| :--- | :--- | :--- | :--- | :--- |
| `CreateWorkspaceModal` | `src/features/workspaces/components/create-workspace-modal.tsx` | Default Form | `rounded-dialog`, `p-dialog-pad` | Refined |
| `CreateProjectModal` | `src/features/projects/components/create-project-modal.tsx` | Default Form | `rounded-dialog`, `p-dialog-pad` | Refined |
| `EditProjectModal` | `src/features/projects/components/edit-project-modal.tsx` | Default Form | `rounded-dialog`, `p-dialog-pad` | Refined |
| `CreateBoardModal` | `src/features/boards/components/create-board-modal.tsx` | Default Form | `rounded-dialog`, `p-dialog-pad` | Refined |
| `EditBoardModal` | `src/features/boards/components/edit-board-modal.tsx` | Default Form | `rounded-dialog`, `p-dialog-pad` | Refined |
| `CreateColumnModal` | `src/features/columns/components/create-column-modal.tsx` | Color Picker Form | `rounded-dialog`, `p-dialog-pad` | Refined |
| `EditColumnModal` | `src/features/columns/components/edit-column-modal.tsx` | Color Picker Form | `rounded-dialog`, `p-dialog-pad` | Refined |
| `CreateTaskModal` | `src/features/tasks/components/create-task-modal.tsx` | Large Form | `rounded-dialog`, `p-dialog-pad` | Refined |
| `TaskDetailsDrawer` | `src/features/tasks/components/task-details-drawer.tsx` | Panel Drawer | `rounded-none`, `--motion-drawer` | Refined |

---

## 4. Navigation & Layouts

| Component Name | File Path | Variants | Design System Tokens Used | Status |
| :--- | :--- | :--- | :--- | :--- |
| `Sidebar` | `src/components/layout/sidebar.tsx` | Collapsible | `w-60` / `w-16`, `--motion-panel` | Refined |
| `Topbar` | `src/components/layout/topbar.tsx` | Breadcrumbs & Search | `h-height-topbar`, `bg-background/80` | Refined |
| `WorkspaceSwitcher` | `src/features/workspaces/components/workspace-switcher.tsx` | Dropdown | `rounded-dropdown`, `--z-dropdown` | Refined |
| `ProfileDropdown` | `src/components/layout/profile-dropdown.tsx` | Dropdown | `rounded-dropdown`, `--z-dropdown` | Refined |
