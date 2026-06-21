# Minder AI — "Projector Orb" scroll experience

**Date:** 2026-06-21
**Route affected:** `/minder-ai` (component tree under `src/features/minder/`)
**Status:** Approved design — ready for implementation plan

## 1. Goal

Replace the static device-mockup illustrations on the Minder AI page with a
single glowing orb ("đốm sáng") that behaves like a **projector**: it travels
along a visible S-curve as the user scrolls, and when a role panel reaches the
centre of the viewport the orb docks onto that panel's media slot, flashes, and
"fills" a video container that begins playing. Scrolling away shrinks the orb
and sends it along the curve to the next panel. Only one video is ever active.

## 2. Current state (what changes)

`src/features/minder/` today:

- `MinderRoles.tsx` — maps `minderRoles` to three `RolePanel`s. Each panel is a
  2-column grid: text copy on one side, `RoleDevice` mockup on the other.
  Sides alternate: coach right, assistant left, agent right.
- `RoleDevice.tsx` + the mockup screens — **to be removed** (replaced by the
  video stage).
- `data.ts` — each `MinderRole` carries copy, checklist, accent, and
  device-mockup fields (`variant`, `device`, `buildTag`).

The text column (eyebrow, heading, body, checklist) is **kept unchanged**. Only
the illustration column is replaced.

## 3. Decisions (locked)

| Topic | Decision |
|---|---|
| Scroll linkage | Continuous scroll-bound: orb glides along the curve in real time. |
| Inactive boxes | Hidden. Only the centred panel's box materialises (flash) + plays; it dissolves on leave. Always exactly one box visible. |
| Video playback | Autoplay, muted, looped + a small unmute/pause control. Restarts from 0 each time it materialises. |
| Mobile | Simplified: straight vertical path down the centre, full-width boxes, orb + flash kept. |
| Trajectory trail | The S-curve is rendered as a faint, always-visible brand-blue glowing stroke; the orb travels along it. |
| Animation tech | `motion` (Framer Motion v12, already a dependency) `useScroll`/`useTransform` driving CSS `offset-path` + `offset-distance`. |
| Aspect ratio | Video box **16:9** (adjustable later). |
| Reduced motion | Respect `prefers-reduced-motion`: no orb/trail; each box appears statically (gentle fade) when scrolled into view, video still plays muted. |
| Visual language | Orb reuses the beacon aesthetic from `ScrollProgress.tsx` (white core + cyan/blue halos + lens-flare). |

## 4. Architecture

All new work stays inside `src/features/minder/`. Components are small and
single-purpose so each can be reasoned about independently.

### 4.1 `MinderRoles.tsx` (orchestrator)

- Renders a single `position: relative` container wrapping the three panels plus
  one full-section overlay holding the SVG curve and the orb.
- Owns refs to each panel's `VideoStage` and the overlay container.
- Owns the scroll progress (`useScroll` on the container) and the
  active-panel index (which panel is centred).
- Passes `active={i === activeIndex}` to each `VideoStage`.

### 4.2 `RolePanel` (in `MinderRoles.tsx` or its own file)

- Unchanged text column.
- Illustration column becomes a `VideoStage` wrapped in a positioned slot,
  carrying a `ref` so the orchestrator can measure its centre. Side still
  alternates (coach right, assistant left, agent right).

### 4.3 `ProjectorOrb.tsx` (new)

- Inputs: the computed SVG path `d` string, the orb's `offsetDistance` motion
  value (a `MotionValue<string>` like `"42%"`), and a `flashing` flag.
- Renders:
  - The **trail**: an `<svg>` with the path stroked in a faint brand-blue
    gradient + soft glow filter, always visible.
  - The **orb**: an absolutely-positioned element using `offset-path: path(d)`
    and `offset-distance` bound to the motion value. Its inner visual is the
    beacon (scaled-down core + halos). When `flashing`, it scales up into a
    burst.
- Pure presentational + motion; no scroll logic inside.

### 4.4 `VideoStage.tsx` (new)

- Inputs: `role` (for poster/video src + label), `active: boolean`,
  `reducedMotion: boolean`.
- When `active` (or in view, under reduced motion): materialises with a flash
  (radial light → clip/scale reveal), mounts/plays the `<video>` from 0
  (muted, looped). Shows a small control toggling mute and play/pause.
- When inactive: dissolves and pauses/unmounts the video so only one plays.
- Before a real video exists: shows a dark poster placeholder with a brand glow
  (no layout shift).
