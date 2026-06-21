# Minder AI Projector-Orb Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Minder AI device mockups with a single glowing orb that travels a visible S-curve as the user scrolls and "projects" each role's video into a box that materialises when its panel is centred.

**Architecture:** A full-section overlay holds an SVG S-curve (built from the measured centres of three video stages) and one orb whose CSS `offset-distance` is driven by the section's scroll progress via `motion/react` (same pattern as `SolarOrbit.tsx`). The panel nearest viewport-centre is "active"; its `VideoStage` flashes open and plays a muted, looping video. Pure geometry/selection math is unit-tested; the visual layer is verified by typecheck/lint + manual dev-server checks.

**Tech Stack:** Next 16 (App Router), React 19, TypeScript, Tailwind v4, `motion` v12 (`motion/react`), Vitest (new, for pure functions).

## Global Constraints

- All Minder work stays under `src/features/minder/` except the reusable curve helper, which goes in `src/lib/geometry/`. (verbatim from spec §4)
- Reuse the existing `offset-path`/`offset-distance` + `ResizeObserver` pattern from `src/visuals/SolarOrbit/SolarOrbit.tsx`; import motion APIs from `"motion/react"`.
- Animated/interactive files must start with `"use client";`.
- Video box aspect ratio is **16:9** (`aspect-[16/9]`). (spec §3)
- Respect `prefers-reduced-motion` via the existing `useReducedMotion()` hook from `@/hooks`: no orb/trail; boxes fade in statically; video still plays muted. (spec §8)
- Accent/brand colour token: `brand` = `#4fc3ff`; overlay is `aria-hidden` + `pointer-events-none`. (spec §8/§9)
- Only the active `<video>` is mounted/playing; `currentTime = 0` on activation. (spec §9)
- The home route `/` must remain unaffected. (spec §11)

---

## File Structure

- `vitest.config.ts` — **create**: Vitest config (node env, includes `src/**/*.test.ts`).
- `package.json` — **modify**: add `"test": "vitest run"` script + devDeps.
- `src/lib/geometry/sCurve.ts` — **create**: `buildSCurvePath` pure function.
- `src/lib/geometry/sCurve.test.ts` — **create**: unit tests.
- `src/lib/geometry/index.ts` — **modify**: re-export `buildSCurvePath`.
- `src/features/minder/projector.ts` — **create**: `activeIndexFromProgress`, `dockProgress` pure functions.
- `src/features/minder/projector.test.ts` — **create**: unit tests.
- `src/features/minder/data.ts` — **modify**: drop mockup fields, add `videoSrc?`/`poster?`.
- `src/features/minder/RoleDevice.tsx` — **delete**.
- `src/features/minder/VideoStage.tsx` — **create**: materialising video box + control.
- `src/features/minder/useProjectorPath.ts` — **create**: measure stages → path `d`, dock distances (%), dock progresses.
- `src/features/minder/ProjectorOrb.tsx` — **create**: trail SVG + orb.
- `src/features/minder/MinderRoles.tsx` — **modify**: orchestrator (scroll, transforms, active index, overlay).

---

## Task 1: Vitest setup + `buildSCurvePath`

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json`
- Create: `src/lib/geometry/sCurve.ts`
- Test: `src/lib/geometry/sCurve.test.ts`
- Modify: `src/lib/geometry/index.ts`

**Interfaces:**
- Produces: `buildSCurvePath(points: Pt[], tail?: number, k?: number): string` where `interface Pt { x: number; y: number }`. Returns an SVG path: a tail above the first point, smooth cubic-bézier segments through every point (vertical tangents), and a tail below the last point. All coordinates rounded to 2 decimals.

- [ ] **Step 1: Install Vitest**

Run:
```bash
npm install -D vitest@^2
```
Expected: adds `vitest` to devDependencies, no peer-dep errors.

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
```

- [ ] **Step 3: Add the test script to `package.json`**

In the `"scripts"` block add:
```json
"test": "vitest run"
```

- [ ] **Step 4: Write the failing test** — `src/lib/geometry/sCurve.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { buildSCurvePath } from "./sCurve";

describe("buildSCurvePath", () => {
  it("returns empty string for no points", () => {
    expect(buildSCurvePath([])).toBe("");
  });

  it("draws tails above and below a single point", () => {
    expect(buildSCurvePath([{ x: 100, y: 200 }], 80)).toBe(
      "M 100 120 L 100 200 L 100 280",
    );
  });

  it("connects two points with a vertical-tangent cubic bézier", () => {
    const d = buildSCurvePath([{ x: 100, y: 100 }, { x: 300, y: 500 }], 50, 0.5);
    // start tail
    expect(d.startsWith("M 100 50 L 100 100")).toBe(true);
    // cubic with control handles offset by (500-100)*0.5 = 200 in y
    expect(d).toContain("C 100 300 300 300 300 500");
    // end tail
    expect(d.endsWith("L 300 550")).toBe(true);
  });
});
```

