# Design System Reference

This documents the design tokens and UI conventions **already in use** in this codebase. It records what exists — it does not introduce new values. If a value here ever drifts from the code, the code wins; update this file to match.

Stack: Tailwind v4 (CSS-first, no `tailwind.config.js`), shadcn "base-nova" style on `@base-ui/react`, OKLCH color space, Geist font family via `next/font`.

---

## 1. Philosophy

- **Light theme, flat surfaces.** Cards are `border border-border` with no elevation shadow by default — shadows are reserved for genuine overlays (dialogs, popovers), not static content blocks.
- **One brand accent, admin-configurable.** The company's `primary`/`accent`/`sidebar` colors live in the database (`Company` row) and are injected as CSS custom-property overrides per request — see [§3](#3-brand-color-the-dynamic-layer). Never hardcode a second "brand" color in a component; use the `--primary`/`--accent` tokens so admin changes propagate everywhere automatically.
- **Status color is a separate, fixed palette.** Present/late/absent (and similar state encodings) use a small reserved green/amber/red palette that is **never themed** by the company's brand color — see [§5](#5-status-palette-attendance--data-viz). Mixing brand and status color is a bug, not a style choice.
- **Radius and spacing are systematic**, derived from a single base value each, not picked ad hoc per component.

---

## 2. Color Tokens (`src/app/globals.css`)

All colors are OKLCH triples (`oklch(L C H)`), defined once on `:root` (light) and mirrored on `.dark`, then re-exposed as Tailwind utilities via the `@theme inline` block (e.g. `--color-primary: var(--primary)` → `bg-primary`, `text-primary`, `border-primary`, etc.).

| Token | Light value | Dark value | Tailwind utility |
|---|---|---|---|
| `--background` | `oklch(1 0 0)` | `oklch(0.145 0 0)` | `bg-background` |
| `--foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | `text-foreground` |
| `--card` / `--card-foreground` | `oklch(1 0 0)` / `oklch(0.145 0 0)` | `oklch(0.205 0 0)` / `oklch(0.985 0 0)` | `bg-card` |
| `--popover` / `--popover-foreground` | same as card | same as card | `bg-popover` |
| `--primary` / `--primary-foreground` | `oklch(0.205 0 0)` / `oklch(0.985 0 0)` (schema default; **overridden per-company**, see §3) | same shape | `bg-primary` |
| `--secondary` / `--secondary-foreground` | `oklch(0.97 0 0)` / `oklch(0.205 0 0)` | `oklch(0.269 0 0)` / `oklch(0.985 0 0)` | `bg-secondary` |
| `--muted` / `--muted-foreground` | `oklch(0.97 0 0)` / `oklch(0.556 0 0)` | `oklch(0.269 0 0)` / `oklch(0.708 0 0)` | `bg-muted`, `text-muted-foreground` |
| `--accent` / `--accent-foreground` | `oklch(0.97 0 0)` / `oklch(0.205 0 0)` (**overridden per-company**) | `oklch(0.269 0 0)` / `oklch(0.985 0 0)` | `bg-accent` |
| `--destructive` | `oklch(0.577 0.245 27.325)` | `oklch(0.704 0.191 22.216)` | `bg-destructive`, `text-destructive` |
| `--border` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 10%)` | `border-border` |
| `--input` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 15%)` | `border-input` |
| `--ring` | `oklch(0.708 0 0)` (**overridden per-company**) | `oklch(0.556 0 0)` | `ring-ring` (focus rings) |
| `--chart-1` … `--chart-5` | grayscale ramp, `oklch(0.87 0 0)` → `oklch(0.269 0 0)` | same | `fill-chart-*` (generic charts; the attendance chart uses the fixed status palette instead, see §5) |
| `--sidebar*` (6 tokens) | mirror of the base tokens, scoped to the sidebar | mirror | `bg-sidebar`, `bg-sidebar-primary`, `bg-sidebar-accent`, … |

Notes:
- `--foreground`/`--background`/etc. use pure grayscale (`0 0` chroma/hue) — only `--primary`/`--accent`/`--sidebar*`/`--destructive` carry hue, and of those, only `primary`/`accent`/`sidebar*` are brand-configurable.
- `--radius` = `0.625rem`, and every other radius token is derived from it (see §4).

---

## 3. Brand color: the dynamic layer

The company's brand colors are **not static CSS** — they're stored in Postgres and injected per-request.

**Schema** (`prisma/schema.prisma`, `Company` model):

| Field | Default (OKLCH) |
|---|---|
| `primaryColor` | `oklch(0.205 0 0)` |
| `primaryForeground` | `oklch(0.985 0 0)` |
| `accentColor` | `oklch(0.97 0 0)` |
| `accentForeground` | `oklch(0.205 0 0)` |
| `sidebarPrimary` | `oklch(0.205 0 0)` |
| `sidebarAccent` | `oklch(0.97 0 0)` |

**Injection** (`src/components/layout/brand-style.tsx`): the dashboard layout renders a `<style>` tag that overrides `--primary`, `--primary-foreground`, `--accent`, `--accent-foreground`, `--sidebar-primary`, `--sidebar-primary-foreground`, `--sidebar-accent`, `--sidebar-accent-foreground`, `--ring`, and `--sidebar-ring` on both `:root` and `.dark`, from the `Company` row. This means every `bg-primary`/`bg-accent`/`ring-ring` utility in the app automatically reflects the admin's chosen brand colors with zero component-level changes.

**Admin UI** (`src/app/(dashboard)/settings/company/page.tsx` → `CompanyBrandingForm`): admins pick colors with native `<input type="color">` (hex), which round-trips through `src/lib/color.ts`:
- `hexToOklch(hex)` — sRGB → linear sRGB → OKLab → OKLCH, used when saving (`updateCompanyBrandingAction`).
- `oklchToHex(oklch)` — inverse, used to populate the color picker's current value.
- `contrastingForeground(oklchColor)` — picks near-black (`oklch(0.145 0 0)`) or near-white (`oklch(0.985 0 0)`) foreground based on background lightness (threshold `L > 0.6`).
- `isValidOklch(value)` — validates the `oklch(L C H)` shape before persisting; enforced server-side in `updateCompany()`.

**Current live values** (as configured for this company, Benwil Technologies):

| Field | Hex | OKLCH |
|---|---|---|
| Primary / Sidebar primary | `#1c2f5c` (navy) | `oklch(0.316 0.084 264.8)` |
| Accent / Sidebar accent | `#bc2128` (red) | `oklch(0.515 0.189 25.2)` |
| Primary/Accent foreground | white | `oklch(0.985 0 0)` |

