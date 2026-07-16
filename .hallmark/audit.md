# Hallmark Audit — Agent API Gateway Dashboard

**Audit date:** 2026-07-16
**Scope:** `src/dashboard/` (app.tsx, AuraLanding.tsx, Overview.tsx, ApiKeys.tsx, Billing.tsx, Docs.tsx, Auth.tsx, index.css)
**Scanner:** Hallmark audit v1

---

## Scores

| Axis | Score | Why |
|------|-------|-----|
| **Philosophy** | 4/10 | Dark-themed SaaS dashboard with consistent visual language, but no underlying design system — tokens exist but are freely bypassed with inline hex, mix of glassmorphism + raw dark. No `design.md` governing choices. |
| **Hierarchy** | 5/10 | Route layout is clear (sidebar → main content), section headings are distinct, stat cards use readable hierarchy. But landing page hero is a single multicolour gradient headline with no secondary content rhythm. |
| **Execution** | 6/10 | Animations are smooth (motion/react), sidebar active-indicator layoutId works, modals are properly focus-trapped-ish, responsive sidebar. Code quality is decent. |
| **Specificity** | 3/10 | Every page uses the same glass-card aesthetic. Dashboard, landing, docs, auth — all `#0c0c0c` + `rgba(255,255,255,0.08)` borders + glass backdrop. No page feels designed for its genre. |
| **Restraint** | 2/10 | Glassmorphism on every surface. Animate-on-scroll on every section. Spring animations on UI chrome. Hover-only action buttons on API keys. Nothing is allowed to just *be*. |
| **Variety** | 5/10 | Dashboard pages use grid/stat-card layout, landing uses full-width sections, docs uses article layout. Structure varies across pages, but the visual treatment (glass + dark) is identical. |

**Summary — 9 critical · 6 major · 4 minor**
**Verdict — reads as AI-generated (heavy glassmorphism SaaS template)**

---

## Critical

### 1. Inter-everywhere — `src/dashboard/src/index.css:1`

Only Inter is loaded and declared as the single font family (`font-family: 'Inter', system-ui, sans-serif`). No pairing face for display vs body. A one-font page is a template page.

→ Fix: Pair a distinctive display face (e.g. instrument-serif, switzer) with a refined body face. See hallmark `typography.md`.

### 2. The AI nav — `src/dashboard/src/pages/AuraLanding.tsx:133-162`

Wordmark hard-left, 4 inline text links centered (`Features · Pricing · Docs · API Reference`), CTA button hard-right (`Dashboard →`), full viewport width, sticky on scroll, dark background. Classic AI nav fingerprint — genre-blind: it lands the same on a B2B SaaS, a bakery, and a developer tool.

→ Fix: Pick from Hallmark component-cookbook § Navigation (floating pill, newspaper masthead, brutal slab, terminal, edge-aligned minimal). The genre (API product) suggests F5 Floating pill or N5 Terminal.

### 3. The gradient headline — `src/dashboard/src/pages/AuraLanding.tsx:176-183`

Landing hero uses `background-clip: text` fill set to a linear gradient (`linear-gradient(to right, #091020 0%, #0B2551 12.5%, #A4F4FD 32.5%, #00d2ff 50%...`) with `animate-shiny` background-position animation. This is the single most-recognised AI tell for headlines.

→ Fix: Solid ink. Use weight or a display face for energy, not a gradient fill.

### 4. Glassmorphism without purpose — every component CSS + `src/dashboard/src/index.css:71-87`

`glass-card` (backdrop-filter: blur, rgba border, shadow inset) and `liquid-glass` (blur, gradient pseudo-border) are applied to *every* surface: stat cards, modals, pricing tables, docs tables, landing sections, auth form, footer. Glass is decoration, not communication — nothing about the interface requires frosted depth.

→ Fix: Glassmorphism only where it communicates depth (overlay over scrollable content). For cards and surfaces, use solid tinted surfaces with hairline borders. One or two glass elements is an accent; 50+ is a template.