- [ ] **Step 5: Run the test to verify it fails**

Run: `npx vitest run src/lib/geometry/sCurve.test.ts`
Expected: FAIL — cannot find module `./sCurve`.

- [ ] **Step 6: Implement `src/lib/geometry/sCurve.ts`**

```ts
/** A point in the overlay's pixel coordinate space. */
export interface Pt {
  x: number;
  y: number;
}

const r = (n: number) => Math.round(n * 100) / 100;

/**
 * Smooth vertical S-curve through `points`, with straight tails of length
 * `tail` extending above the first point and below the last. Control handles
 * are vertical (offset in y by `k` of the segment's height) so the curve snakes
 * smoothly between alternating-x points. Coordinates are rounded to 2 decimals.
 */
export function buildSCurvePath(points: Pt[], tail = 80, k = 0.5): string {
  if (points.length === 0) return "";
  const first = points[0];
  const last = points[points.length - 1];

  let d = `M ${r(first.x)} ${r(first.y - tail)} L ${r(first.x)} ${r(first.y)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const dy = (p1.y - p0.y) * k;
    d += ` C ${r(p0.x)} ${r(p0.y + dy)} ${r(p1.x)} ${r(p1.y - dy)} ${r(p1.x)} ${r(p1.y)}`;
  }
  d += ` L ${r(last.x)} ${r(last.y + tail)}`;
  return d;
}
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `npx vitest run src/lib/geometry/sCurve.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 8: Re-export from the geometry barrel** — `src/lib/geometry/index.ts`

Add:
```ts
export { buildSCurvePath, type Pt } from "./sCurve";
```

- [ ] **Step 9: Commit**

```bash
git add vitest.config.ts package.json package-lock.json src/lib/geometry/sCurve.ts src/lib/geometry/sCurve.test.ts src/lib/geometry/index.ts
git commit -m "feat(minder): add S-curve path builder + vitest"
```

---

## Task 2: Selection math (`activeIndexFromProgress`, `dockProgress`)

**Files:**
- Create: `src/features/minder/projector.ts`
- Test: `src/features/minder/projector.test.ts`

**Interfaces:**
- Produces:
  - `activeIndexFromProgress(progress: number, dockProgresses: number[], band?: number): number` — index of the dock nearest `progress` if within `band`, else `-1`.
  - `dockProgress(centerDocY: number, containerTop: number, containerH: number, viewportH: number): number` — scroll progress (0..1) at which a panel whose centre sits at document-Y `centerDocY` is centred in the viewport.

- [ ] **Step 1: Write the failing test** — `src/features/minder/projector.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { activeIndexFromProgress, dockProgress } from "./projector";

describe("activeIndexFromProgress", () => {
  const docks = [0.1, 0.5, 0.9];
  it("picks the nearest dock within the band", () => {
    expect(activeIndexFromProgress(0.52, docks, 0.18)).toBe(1);
    expect(activeIndexFromProgress(0.08, docks, 0.18)).toBe(0);
  });
  it("returns -1 when no dock is within the band", () => {
    expect(activeIndexFromProgress(0.3, docks, 0.05)).toBe(-1);
  });
});

