# KANDo Design System — Constitution

**Version**: 1.0.0  
**Last Updated**: 2026-07-08  
**Philosophy**: Cohesive, minimal, functional, and keyboard-first. Inspired by modern developer platforms like Linear, GitHub Projects, and Vercel.

---

## 1. Core Principles

* **Function Over Decoration**: Layout rhythm, typography hierarchy, and spacing take priority over shadows, gradients, or frosted glass card borders.
* **Low Cognitive Load**: Maintain high density without clutter. Avoid arbitrary padding or oversized empty blocks.
* **Keyboard First**: Every button, input, search, switcher, and list action must support predictable focus outlines (`focus-visible:ring-1`) and keyboard shortcuts where applicable.
* **Progressive Disclosure**: Show primary actions upfront. Push secondary properties (e.g. details panels, inspector columns) to slide-out drawers or context dropdowns.
* **One Primary Action**: Every view/modal has exactly one primary solid action button. All other actions are secondary (outline) or borderless (ghost).
* **Responsive Fluidity**: Standardize maximum content grid stretch on wide monitors (`--content-xl: 1440px`) to prevent visual stretching.

---

## 2. Global Tokens

### Spacing Scale
- `p-1`: Item margins, icon gaps (`0.25rem` / `4px`)
- `p-2.5`: Item spacing, compact lists (`0.625rem` / `10px`)
- `p-surface-pad`: Standard card & container content gutter (`1.25rem` / `20px`)
- `p-dialog-pad`: Modal forms & drawer padding (`1.5rem` / `24px`)
- `gap-card-gap`: Standard item grid spacing (`1rem` / `16px`)
- `gap-section-gap`: Vertical spacing between separate content layers (`1.5rem` / `24px`)

### Radius Scale
- `rounded-button`: Small interactives (`6px`)
- `rounded-dropdown`: Dropdowns & menus (`8px`)
- `rounded-surface`: Standard cards and surface layers (`12px`)
- `rounded-dialog`: Modal forms and overlay windows (`16px`)

### Z-Index Layers
- `--z-tooltip`: `100`
- `--z-dropdown`: `50`
- `--z-toast`: `60`
- `--z-dialog`: `50`
- `--z-overlay`: `40`

### Elevation & Depth
- `--surface-0`: Global body background (`#050608`)
- `--surface-1`: Standard card surfaces (`#0D1117`)
- `--surface-2`: Dialog backgrounds (`#111820`)
- `--surface-3`: Dropdown overlays (`#151B24`)

---

## 3. Motion & Animation

All micro-interactions use standardized easing parameters:
- **`ease-standard`**: `cubic-bezier(0.4, 0, 0.2, 1)` (general movement)
- **`ease-emphasized`**: `cubic-bezier(0.2, 0, 0, 1)` (drawers, modals, switchers)
- **`ease-decelerate`**: `cubic-bezier(0, 0, 0.2, 1)` (fade-ins)
- **`ease-accelerate`**: `cubic-bezier(0.4, 0, 1, 1)` (collapse)

### Durations
- `motion-fast` (`100ms`): Button press, tooltips.
- `motion-hover` (`150ms`): Hover borders, color transitions.
- `motion-panel` (`180ms`): Collapsible lists.
- `motion-drawer` (`220ms`): Slide-out drawer panels.
- `motion-modal` (`250ms`): Modal scaling.

---

## 4. Typography Scale

- **App Title**: `text-2xl` to `text-3xl` (`font-bold tracking-tight font-heading`)
- **Headers / Headings**: `text-sm font-semibold text-foreground`
- **Labels / Inputs**: `text-[11px] font-bold text-muted-foreground uppercase tracking-wide`
- **Body text**: `text-xs text-foreground leading-relaxed`
- **Helper / Description text**: `text-[10px] text-muted-foreground/80 mt-1 leading-normal`
- **Captions / Timestamps**: `text-[10px] text-muted-foreground/60 font-medium`

---

## 5. Icon Scales

All Lucide icons must strictly reference the following heights/widths:
- **`XS`**: `12px` (e.g. tag bullet, expand chevrons, mini bullets)
- **`SM`**: `16px` (e.g. list buttons, priority status indicators)
- **`MD`**: `18px` (e.g. workspace topbar icons, section header icons)
- **`LG`**: `20px` (e.g. dashboard stat widget icons)
- **`XL`**: `24px` (e.g. empty state large floating category icons)

---

## 6. Layout Columns & Viewports

Standardize column distributions:
- **Desktop Sidebar**: `w-60` (or `w-16` collapsed).
- **Split Layout**: Grid 4-columns (`lg:grid-cols-4`). Spans 3 columns for main content, 1 column for secondary page sidebar details.
- **Max Content Width**: Max width constraint set to `--content-xl` (`1440px`) to align the center layout on ultrawides, avoiding giant blank regions.

---

## 7. Component Checklist & Standards

Every reusable component or form modal must cover:
1. **Disabled State**: Input opacity `opacity-50`, pointer events disabled.
2. **Loading State**: Action buttons show `<Loader2 className="animate-spin" />` spinner and block clicks.
3. **Validation States**: Highlight border `border-destructive`, text alerts `text-destructive text-[10px] mt-0.5`.
4. **Success Alert**: Highlight text/border green `text-emerald-500 bg-emerald-500/10`.
5. **Keyboard Support**: Escape closes modals/drawers; Enter submits form actions.

---

## 8. Do's & Don'ts

### Do
* Always use `PageContainer` -> `PageHeader` -> `ActionToolbar` structure.
* Standardize on CSS elevation variables (`bg-card` / `--surface-1`).
* Use the semantic design tokens for padding, radius, and heights.

### Don't
* ❌ Avoid hardcoding custom heights/paddings like `h-[39px]` or `p-7`.
* ❌ Do not use random border-radii like `rounded-[18px]` or `rounded-[20px]`.
* ❌ Avoid page-specific inline custom background color styles.
* ❌ Never duplicate skeleton files or dialog components; extend variations on primitives.