### 5. Re-drawn UI chrome — `src/dashboard/src/pages/AuraLanding.tsx:216-332`

The `InboxMockup` component hand-builds a fake macOS Mail-style split-pane interface: traffic-light window dots, sidebar with navigation items, split request/response panes, toolbar buttons. This is a "re-drawn UI chrome" anti-pattern — the user's browser already has chrome; redrawing it is fakery the audience pattern-matches instantly.

→ Fix: Use a real screenshot wrapped in `<figure>` with a hairline border. Never hand-build OS chrome in HTML/CSS.

### 6. Animate-on-scroll on everything — `AuraLanding.tsx` every section

Every landing section uses `whileInView` with `initial={{ opacity: 0, y: 20 }}` and `animate={{ opacity: 1, y: 0 }}`. Every dashboard stat card uses `initial={{ opacity: 0, y: 12 }}` and `animate={{ opacity: 1, y: 0 }}` with staggered delays. The page never settles — the animation is the page.

→ Fix: Pick one orchestrated entrance (the hero). Let everything after that just *be there*.

### 7. Lazy-loaded LCP — `src/dashboard/src/pages/AuraLanding.tsx:362-370`

The hero background `<video autoplay loop muted playsinline>` at line 368 is the LCP element. It has no `fetchpriority="high"`, no preload, and no poster. On first load the page renders a blank background until the video loads.

→ Fix: Add `poster` attribute pointing to a compressed first-frame still. Add a `<link rel="preload" as="image" href="poster.jpg">` in the document `<head>`.

### 8. Invented metrics — `src/dashboard/src/pages/AuraLanding.tsx:428-460`

Three testimonial cards feature fictional personas ("Engineering Lead — MERIDIAN", "Senior Developer — CORTEX", "Platform Engineer — STRATO") with implied metrics: "Cache hits in under 10ms", "Monday morning pipeline failures went from weekly to zero", "We replaced three separate scraping scripts". Fictional testimonials with implied performance claims are "invented metrics" — a page that fabricates testimonials can't be trusted on its claims.

→ Fix: Replace with `—` grey blocks labeled "Testimonial pending" or remove the section entirely. Only ship real customer quotes.

### 9. Mid-render token improvisation — `src/dashboard/src/index.css` + all components

`index.css` defines a token system (`--color-brand-*`, `--color-surface-*`, `--color-accent-*`) but freely bypasses it throughout:
- Inline `#00d2ff`, `#A4F4FD`, `#0B2551`, `#091020` across landing CSS
- Inline `rgba(255,255,255,...)` values everywhere instead of `--glass-bg` / `--glass-border`
- `#0c0c0c` hardcoded as background in every component instead of `var(--color-surface-950)`
- Direct `rgb()` / hex in hover states, icon colors, border colors in every TSX file

→ Fix: Every color in every component must reference `var(--token-name)`. Add missing values to the token block (`--color-cyan-400: oklch(...)`, `--color-glass-bg`, `--color-bg-app`) and reference them. See Hallmark slop-test gate 48.

---

## Major

### 1. Bounce and elastic easing — `src/dashboard/src/app.tsx:98`, `Docs.tsx:100`

The sidebar active indicator uses `layoutId` with `type: 'spring', stiffness: 300, damping: 30`. The mobile sidebar drawer uses the same spring transition. Spring easings on UI chrome (not physical interactions) are a 2010s throwback.

→ Fix: Reserve overshoots for drag-and-drop. For layoutId transitions on UI chrome, use `type: 'tween', duration: 0.2, ease: [0.22, 1, 0.36, 1]`.

### 2. Tabular data without tabular-nums — `Overview.tsx`, `Billing.tsx`, `Docs.tsx`

Stat cards render numbers (queries, credits, pricing) without `font-variant-numeric: tabular-nums`. When the page displays columns of numbers (pricing tables, rate limits), digits shift visually.

→ Fix: Add `font-variant-numeric: tabular-nums` to any container rendering columns of numbers (`.glass-card`, table cells, stat card values).