- 16:9 aspect via `aspect-[16/9]`.

### 4.5 `useProjectorPath.ts` (new hook)

- Measures the centre of each `VideoStage` relative to the overlay container
  (via refs + `getBoundingClientRect`), recomputes on resize
  (`ResizeObserver`).
- Builds a smooth cubic-bézier S-path through the three centres, with short
  tails above the first and below the last point.
- Returns: `pathD` (string) and `dockDistances` (the `offset-distance` % at each
  stage centre) so the orchestrator can align orb position to panel centring.
- On mobile breakpoint: emits a straight vertical path (x fixed at centre).

## 5. Interaction & animation detail

1. **Scroll progress.** `useScroll({ target: containerRef, offset: ["start start", "end end"] })` → `scrollYProgress` 0→1 across the Minder section.
2. **Orb position.** `offsetDistance = useTransform(scrollYProgress, inputRange, outputRange)` where `inputRange` are the scroll-progress values at which each panel is centred (plus 0 and 1 endpoints) and `outputRange` are `["0%", dock0, dock1, dock2, "100%"]`. This guarantees the orb sits exactly on a box's centre when its panel is centred, and traverses the curve in between.
3. **Active panel.** Derived from the *same* `scrollYProgress` as the orb (single source of truth): `activeIndex` = the stage whose centring scroll value is nearest the current progress, within a band; outside any band (in the tails / mid-transition) there is no active box. This keeps the orb's docked position and the visible box perfectly in sync.
4. **Flash/fill.** When `activeIndex` changes: the orb briefly scales into a burst at the docked point; the new `VideoStage` reveals (radial flash → reveal) and plays from 0; the previous stage dissolves and pauses.
5. **Trail.** The same `pathD` stroked faint brand-blue + glow, uniform opacity (always visible), behind the boxes/orb.

## 6. Data model changes (`data.ts`)

```ts
export interface MinderRole {
  id: string;
  eyebrow: string;
  heading: { pre: string; em: string; post: string };
  body: string;
  points: string[];
  accent: string;          // kept (orb/flash tint per role, optional use)
  videoSrc?: string;       // provided later
  poster?: string;         // optional placeholder image
}
```

Remove `variant`, `device`, `buildTag`. Delete `RoleDevice.tsx` and its screens.

## 7. Mobile

- Single column (existing breakpoint). `useProjectorPath` returns a straight
  vertical path centred horizontally; boxes are full-width 16:9.
- Orb + flash kept; trail is a straight faint vertical line.

## 8. Accessibility / reduced motion

- `prefers-reduced-motion: reduce` (project already has `useReducedMotion`):
  hide orb + trail entirely; each `VideoStage` becomes statically visible when
  its panel enters view (gentle fade), video plays muted/looped.
- Video control is a real `<button>` with an accessible label; keyboard
  focusable.
- The orb/trail overlay is `aria-hidden` and `pointer-events-none`.

## 9. Performance

- Only the active video element is mounted/playing; others are unmounted or
  paused. `currentTime = 0` on activation.
- Orb motion uses GPU-friendly `transform`/`offset-distance`; no per-frame React
  re-renders (motion values update the DOM directly).
- Path recompute is throttled to resize via `ResizeObserver`.
- Respect existing scroll-snap on `main > section`; the orb overlay must not
  interfere (it is `pointer-events-none`, absolutely positioned).

## 10. Edge cases

- **No video yet:** poster placeholder; flash + reveal still work.
- **Fast scrolling:** orb follows scroll continuously (no queueing); active
  panel updates to wherever the user lands.
- **First load above the section / deep link to `#sec-minder`:** orb starts at
  path start; first panel can be active if centred.
- **Resize / orientation change:** path + dock distances recompute.
- **Reduced motion mid-session:** honoured on next render (acceptable).

## 11. Out of scope

- Real video assets (provided later).
- Per-role bespoke flash colours beyond the brand-blue/accent already defined.
- Changing the text copy, navbar, or other routes.

## 12. Verification plan

- `tsc --noEmit` and `eslint` clean.
- Dev server: on `/minder-ai`, scrolling moves the orb along the visible S-curve;
  each panel centring flashes its box and plays its (placeholder) video; only one
  box is visible at a time; scrolling away dissolves it.
- Mobile width: straight vertical path, full-width boxes, orb + flash present.
- `prefers-reduced-motion`: orb/trail hidden, boxes fade in statically, video
  plays muted.
- Home `/` unaffected.