describe("dockProgress", () => {
  it("maps a panel centre to its centred scroll progress", () => {
    // container 3000 tall, viewport 1000 -> scrollable 2000.
    // a centre at docY 1500 centres when scrollY = 1500 - 500 = 1000 -> 0.5
    expect(dockProgress(1500, 0, 3000, 1000)).toBeCloseTo(0.5, 5);
  });
  it("clamps to 0..1", () => {
    expect(dockProgress(0, 0, 3000, 1000)).toBe(0);
    expect(dockProgress(99999, 0, 3000, 1000)).toBe(1);
  });
  it("returns 0 when not scrollable", () => {
    expect(dockProgress(500, 0, 800, 1000)).toBe(0);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/features/minder/projector.test.ts`
Expected: FAIL — cannot find module `./projector`.

- [ ] **Step 3: Implement `src/features/minder/projector.ts`**

```ts
const clamp = (n: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, n));

/**
 * Index of the dock nearest `progress`, or -1 if the nearest is farther than
 * `band`. `dockProgresses` are the scroll-progress values at which each panel is
 * centred (ascending). `band` is the half-width of the "docked" zone.
 */
export function activeIndexFromProgress(
  progress: number,
  dockProgresses: number[],
  band = 0.18,
): number {
  let best = -1;
  let bestDist = Infinity;
  dockProgresses.forEach((dp, i) => {
    const dist = Math.abs(progress - dp);
    if (dist < bestDist) {
      bestDist = dist;
      best = i;
    }
  });
  return bestDist <= band ? best : -1;
}

/**
 * Scroll progress (0..1, matching a `useScroll` offset of
 * ["start start", "end end"]) at which a panel centred at document-Y
 * `centerDocY` sits at the viewport centre.
 */
export function dockProgress(
  centerDocY: number,
  containerTop: number,
  containerH: number,
  viewportH: number,
): number {
  const scrollable = containerH - viewportH;
  if (scrollable <= 0) return 0;
  return clamp((centerDocY - viewportH / 2 - containerTop) / scrollable, 0, 1);
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/features/minder/projector.test.ts`
Expected: PASS (5 assertions across 5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/features/minder/projector.ts src/features/minder/projector.test.ts
git commit -m "feat(minder): add projector selection + dock-progress math"
```

---

## Task 3: Data model + remove the device mockups (build stays green)

**Files:**
- Modify: `src/features/minder/data.ts`
- Delete: `src/features/minder/RoleDevice.tsx`
- Modify: `src/features/minder/MinderRoles.tsx`

**Interfaces:**
- Produces: `MinderRole` shape (consumed by Task 4 `VideoStage` and Task 7 orchestrator):

```ts
interface MinderRole {
  id: string;
  eyebrow: string;
  heading: { pre: string; em: string; post: string };
  body: string;
  points: string[];
  accent: string;
  videoSrc?: string;
  poster?: string;
}
```

This task replaces the `RoleDevice` column with a plain `aspect-[16/9]` placeholder so the page still builds; the real `VideoStage` and orb arrive in later tasks.

- [ ] **Step 1: Update `data.ts`** — remove `variant`, `device`, `buildTag` from the interface and every entry; add optional `videoSrc`/`poster`.

Replace the `MinderRole` interface with:
```ts
export interface MinderRole {
  /** Anchor id for the panel (the first one is the nav target). */
  id: string;
  /** Eyebrow text, e.g. "AI Coach · 01". */
  eyebrow: string;
  /** Heading split so the spec's wording stays one uniform style. */
  heading: { pre: string; em: string; post: string };
  /** Lead paragraph. */
  body: string;
  /** Four-item capability checklist. */
  points: string[];
  /** Per-role accent (orb/flash tint). */
  accent: string;
  /** Demo video source (provided later). */
  videoSrc?: string;
  /** Optional placeholder poster image. */
  poster?: string;
}
```

Then in each of the three entries, delete the `device`, `buildTag`, and `variant` lines. Keep `id`, `eyebrow`, `accent`, `heading`, `body`, `points`. Remove the now-unused `RoleDevice` type export at the top of the file (the `export type RoleDevice = ...` line).

- [ ] **Step 2: Delete the mockup component**

Run:
```bash
git rm src/features/minder/RoleDevice.tsx
```

- [ ] **Step 3: Update `MinderRoles.tsx`** to drop the `RoleDevice` import and render a placeholder box

Replace the file with:
```tsx
import { Eyebrow } from "@/components/ui";
import { CheckIcon } from "@/components/ui/icons";
import { unnaFont, poppinsFont } from "@/constants";
import { minderRoles, type MinderRole } from "./data";

/** One full-height role panel: copy on one side, media box on the other. */
function RolePanel({ role, index }: { role: MinderRole; index: number }) {
  const mediaRight = index % 2 === 0;

  return (
    <section id={role.id} className="flex min-h-svh items-center px-6 py-16 sm:py-24">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 md:grid-cols-2 md:gap-16">
        {/* ── Copy ─────────────────────────────────────── */}
        <div className={mediaRight ? "md:order-1" : "md:order-2"}>
          <Eyebrow className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-brand shadow-[0_0_8px] shadow-brand/70" />
            {role.eyebrow}
          </Eyebrow>

          <h2
            className="mt-4 text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl"
            style={unnaFont}
          >
            {role.heading.pre}
            {role.heading.em}
            {role.heading.post}
          </h2>

          <p
            className="mt-5 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg"
            style={poppinsFont}
          >
            {role.body}
          </p>

          <ul className="mt-8 flex flex-col gap-3.5" style={poppinsFont}>
            {role.points.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand/15 text-brand">
                  <CheckIcon className="h-3 w-3" />
                </span>
                <span className="text-sm text-white/80 sm:text-[15px]">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Media box (placeholder until VideoStage/orb land) ── */}
        <div className={`flex justify-center ${mediaRight ? "md:order-2 md:justify-end" : "md:order-1 md:justify-start"}`}>
          <div className="aspect-[16/9] w-full max-w-md rounded-2xl border border-white/10 bg-[#070d20]/80" />
        </div>
      </div>
    </section>
  );
}

/** "Minder AI" — the three roles one intelligence plays on the floor. */
export function MinderRoles() {
  return (
    <>
      {minderRoles.map((role, i) => (
        <RolePanel key={role.id} role={role} index={i} />
      ))}
    </>
  );
}
```

- [ ] **Step 4: Verify build is green**

Run: `npx tsc --noEmit && npx eslint src/features/minder`
Expected: no output (clean). No remaining references to `RoleDevice`.

- [ ] **Step 5: Commit**

```bash
git add src/features/minder/data.ts src/features/minder/MinderRoles.tsx
git commit -m "refactor(minder): drop device mockups, add video fields + placeholder box"
```

---

## Task 4: `VideoStage` — materialising video box

**Files:**
- Create: `src/features/minder/VideoStage.tsx`
- Modify: `src/features/minder/MinderRoles.tsx`

**Interfaces:**
- Consumes: `MinderRole` (Task 3).
- Produces: `VideoStage` React component:
  `function VideoStage({ role, active, reducedMotion, stageRef }: { role: MinderRole; active: boolean; reducedMotion: boolean; stageRef?: React.Ref<HTMLDivElement> }): JSX.Element`
  - `active` true → box visible (flash/scale-in), video plays from 0 (muted, looped); false → box hidden, video paused.
  - Renders a mute/pause control (a real `<button>`).
  - `stageRef` is forwarded to the outer box element so the orchestrator can measure its centre.

This task wires `VideoStage` into `MinderRoles` driven by a temporary scroll-spy active index (no orb yet) so the flash/play behaviour can be verified on its own.

- [ ] **Step 1: Create `src/features/minder/VideoStage.tsx`**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { monoFont } from "@/constants";
import type { MinderRole } from "./data";

/** A 16:9 media box that materialises (flash + reveal) when `active`, playing a
 *  muted, looping video with a small unmute/pause control. Hidden otherwise. */
export function VideoStage({
  role,
  active,
  reducedMotion,
  stageRef,
}: {
  role: MinderRole;
  active: boolean;
  reducedMotion: boolean;
  stageRef?: React.Ref<HTMLDivElement>;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);

  // Play from the start when activated; pause + rewind when deactivated.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (active && !paused) {
      v.currentTime = 0;
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [active, paused]);

  const visible = active || reducedMotion;

  return (
    <div
      ref={stageRef}
      className={`relative aspect-[16/9] w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#070d20]/80 shadow-2xl shadow-black/40 transition-all duration-500 ${
        visible ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
      }`}
    >
      {/* Flash overlay on activation */}
      <div
        className={`pointer-events-none absolute inset-0 z-10 bg-brand/60 transition-opacity duration-300 ${
          active && !reducedMotion ? "animate-[minder-flash_600ms_ease-out_forwards]" : "opacity-0"
        }`}
      />

      {role.videoSrc ? (
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          src={role.videoSrc}
          poster={role.poster}
          muted={muted}
          loop
          playsInline
          preload="none"
        />
      ) : (
        // Placeholder until a real video is supplied.
        <div className="grid h-full w-full place-items-center bg-[radial-gradient(60%_60%_at_50%_40%,rgba(79,195,255,0.18),transparent_70%)]">
          <span className="text-xs uppercase tracking-[0.2em] text-white/40" style={monoFont}>
            {role.eyebrow}
          </span>
        </div>
      )}

      {/* Controls — only meaningful once a real video exists */}
      {role.videoSrc && visible && (
        <div className="absolute bottom-2 right-2 z-20 flex gap-1.5" style={monoFont}>
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "Play video" : "Pause video"}
            className="grid h-7 w-7 place-items-center rounded-full border border-white/15 bg-black/40 text-[11px] text-white/80 backdrop-blur hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            {paused ? "▶" : "⏸"}
          </button>
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? "Unmute video" : "Mute video"}
            className="grid h-7 w-7 place-items-center rounded-full border border-white/15 bg-black/40 text-[11px] text-white/80 backdrop-blur hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            {muted ? "🔇" : "🔊"}
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Add the flash keyframe to `src/app/globals.css`**

Append at the end of the file:
```css
/* Minder AI projector — flash that fills a video stage on activation */
@keyframes minder-flash {
  0% { opacity: 0; }
  35% { opacity: 0.85; }
  100% { opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .animate-\[minder-flash_600ms_ease-out_forwards\] { animation: none !important; }
}
```

- [ ] **Step 3: Wire `VideoStage` into `MinderRoles` with a temporary scroll-spy active index**

Replace `src/features/minder/MinderRoles.tsx` with:
```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Eyebrow } from "@/components/ui";
import { CheckIcon } from "@/components/ui/icons";
import { unnaFont, poppinsFont } from "@/constants";
import { useReducedMotion } from "@/hooks";
import { minderRoles, type MinderRole } from "./data";
import { VideoStage } from "./VideoStage";

function RolePanel({
  role,
  index,
  active,
  reducedMotion,
}: {
  role: MinderRole;
  index: number;
  active: boolean;
  reducedMotion: boolean;
}) {
  const mediaRight = index % 2 === 0;

  return (
    <section id={role.id} className="flex min-h-svh items-center px-6 py-16 sm:py-24">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 md:grid-cols-2 md:gap-16">
        <div className={mediaRight ? "md:order-1" : "md:order-2"}>
          <Eyebrow className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-brand shadow-[0_0_8px] shadow-brand/70" />
            {role.eyebrow}
          </Eyebrow>
          <h2 className="mt-4 text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl" style={unnaFont}>
            {role.heading.pre}
            {role.heading.em}
            {role.heading.post}
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg" style={poppinsFont}>
            {role.body}
          </p>
          <ul className="mt-8 flex flex-col gap-3.5" style={poppinsFont}>
            {role.points.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand/15 text-brand">
                  <CheckIcon className="h-3 w-3" />
                </span>
                <span className="text-sm text-white/80 sm:text-[15px]">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={`flex justify-center ${mediaRight ? "md:order-2 md:justify-end" : "md:order-1 md:justify-start"}`}>
          <VideoStage role={role} active={active} reducedMotion={reducedMotion} />
        </div>
      </div>
    </section>
  );
}

export function MinderRoles() {
  const reducedMotion = useReducedMotion();
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  // Temporary: pick whichever panel centre is nearest the viewport centre.
  useEffect(() => {
    const onScroll = () => {
      const mid = window.innerHeight / 2;
      let best = 0;
      let bestDist = Infinity;
      sectionRefs.current.forEach((el, i) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const dist = Math.abs(rect.top + rect.height / 2 - mid);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });
      setActiveIndex(best);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {minderRoles.map((role, i) => (
        <div key={role.id} ref={(el) => { sectionRefs.current[i] = el; }}>
          <RolePanel role={role} index={i} active={i === activeIndex} reducedMotion={reducedMotion} />
        </div>
      ))}
    </>
  );
}
```

- [ ] **Step 4: Verify build + behaviour**

Run: `npx tsc --noEmit && npx eslint src/features/minder src/app/globals.css || true`
Expected: typecheck/lint clean (eslint may not lint css; the `|| true` guards that).

Then manual: start `npm run dev`, open `/minder-ai`. Expected: as you scroll, exactly one box is visible at a time (the centred panel), it scales/flashes in, others are hidden. (Video shows the placeholder until assets exist.)

- [ ] **Step 5: Commit**

```bash
git add src/features/minder/VideoStage.tsx src/features/minder/MinderRoles.tsx src/app/globals.css
git commit -m "feat(minder): materialising VideoStage driven by nearest-panel active index"
```

---

## Task 5: `useProjectorPath` — measure stages → path, docks

**Files:**
- Create: `src/features/minder/useProjectorPath.ts`

**Interfaces:**
- Consumes: `buildSCurvePath`, `Pt` (Task 1); `dockProgress` (Task 2).
- Produces:
  `useProjectorPath(args: { overlayRef: React.RefObject<HTMLDivElement | null>; stageRefs: React.MutableRefObject<(HTMLElement | null)[]>; pathRef: React.RefObject<SVGPathElement | null>; mobile: boolean; }): { pathD: string; size: { w: number; h: number }; dockDistances: number[]; dockProgresses: number[]; }`
  - `pathD`: S-curve through stage centres in overlay-pixel space (straight vertical line on mobile).
  - `size`: overlay pixel size (for the SVG `width`/`height`/`viewBox`).
  - `dockDistances`: `offset-distance` percentage (0..100) of each stage centre along the path.
  - `dockProgresses`: scroll progress (0..1) at which each panel centres.
  - Recomputes on resize via `ResizeObserver`.

- [ ] **Step 1: Create `src/features/minder/useProjectorPath.ts`**

```ts
"use client";

import { useLayoutEffect, useState } from "react";
import { buildSCurvePath, type Pt } from "@/lib/geometry";
import { dockProgress } from "./projector";

interface Args {
  overlayRef: React.RefObject<HTMLDivElement | null>;
  stageRefs: React.MutableRefObject<(HTMLElement | null)[]>;
  pathRef: React.RefObject<SVGPathElement | null>;
  mobile: boolean;
}

interface Result {
  pathD: string;
  size: { w: number; h: number };
  dockDistances: number[];
  dockProgresses: number[];
}

/** Sample the path at 240 points and return the offset-distance % nearest `pt`. */
function distancePercentAt(path: SVGPathElement, pt: Pt, total: number): number {
  if (total === 0) return 0;
  let bestLen = 0;
  let bestD = Infinity;
  const N = 240;
  for (let i = 0; i <= N; i++) {
    const len = (i / N) * total;
    const p = path.getPointAtLength(len);
    const d = (p.x - pt.x) ** 2 + (p.y - pt.y) ** 2;
    if (d < bestD) {
      bestD = d;
      bestLen = len;
    }
  }
  return (bestLen / total) * 100;
}

export function useProjectorPath({ overlayRef, stageRefs, pathRef, mobile }: Args): Result {
  const [result, setResult] = useState<Result>({
    pathD: "",
    size: { w: 0, h: 0 },
    dockDistances: [],
    dockProgresses: [],
  });

  useLayoutEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    const measure = () => {
      const o = overlay.getBoundingClientRect();
      const w = o.width;
      const h = o.height;
      const scrollY = window.scrollY;
      const containerTop = o.top + scrollY;
      const viewportH = window.innerHeight;

      const localPts: Pt[] = [];
      const centerDocYs: number[] = [];
      stageRefs.current.forEach((el) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const cx = r.left - o.left + r.width / 2;
        const cy = r.top - o.top + r.height / 2;
        localPts.push({ x: mobile ? w / 2 : cx, y: cy });
        centerDocYs.push(r.top + scrollY + r.height / 2);
      });

      if (localPts.length === 0) return;

      const pathD = buildSCurvePath(localPts);

      // dock distances need the rendered path; defer one frame so pathRef updates.
      requestAnimationFrame(() => {
        const path = pathRef.current;
        const total = path?.getTotalLength?.() ?? 0;
        const dockDistances = path
          ? localPts.map((p) => distancePercentAt(path, p, total))
          : localPts.map((_, i) => (i / Math.max(1, localPts.length - 1)) * 100);
        const dockProgresses = centerDocYs.map((y) =>
          dockProgress(y, containerTop, h, viewportH),
        );
        setResult({ pathD, size: { w, h }, dockDistances, dockProgresses });
      });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(overlay);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobile]);

  return result;
}
```

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit && npx eslint src/features/minder/useProjectorPath.ts`
Expected: clean. (Not consumed yet — wired in Task 7.)

- [ ] **Step 3: Commit**

```bash
git add src/features/minder/useProjectorPath.ts
git commit -m "feat(minder): useProjectorPath hook (measure stages -> path + docks)"
```

---

## Task 6: `ProjectorOrb` — trail + orb

**Files:**
- Create: `src/features/minder/ProjectorOrb.tsx`

**Interfaces:**
- Consumes: nothing from earlier tasks beyond props.
- Produces: `ProjectorOrb` component:
  `function ProjectorOrb({ pathD, size, offsetDistance, flashing, pathRef }: { pathD: string; size: { w: number; h: number }; offsetDistance: MotionValue<string>; flashing: boolean; pathRef: React.Ref<SVGPathElement> }): JSX.Element`
  - Renders the faint always-visible trail (`<path>` with `pathRef`) and the orb (`motion.div` riding `offsetPath: path(pathD)` with the supplied `offsetDistance`).
  - `flashing` scales the orb into a brief burst.

- [ ] **Step 1: Create `src/features/minder/ProjectorOrb.tsx`**

```tsx
"use client";

import { motion, type MotionValue } from "motion/react";

/** The beacon orb (reuses the ScrollProgress aesthetic) + its glowing trail. */
export function ProjectorOrb({
  pathD,
  size,
  offsetDistance,
  flashing,
  pathRef,
}: {
  pathD: string;
  size: { w: number; h: number };
  offsetDistance: MotionValue<string>;
  flashing: boolean;
  pathRef: React.Ref<SVGPathElement>;
}) {
  if (!pathD) {
    // Render the measuring path even before sizing, so the hook can read it.
    return (
      <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
        <path ref={pathRef} d={pathD} fill="none" />
      </svg>
    );
  }

  return (
    <>
      {/* Faint always-visible S-curve trail */}
      <svg
        className="absolute inset-0"
        width={size.w}
        height={size.h}
        viewBox={`0 0 ${size.w} ${size.h}`}
        fill="none"
        aria-hidden="true"
      >
        <path d={pathD} stroke="rgba(79,195,255,0.16)" strokeWidth={2} />
        <path
          ref={pathRef}
          d={pathD}
          stroke="rgba(79,195,255,0.5)"
          strokeWidth={1}
          style={{ filter: "drop-shadow(0 0 4px rgba(0,191,255,0.6))" }}
        />
      </svg>

      {/* The orb */}
      <motion.div
        className="absolute left-0 top-0 will-change-transform"
        style={{
          offsetPath: `path("${pathD}")`,
          offsetRotate: "0deg",
          offsetAnchor: "center center",
          offsetDistance,
        }}
        aria-hidden="true"
      >
        <motion.div
          className="relative h-0 w-0"
          animate={{ scale: flashing ? 2.4 : 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 18 }}
        >
          {/* outer blue halo */}
          <div className="absolute left-1/2 top-1/2 h-[120px] w-[120px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
            style={{ background: "radial-gradient(circle, rgba(0,102,255,0.4) 0%, rgba(0,102,255,0.14) 45%, transparent 72%)" }} />
          {/* cyan glow */}
          <div className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full blur-md"
            style={{ background: "radial-gradient(circle, rgba(0,191,255,0.7) 0%, rgba(0,191,255,0.3) 45%, transparent 72%)" }} />
          {/* white core */}
          <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-white"
            style={{ boxShadow: "0 0 6px 2px #fff, 0 0 14px 5px rgba(0,191,255,0.95), 0 0 30px 12px rgba(0,102,255,0.6)" }} />
        </motion.div>
      </motion.div>
    </>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit && npx eslint src/features/minder/ProjectorOrb.tsx`
Expected: clean. (Wired in Task 7.)

- [ ] **Step 3: Commit**

```bash
git add src/features/minder/ProjectorOrb.tsx
git commit -m "feat(minder): ProjectorOrb (beacon orb + glowing S-curve trail)"
```

---

## Task 7: Orchestrate — scroll-driven orb + active sync

**Files:**
- Modify: `src/features/minder/MinderRoles.tsx`

**Interfaces:**
- Consumes: `useReducedMotion` (`@/hooks`); `useScroll`, `useTransform`, `useMotionValueEvent`, `useMotionValue` (`motion/react`); `VideoStage` (Task 4); `useProjectorPath` (Task 5); `ProjectorOrb` (Task 6); `activeIndexFromProgress` (Task 2).

- [ ] **Step 1: Rewrite `src/features/minder/MinderRoles.tsx` as the orchestrator**

```tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useScroll, useTransform, useMotionValueEvent } from "motion/react";
import { Eyebrow } from "@/components/ui";
import { CheckIcon } from "@/components/ui/icons";
import { unnaFont, poppinsFont } from "@/constants";
import { useReducedMotion } from "@/hooks";
import { minderRoles, type MinderRole } from "./data";
import { VideoStage } from "./VideoStage";
import { ProjectorOrb } from "./ProjectorOrb";
import { useProjectorPath } from "./useProjectorPath";
import { activeIndexFromProgress } from "./projector";

function RolePanel({
  role,
  index,
  active,
  reducedMotion,
  stageRef,
}: {
  role: MinderRole;
  index: number;
  active: boolean;
  reducedMotion: boolean;
  stageRef: (el: HTMLElement | null) => void;
}) {
  const mediaRight = index % 2 === 0;
  return (
    <section id={role.id} className="flex min-h-svh items-center px-6 py-16 sm:py-24">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 md:grid-cols-2 md:gap-16">
        <div className={mediaRight ? "md:order-1" : "md:order-2"}>
          <Eyebrow className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-brand shadow-[0_0_8px] shadow-brand/70" />
            {role.eyebrow}
          </Eyebrow>
          <h2 className="mt-4 text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl" style={unnaFont}>
            {role.heading.pre}
            {role.heading.em}
            {role.heading.post}
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg" style={poppinsFont}>
            {role.body}
          </p>
          <ul className="mt-8 flex flex-col gap-3.5" style={poppinsFont}>
            {role.points.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand/15 text-brand">
                  <CheckIcon className="h-3 w-3" />
                </span>
                <span className="text-sm text-white/80 sm:text-[15px]">{point}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className={`flex justify-center ${mediaRight ? "md:order-2 md:justify-end" : "md:order-1 md:justify-start"}`}>
          <VideoStage role={role} active={active} reducedMotion={reducedMotion} stageRef={stageRef} />
        </div>
      </div>
    </section>
  );
}

export function MinderRoles() {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const stageRefs = useRef<(HTMLElement | null)[]>([]);

  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const { pathD, size, dockDistances, dockProgresses } = useProjectorPath({
    overlayRef,
    stageRefs,
    pathRef,
    mobile,
  });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Build a monotonic mapping: scroll progress -> offset-distance %.
  const { input, output } = useMemo(() => {
    if (dockProgresses.length === 0 || dockDistances.length === 0) {
      return { input: [0, 1], output: ["0%", "100%"] as string[] };
    }
    const inp = [0, ...dockProgresses, 1];
    const out = ["0%", ...dockDistances.map((d) => `${d}%`), "100%"];
    // Enforce strictly increasing input to satisfy useTransform.
    for (let i = 1; i < inp.length; i++) {
      if (inp[i] <= inp[i - 1]) inp[i] = inp[i - 1] + 0.0001;
    }
    return { input: inp, output: out };
  }, [dockProgresses, dockDistances]);

  const offsetDistance = useTransform(scrollYProgress, input, output);

  // Active panel + flash, derived from the same scroll progress.
  const [activeIndex, setActiveIndex] = useState(0);
  const [flashing, setFlashing] = useState(false);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (dockProgresses.length === 0) return;
    const next = activeIndexFromProgress(p, dockProgresses, 0.16);
    if (next !== -1 && next !== activeIndex) {
      setActiveIndex(next);
      setFlashing(true);
      if (flashTimer.current) clearTimeout(flashTimer.current);
      flashTimer.current = setTimeout(() => setFlashing(false), 600);
    }
  });

  // Static fallback (no scroll events fire if reduced motion / SSR): use an
  // IntersectionObserver so every box still activates when scrolled into view.
  useEffect(() => {
    if (!reducedMotion) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const i = stageRefs.current.indexOf(e.target as HTMLElement);
            if (i >= 0) setActiveIndex(i);
          }
        });
      },
      { rootMargin: "-40% 0px -40% 0px" },
    );
    stageRefs.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, [reducedMotion]);

  return (
    <div ref={containerRef} className="relative">
      {/* Orb + trail overlay — spans the whole Minder section */}
      {!reducedMotion && (
        <div ref={overlayRef} className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
          <ProjectorOrb
            pathD={pathD}
            size={size}
            offsetDistance={offsetDistance}
            flashing={flashing}
            pathRef={pathRef}
          />
        </div>
      )}

      <div className="relative z-10">
        {minderRoles.map((role, i) => (
          <RolePanel
            key={role.id}
            role={role}
            index={i}
            active={i === activeIndex}
            reducedMotion={reducedMotion}
            stageRef={(el) => { stageRefs.current[i] = el; }}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit && npx eslint src/features/minder`
Expected: clean.

- [ ] **Step 3: Manual verification on the dev server**

Start `npm run dev`, open `/minder-ai`:
- A faint blue S-curve is visible weaving through the three media slots.
- Scrolling moves the orb along the curve in real time.
- When a panel centres, its box flashes open and shows the video/placeholder; only one box is visible at a time; scrolling away dissolves it and the orb continues.

- [ ] **Step 4: Commit**

```bash
git add src/features/minder/MinderRoles.tsx
git commit -m "feat(minder): scroll-driven projector orb wired to video stages"
```

---

## Task 8: Full verification + responsive/accessibility pass

**Files:** none (verification + any small fixes uncovered).

- [ ] **Step 1: Static checks**

Run: `npx tsc --noEmit && npx eslint src && npm run test`
Expected: all clean / all tests pass.

- [ ] **Step 2: Production build**

Run: `npm run build`
Expected: build succeeds (both `/` and `/minder-ai` compile).

- [ ] **Step 3: Manual matrix (dev server)**

- Desktop `/minder-ai`: orb travels the S-curve; one box active at a time; flash on dock.
- Resize the window: trail/path recompute; orb still docks correctly.
- Mobile width (≤767px, devtools): path is a straight vertical line down the centre; boxes full-width; orb + flash present.
- Reduced motion (devtools "Emulate prefers-reduced-motion: reduce"): no orb/trail; each box fades in statically when scrolled to; video plays muted.
- Home `/`: unchanged (no orb, all original sections present).

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix(minder): responsive + reduced-motion verification fixes"
```
(Skip if no changes were needed.)

---

## Notes for the implementer

- **Why measure + getPointAtLength:** `offset-distance` is arc-length based; mapping each panel's *scroll* progress to its *path* distance (Task 7's `useTransform`) keeps the orb docked exactly on a box when its panel is centred, even though the curve isn't vertically uniform.
- **One video at a time:** `VideoStage` mounts the `<video>` always but only `play()`s when active and `pause()`s otherwise; `preload="none"` avoids fetching inactive videos.
- **Videos are supplied later:** until `role.videoSrc` is set in `data.ts`, the placeholder renders — the flash/orb/box behaviour is fully testable without assets.