### 3. `transition-all` — `src/dashboard/src/index.css:79`

`glass-card-hover` uses `transition: all 0.2s cubic-bezier(.22,1,.36,1)`. All-property transitions include expensive paints (box-shadow) and properties that shouldn't animate.

→ Fix: `transition: background-color 0.2s, border-color 0.2s, transform 0.2s`. Specify the properties.

### 4. Hover-only affordances — `src/dashboard/src/pages/ApiKeys.tsx:144-159`

API key row toggle/revoke buttons are `opacity-0 transition-opacity group-hover:opacity-100` — invisible on touch devices and keyboard navigation until hover. Touch users cannot interact with API key controls.

→ Fix: Make all action buttons always visible at reduced opacity (`.opacity-40`). Hover/active can bring to full opacity. Always accessible.

### 5. Mismatched icon sets — `AuraLanding.tsx` vs dashboard pages

Landing page imports from `lucide-react` (`Sparkles, ChevronRight, Search, Menu, Reply...`). Dashboard pages define inline SVG icon components with a different stroke weight (`strokeWidth="1.5"`, `strokeWidth="2"`, etc). Two different icon approaches in the same project.

→ Fix: Pick one library. Lucide is the canonical choice for this stack (`lucide-react` is already a dependency). Replace all inline SVG icon components with lucide equivalents.

### 6. Eyebrow on every section — `src/dashboard/src/pages/AuraLanding.tsx:93-104`

The `SectionEyebrow` component (dot + label + optional tag) is used on Features, and the pricing section uses a different eyebrow pattern. The pattern of labelling every section with an uppercase mono-cap label is a reliable AI tell.

→ Fix: Ship zero eyebrows unless the content is genuinely ordinal (numbered steps, chapters). Features doesn't need "CAPABILITIES" — the heading and body do the work.

---

## Minor

### 1. Placeholder names — `src/dashboard/src/pages/Auth.tsx:78`

Auth form placeholder: `placeholder="Jane Doe"`. While common, "Jane Doe" reads as undecked.

→ Fix: A domain-specific placeholder like "Alex Rivera" or "Sam Chen".

### 2. Startup-cliché product names — `src/dashboard/src/pages/AuraLanding.tsx:428-460`

Testimonial company names: "MERIDIAN", "CORTEX", "STRATO". While genre-appropriate for a cyber/developer tool, these are abstract startup-bingo names.

→ Fix: Concrete names if testimonials stay ("Ridgeview Analytics", "Maple Data"), or ship the testimonial-less section.

### 3. Every section padded the same — `AuraLanding.tsx`

All Landing sections use `py-20 md:py-28` or `py-16 md:py-24` — uniform vertical padding across Features, LogoCloud, Testimonials, Pricing, FinalCTA. Equal padding erases the rhythm that tells a reader what's primary vs secondary.

→ Fix: Vary padding. Let the hero breathe (more space). Tighten LogoCloud and Testimonials (less space).

### 4. Double-hyphen dashes — `src/dashboard/src/pages/Auth.tsx:17`

`"Don't have an account? "` in JSX — use `Don't` with proper apostrophe/smart-quotes. (Minor typographic issue in a developer-facing app but worth noting for polish.)

→ Fix: Use `&rsquo;` or curly apostrophe throughout.

---

## Structural: AI Template Fingerprint

The landing page follows the full AI SaaS template sequence: **Hero (centered + gradient headline) → Features (2-column) → LogoCloud → Testimonials → Pricing (3-column cards) → Final CTA → Footer**. This is the most-recognised LLM-generated marketing page structure. Even with good individual elements, the macro-rhythm reads as templated.

→ Fix: Break the sequence. Remove one section (LogoCloud or Testimonials). Reorder. Add an asymmetric or surprising section (metrics dashboard preview, interactive playground, FAQ accordion). The page should not be a checklist of expected SaaS sections.

---

## Count

**9 critical · 6 major · 4 minor**