The login screen (`src/app/(auth)/layout.tsx`, `src/app/(auth)/login/page.tsx`, `src/components/auth/login-form.tsx`) intentionally hardcodes the brand hexes (`#18315B` navy, `#BC2025` red, `#F5F7FA` light background, `#111827` dark text, `#64748B` secondary text) rather than reading the CSS variables, because it renders before a company/session context is meaningfully themed and needed pixel-exact values from the brand brief. If the company's brand colors are changed from Settings, update these login-page hexes to match by hand — they do not auto-sync.

---

## 4. Radius & Spacing

**Radius scale** (`@theme inline` in `globals.css`), all derived from one base:

```
--radius: 0.625rem                         /* 10px, the only literal value */
--radius-sm:  calc(var(--radius) * 0.6)    /* 6px */
--radius-md:  calc(var(--radius) * 0.8)    /* 8px */
--radius-lg:  var(--radius)                /* 10px */
--radius-xl:  calc(var(--radius) * 1.4)    /* 14px */
--radius-2xl: calc(var(--radius) * 1.8)    /* 18px */
--radius-3xl: calc(var(--radius) * 2.2)    /* 22px */
--radius-4xl: calc(var(--radius) * 2.6)    /* 26px */
```

Observed usage convention (not enforced by tooling, but consistent across the app):
- **Buttons / inputs / small controls** → `rounded-lg` (base radius) or `rounded-md`.
- **Cards / panels** (dashboard bento cells, settings cards) → `rounded-2xl` or `rounded-3xl`.
- **Pills** (check-in/out CTA, status chips) → `rounded-full`.
- **Badges** → `rounded-4xl` (defined directly in `badge.tsx`'s `cva`, i.e. effectively a pill at badge scale).

**Spacing** uses bare Tailwind spacing utilities (no custom scale defined) — in practice the app standardizes on a small set of steps: `gap-2`/`gap-3` (tight, within a control), `gap-4`/`gap-6` (between related elements), `gap-8`/`gap-10` (between sections), `p-6`/`p-8` (card/panel padding).

---

## 5. Status palette (attendance / data-viz)

A fixed, unthemed three-color palette for present/late/absent state encoding, chosen per the project's `dataviz` skill (colorblind-safe, not derived from brand color):

| Status | Hex |
|---|---|
| Present (good) | `#0ca30c` |
| Late (warning) | `#fab219` |
| Absent (critical) | `#d03b3b` |

Defined in two places that must stay in sync:
- `src/components/dashboard/attendance-trend-chart.tsx` — `chartConfig` for the Recharts stacked bar chart.
- `src/components/dashboard/attendance-ring.tsx` — the `STATUS` const for the custom SVG donut on the dashboard.

Rule: **never substitute `--primary`/`--accent` for status color**, even if they happen to look similar — status color must stay legible and consistent regardless of what brand color an admin picks.

---

## 6. Typography

- **Sans**: Geist (`--font-geist-sans`, loaded via `next/font` in the root layout) → mapped to `--font-sans` in `@theme inline` → default `font-sans` on `<html>`.
- **Mono**: Geist Mono (`--font-geist-mono`) → `--font-mono`, used for code-like values (e.g. payroll status badges use `font-mono uppercase tracking-wider`).
- No custom numeric type scale is defined — the app uses bare Tailwind text-size utilities directly, with a consistent set of pairings by role:

| Role | Classes | Example |
|---|---|---|
| Page title | `text-3xl font-semibold tracking-tight` | Dashboard greeting, page `<h1>` |
| Section title (card header) | `text-sm font-semibold` | "Attendance, last 14 working days" |
| Eyebrow / section label | `text-xs font-semibold tracking-widest uppercase text-muted-foreground` | "Company overview" |
| Body | `text-sm` | Descriptions, table cells |
| Micro label | `text-xs text-muted-foreground` | Stat row captions, form hints |
| Big stat number | `text-4xl` / `text-5xl font-light tracking-tighter tabular-nums` | Metric card values, attendance ring center |

`tabular-nums` is used wherever a number may re-render in place (stat rows, the attendance ring) so digit width doesn't jitter.

---

## 7. Component conventions

- **Buttons** (`src/components/ui/button.tsx`, `cva`-driven): variants `default` (`bg-primary`), `outline`, `secondary`, `ghost`, `destructive`, `link`; sizes `xs`/`sm`/`default`/`lg`/`icon`/`icon-sm`/`icon-lg`/`icon-xs`. Built on `@base-ui/react`'s `Button` — use the `render` prop (not `asChild`) to polymorph onto e.g. a `Link`, and pass `nativeButton={false}` when `render` targets a non-`<button>` element.
- **Badges** (`src/components/ui/badge.tsx`): variants `default`, `secondary`, `destructive`, `outline`, `ghost`, `link` — same `cva` shape as Button for visual consistency between the two.
- **Cards / panels**: flat by default (`border border-border`, no shadow). Elevation (`shadow-*`) is reserved for things that visually float above content — dialogs, popovers, dropdowns — not for static sections. Where several related stats sit together, prefer a single bordered container with `divide-y divide-border` rows (see `StatRow`, `src/components/dashboard/stat-row.tsx`) over a grid of separate small cards.
- **Icons**: `lucide-react`, default `size-4` unless a class like `size-3.5`/`size-5` is explicitly set.
- **Dialogs/forms**: the shared `useDialogFormAction` hook (`src/hooks/use-dialog-form-action.ts`) wraps `useTransition` + manual close-on-success, avoiding the `react-hooks/set-state-in-effect` lint violation that a naive `useActionState` + `useEffect`-close pattern triggers.

---

## 8. File map

| Concern | File |
|---|---|
| Base tokens, `@theme inline`, keyframes | `src/app/globals.css` |
| Per-company brand override injection | `src/components/layout/brand-style.tsx` |
| Hex ⇄ OKLCH conversion, contrast helper | `src/lib/color.ts` |
| Company color persistence & validation | `src/server/dal/company.ts` |
| Admin color-picker UI | `src/components/settings/company-branding-form.tsx` |
| Status palette (chart) | `src/components/dashboard/attendance-trend-chart.tsx` |
| Status palette (ring) | `src/components/dashboard/attendance-ring.tsx` |
| Button primitive | `src/components/ui/button.tsx` |
| Badge primitive | `src/components/ui/badge.tsx` |
| Flat stat-row pattern | `src/components/dashboard/stat-row.tsx` |
| Login screen (hardcoded brand hexes) | `src/app/(auth)/layout.tsx`, `src/app/(auth)/login/page.tsx`, `src/components/auth/login-form.tsx` |

---

## 9. Extending this system

- **Adding a new brand-driven surface**: use `bg-primary`/`text-primary-foreground`/`bg-accent`/etc. — never a literal hex — so it inherits the company's configured colors automatically.
- **Adding a new status color** (e.g. a new leave-request state): extend the fixed palette in step with both `attendance-trend-chart.tsx` and `attendance-ring.tsx` (or centralize into one shared constants file if a third consumer appears), and keep it colorblind-distinguishable from the existing three (the `dataviz` skill's palette validator can check this).
- **Changing the base radius or spacing**: edit the single `--radius` value in `globals.css` — every derived radius token updates automatically. There is no equivalent single base for spacing; Tailwind's default scale is used as-is.
- **Dark mode**: tokens exist on `.dark` today but no theme toggle is wired up in the UI yet — the app currently always renders light. If a toggle is added, verify the per-company brand override in `brand-style.tsx` still reads correctly against the `.dark` values (it already writes to both blocks).
