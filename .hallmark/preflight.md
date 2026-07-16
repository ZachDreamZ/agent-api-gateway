# Pre-flight Scan — Agent API Gateway Dashboard

**Date:** 2026-07-16
**Scope:** `src/dashboard/` framework, dependencies, tokens, font stack, motion, spacing

---

## Framework

| Property | Value | File |
|----------|-------|------|
| Build tool | Vite 6 | `src/dashboard/vite.config.ts` |
| Framework | React 19 + TypeScript 7 | `package.json` devDeps |
| CSS engine | Tailwind CSS v4 (via @tailwindcss/vite) | `vite.config.ts:3` |
| Routing | react-router-dom v7.18.1 (client-side, BrowserRouter) | `app.tsx:125` |
| Animation | motion v12.42.2 (formerly framer-motion) | `package.json` deps |
| Icon library | lucide-react v1.24.0 (only used in AuraLanding.tsx) | `AuraLanding.tsx:7` |
| Auth client | better-auth/react + @better-auth/api-key/client | `lib/auth.ts` |
| Path alias | `@/` → `./src/` | `vite.config.ts:10`, `tsconfig.json:19` |

## Font Stack

| Property | Value | File |
|----------|-------|------|
| Primary font | Inter (400, 500, 600, 700, 800, 900) | `src/dashboard/src/index.css:1` |
| Declaration | `font-family: 'Inter', system-ui, sans-serif` | `index.css:2` |
| CDN | Google Fonts (un-styled, no display=swap) | `index.css:1` |
| Pairing face | None — Inter serves as both display and body | — |

**Issue:** Single unmatched font family. No distinction between display and body faces. Google Fonts import uses default `display` (blocking render).

## Palette

**Background:** `#0c0c0c` (~zinc-975) — defined in `index.css:14` and inlined in every page component.

| Token | Value | Used For |
|-------|-------|----------|
| `--color-brand-400` | `#6094f8` | Primary accent, active links, focus rings |
| `--color-brand-500` | `#3D81E3` | CTA buttons, progress bars |
| `--color-brand-600` | `#2d64c0` | Button hover, active sidebar bg |
| `--color-surface-950` | `#09090b` | Not used — `#0c0c0c` hardcoded instead |
| `--color-accent-400` | `#2dd4bf` (teal) | Defined but barely used |
| `--glass-bg` | `rgba(255,255,255,0.02)` | All card surfaces |
| `--glass-border` | `rgba(255,255,255,0.08)` | All card borders |

**Inline hex in components** (bypasses tokens):
- `#0c0c0c` — background, repeated in every page component
- `#00d2ff` — landing gradient hero (AuraLanding.tsx:176)
- `#A4F4FD` — landing gradient hero (AuraLanding.tsx:177)
- `#0B2551` — landing gradient hero (AuraLanding.tsx:176)
- `#091020` — landing gradient hero (AuraLanding.tsx:176)
- `rgba(255,255,255,0.xx)` — opacity values everywhere instead of tokenized

**Issue:** 6 distinct hex values used outside the token system. 3 accent colors (brand blue, teal, cyan) create visual drift. Background color not tokenized.

## Motion Stance

| Property | Pattern | File |
|----------|---------|------|
| Easing | `cubic-bezier(0.22, 1, 0.36, 1)` (custom ease-out) | `index.css:79` |
| Spring | `{ type: 'spring', stiffness: 300, damping: 30 }` | `app.tsx:98`, `Docs.tsx:100` |
| Entrance | `initial/animate` with `y`-offset + opacity | universal |
| Scroll-trigger | `whileInView` on every landing section | universal |
| Stagger | `delay={i * 0.1}` on sequential children | universal |
| Loading | `animate-pulse` skeleton + spinner | `ApiKeys.tsx:258`, `Billing.tsx:113` |
| Reduced motion | `@media (prefers-reduced-motion: reduce)` exists | `index.css:101-112` |

**Issue:** Universal entrance animation on every element. Scroll-triggered fade-up on every section. Spring easings on sidebar chrome. No motion-definition CSS variables for duration/easing.

## Spacing & Layout

| Property | Value | File |
|----------|-------|------|
| Max content width | `max-w-5xl` (dashboard), `max-w-3xl` (docs), `max-w-6xl` (landing) | various |
| Card padding | `p-4`, `p-5`, `p-6` (inconsistent) | various |
| Section padding | `py-20 md:py-28` (uniform across landing sections) | AuraLanding.tsx |
| Gap | `gap-4`, `gap-6` (grid), `space-y-3`, `space-y-6` (stack) | various |
| Sidebar width | `w-60` (dashboard), `w-56` (docs) | `app.tsx:39`, `Docs.tsx:84` |
| Border radius | `rounded-xl`, `rounded-2xl`, `rounded-lg` (no token system) | various |

**Issue:** No consistent spacing scale. Padding, gap, and border-radius values are arbitrary Tailwind utilities without semantic tokens.

## Responsive Breakpoints

| Breakpoint | Tailwind Class | Behavior |
|-----------|---------------|----------|
| <1024px | `lg:` below | Mobile sidebar as overlay drawer |
| 768px | `md:` | Grid columns collapse |
| Layout | Sidebar hidden on mobile, sticky sidebar on desktop | Works |
| Overflow | `overflow-x-hidden` on landing, `overflow-x-auto` on pricing | OK |

**Issue:** No 320px/375px testing visible. Pricing cards become horizontal scroll on mobile. No `white-space: nowrap` guard on CTAs at narrow widths.

## Glassmorphism Layer

Three glass variants exist:
1. **`glass-card`** — `rgba(255,255,255,0.02)` bg + `rgba(255,255,255,0.08)` border + `blur(8px)` + inset shadow
2. **`glass-card-hover`** — same + lift + glow shadow on hover
3. **`liquid-glass`** — `rgba(255,255,255,0.01)` bg + `blur(4px)` + gradient pseudo-border (used heavily on landing)

**Issue:** Three distinct glass patterns with overlapping purposes. `liquid-glass` adds a 1.4px gradient pseudo-border via `::before` that creates visual complexity and mask compatibility concerns.

## What's Not Present

- No `design.md` or DESIGN.md governing system decisions
- No CSS custom properties for motion (duration, easing tokens)
- No spacing scale tokens (`--space-sm`, `--space-md`, `--radius-sm`)
- No dark-mode variants (already dark)
- No `display=swap` on Google Fonts import
- No preload hints for fonts or hero content

---

## Blockers for Redesign

1. **Fonts** — Must pair Inter with a display face. Need `display=swap` on Google Fonts or self-host.
2. **Tokens** — Must consolidate palette (remove inline hex), add motion tokens, spacing scale, border-radius tokens.
3. **Glass** — Must eliminate `liquid-glass` and reduce `glass-card` to a single solid-surface variant.
4. **Icons** — Must unify on lucide-react project-wide (already a dep), removing inline SVG icon components.
5. **Motion** — Must cut universal entrance animation, replace spring sidebar with tween, define `--dur-*` and `--ease-*` tokens.
6. **Chrome** — Must replace InboxMockup re-drawn-UI with a real screenshot or pure content.
7. **Accent** — Must pick one accent (brand blue OR teal, not both) and eliminate the cyan from landing.
