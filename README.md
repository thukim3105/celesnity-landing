# Celesnity — Minder AI Landing Page

The marketing landing page for **Celesnity / Minder AI**. A single-screen, scroll-snapped
experience built with the Next.js App Router, with custom WebGL and motion-driven visuals
(galaxy, strands, electric border, solar orbit) layered behind editorial content.

This codebase is a clean, feature-based re-architecture of an earlier prototype. Behavior,
UI, animations, copy, and responsive/accessibility characteristics are preserved exactly —
the structure underneath them is what changed.

## Tech stack

| Concern        | Choice |
| -------------- | ------ |
| Framework      | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| UI runtime     | React 19 |
| Language       | TypeScript (strict) |
| Styling        | [Tailwind CSS v4](https://tailwindcss.com) (`@theme` tokens, `@custom-variant dark`) |
| Animation      | [`motion`](https://motion.dev) (Framer Motion), hand-rolled `requestAnimationFrame` loops |
| WebGL          | [`ogl`](https://github.com/oframe/ogl) with custom GLSL shaders |

> There is **no GSAP and no Lenis** dependency. Earlier notes referenced them; neither was
> ever actually used. The real animation stack is `motion` + `ogl` + raw rAF.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts:

```bash
npm run build    # production build (Turbopack)
npm run start    # serve the production build
npm run lint     # eslint (eslint-config-next 16.2.9)
npx tsc --noEmit # type-check
```

## Architecture

The `@/*` path alias maps to `src/*`. The guiding rule: **Server Components by default**;
`"use client"` only on genuinely interactive or animated islands. Content lives in data
files, animation logic lives in hooks, and pure math/shaders live in `lib/`.

```
src/
├── app/                 # App Router entry — layout, page, globals.css, icon
├── providers/           # Theme (no-flash script + provider), Analytics, composed <Providers>
├── features/            # One folder per page section — the page is composed from these
│   ├── intro/           #   spark sweep → "Celesnity" reveal → fly-to-logo overlay
│   ├── hero/            #   galaxy hero + CTAs + ticker
│   ├── in-hand/         # 01  Strands visual
│   ├── problem/         # 02  ElectricBorder stat cards + CountUp
│   ├── platform/        # 03  SVG/SMIL network graph
│   ├── intelligence/    # 04  SolarOrbit
│   ├── how-it-works/    # 05  auto-advancing Stepper
│   ├── knowledge-port/  # 06  prose
│   ├── team/            # 07  prose
│   ├── faq/             # 08  Accordion
│   └── contact/         # CTA  email form
├── visuals/             # Reusable rendering systems (not UI): Galaxy, Strands,
│                        #   ElectricBorder, SolarOrbit, Ticker
├── components/
│   ├── layout/          # Chrome: Navbar, Footer, ScrollProgress, SectionNav, SectionShell
│   └── ui/              # Primitives: Button, Input, Eyebrow, Accordion, Stepper, CountUp, icons
├── hooks/               # Cross-cutting hooks (reduced-motion, theme, scroll-spy, comet, dismiss)
├── lib/                 # Pure logic — webgl/ (GLSL), geometry/ (math), animation/ (easing), color
├── data/                # All page content (sections, faq, stats, ticker, workflow, nav, footer)
├── constants/           # Non-content config (site metadata, fonts, scroll ratios)
└── types/               # Shared content interfaces
```

### Layering rules

- **`features/`** compose `visuals/`, `components/`, and `data/` into page sections. They own
  no shared logic — only section-specific assembly. `app/page.tsx` simply stacks them.
- **`visuals/`** are rendering *systems* (WebGL/canvas/motion), not UI. Each pairs a thin
  client component with a `use*Scene` hook that owns the renderer, rAF loop, and teardown.
- **`components/ui` and `components/layout`** are presentation-only and reusable across features.
- **`lib/`** is framework-agnostic and side-effect-free (shaders, noise, easing, color, geometry).
- **`data/` vs `constants/`**: editable marketing *content* → `data/`; structural *config* → `constants/`.

### Animation conventions

JSX stays declarative — imperative animation lives in hooks:

| Hook | Owns |
| ---- | ---- |
| `useGalaxyScene` / `useStrandsScene` | OGL renderer, programs, per-frame uniforms, resize, visibility gating |
| `useElectricBorder` | canvas noise-displaced border loop |
| `useScrollComet` | rAF-lerped comet tracking scroll position |
| `useIntroAnimation` | intro overlay timeline |
| `useCountUp` / `useAutoAdvance` | counter tween / stepper auto-advance |

All motion respects `prefers-reduced-motion` via `useReducedMotion` (a `useSyncExternalStore`
subscription), and WebGL scenes pause when their section scrolls off-screen.

## Accessibility & SEO

- Reduced-motion users get static fallbacks; the intro overlay is skipped entirely.
- Theme is applied before paint by an inline script in `providers/ThemeScript` (no flash).
- Page metadata is centralized in `app/layout.tsx` (sourced from `constants/site`).

## Known carried-over gaps

These exist in the original prototype and were intentionally **preserved as-is** (not bugs
introduced by the migration). They are candidates for a follow-up polish pass:

- No mobile navigation menu (desktop nav only).
- Navbar dropdown and footer links are `#` placeholders.
- The contact form has no submit handler (no backend wired).
