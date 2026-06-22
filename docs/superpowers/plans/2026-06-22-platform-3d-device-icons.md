# 3D Holographic Device Icons (Section 03) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the six flat 2D SVG device line-icons in Section 03's network graph with Three.js wireframe/holographic 3D device models, on a single transparent canvas overlaid on the existing SVG.

**Architecture:** The SVG (`NetworkGraph`) keeps drawing the MINDER AI hub, wires, packets, and the device-chip circles. The inner SVG icon glyphs are removed. A new `"use client"` component `DeviceIcons3D` renders one transparent `<canvas>` absolutely positioned over the SVG; an orthographic Three.js camera is mapped to the SVG `viewBox` (1040×460) so each 3D icon lands exactly on its chip. Three.js is lazy-loaded via `import("three")` inside the effect (kept out of the initial bundle; client-only).

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Three.js (vanilla), Tailwind v4, Vitest.

## Global Constraints

- **Next.js 16 rule:** `ssr: false` with `next/dynamic` is NOT allowed in Server Components. `NetworkGraph` stays a Server Component; the 3D overlay is a leaf Client Component (`"use client"`) imported directly — no `next/dynamic` needed. (Source: `node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md`.)
- **Bundle:** Three.js must NOT be statically imported into any module that the server bundle pulls in. Only `DeviceIcons3D`'s effect imports `three` at runtime via `await import("three")`. Geometry-builder modules reference Three.js **types only** (`import type`).
- **Brand color:** holographic edge color is cyan `#4FC3FF` (`0x4fc3ff`), matching the existing hub glow.
- **Accessibility:** the SVG keeps its existing `aria-label`; the canvas is `aria-hidden="true"`.
- **Motion:** respect `prefers-reduced-motion: reduce` (render one static frame, no animation loop). Pause the render loop when Section 03 is off-screen (IntersectionObserver).
- **Cleanup:** dispose geometries, materials, and the renderer; cancel the animation frame; disconnect observers on unmount.
- **Viewbox constants:** `VW = 1040`, `VH = 460` (the SVG `viewBox`). SVG→world mapping: `x_world = x - VW/2`, `y_world = VH/2 - y`.
- **Tests:** run in Vitest `node` environment, files matched by `src/**/*.test.ts`.

---

### Task 1: Add Three.js dependency

**Files:**
- Modify: `package.json` (dependencies + devDependencies)

**Interfaces:**
- Consumes: nothing.
- Produces: the `three` runtime package and `@types/three` types, available to later tasks.

- [ ] **Step 1: Install three + types**

```bash
npm install three@^0.184.0
npm install -D @types/three@^0.184.1
```

- [ ] **Step 2: Verify versions landed in package.json**

Run: `node -e "const p=require('./package.json');console.log(p.dependencies.three, p.devDependencies['@types/three'])"`
Expected: prints two version strings, e.g. `^0.184.0 ^0.184.1` (exact patch may differ).

- [ ] **Step 3: Verify the build still compiles with the new dep present**

Run: `npm run build`
Expected: build succeeds (no usage yet, just confirms the dependency install didn't break anything).

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "build: add three + @types/three for 3D device icons"
```

---

### Task 2: Device geometry builders

Pure, testable Three.js geometry builders. No runtime `three` import (types only) — the live module is passed in as an argument, which also keeps three out of the test/server static graph and lets the Vitest test pass in the real module.

**Files:**
- Create: `src/features/platform/device-geometries.ts`
- Test: `src/features/platform/device-geometries.test.ts`

**Interfaces:**
- Consumes: the Three.js module (passed as `ThreeNS`), Three.js types via `import type`.
- Produces:
  - `export type DeviceKey = "laptop" | "tablet" | "smartglasses" | "mobile" | "desktop" | "wearables";`
  - `export const DEVICE_KEYS: readonly DeviceKey[];`
  - `export function buildDeviceGroup(T: typeof import("three"), key: DeviceKey): import("three").Group;` — returns a `Group` of `LineSegments` (cyan core + additive glow per primitive), recentred on its bounding-box centre and normalized so its largest dimension is ≈ 1 unit.

- [ ] **Step 1: Write the failing test**

Create `src/features/platform/device-geometries.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import * as THREE from "three";
import { buildDeviceGroup, DEVICE_KEYS } from "./device-geometries";

describe("buildDeviceGroup", () => {
  it("exposes the six device keys", () => {
    expect([...DEVICE_KEYS].sort()).toEqual(
      ["desktop", "laptop", "mobile", "smartglasses", "tablet", "wearables"],
    );
  });

  it.each([...DEVICE_KEYS])("builds a non-empty line group for %s", (key) => {
    const g = buildDeviceGroup(THREE, key);
    expect(g.type).toBe("Group");
    expect(g.children.length).toBeGreaterThan(0);
    for (const child of g.children) {
      const seg = child as THREE.LineSegments;
      expect(seg.isLineSegments).toBe(true);
      expect(seg.geometry.getAttribute("position").count).toBeGreaterThan(0);
    }
  });

  it("normalizes laptop to roughly unit size, centred near origin", () => {
    const g = buildDeviceGroup(THREE, "laptop");
    const box = new THREE.Box3().setFromObject(g);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    expect(Math.max(size.x, size.y, size.z)).toBeLessThanOrEqual(1.2);
    expect(center.length()).toBeLessThan(0.25);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- device-geometries`
Expected: FAIL — cannot resolve `./device-geometries` (module not created yet).

- [ ] **Step 3: Write the implementation**

Create `src/features/platform/device-geometries.ts`:

```ts
import type * as THREE from "three";

type ThreeNS = typeof import("three");

export type DeviceKey =
  | "laptop"
  | "tablet"
  | "smartglasses"
  | "mobile"
  | "desktop"
  | "wearables";

export const DEVICE_KEYS: readonly DeviceKey[] = [
  "laptop",
  "tablet",
  "smartglasses",
  "mobile",
  "desktop",
  "wearables",
];

const CYAN = 0x4fc3ff;

/** Turn a solid geometry into a cyan edge outline plus a faint additive glow. */
function edgePair(T: ThreeNS, geo: THREE.BufferGeometry): THREE.LineSegments[] {
  const eg = new T.EdgesGeometry(geo, 25);
  geo.dispose();
  const core = new T.LineSegments(
    eg,
    new T.LineBasicMaterial({ color: CYAN, transparent: true, opacity: 0.95 }),
  );
  const glow = new T.LineSegments(
    eg,
    new T.LineBasicMaterial({
      color: CYAN,
      transparent: true,
      opacity: 0.35,
      blending: T.AdditiveBlending,
      depthWrite: false,
    }),
  );
  glow.scale.setScalar(1.06);
  return [core, glow];
}

/** Add one primitive (as edge + glow) to a group at an optional pose. */
function part(
  T: ThreeNS,
  group: THREE.Group,
  geo: THREE.BufferGeometry,
  opts: { pos?: [number, number, number]; rot?: [number, number, number] } = {},
): void {
  for (const seg of edgePair(T, geo)) {
    if (opts.pos) seg.position.set(opts.pos[0], opts.pos[1], opts.pos[2]);
    if (opts.rot) seg.rotation.set(opts.rot[0], opts.rot[1], opts.rot[2]);
    group.add(seg);
  }
}

function laptop(T: ThreeNS): THREE.Group {
  const g = new T.Group();
  part(T, g, new T.BoxGeometry(2.4, 0.14, 1.5), { pos: [0, -0.45, 0.15] }); // base
  part(T, g, new T.BoxGeometry(2.3, 1.4, 0.1), { pos: [0, 0.25, -0.55], rot: [-0.32, 0, 0] }); // screen
  return g;
}

function tablet(T: ThreeNS): THREE.Group {
  const g = new T.Group();
  part(T, g, new T.BoxGeometry(1.5, 2.1, 0.12));
  return g;
}

function mobile(T: ThreeNS): THREE.Group {
  const g = new T.Group();
  part(T, g, new T.BoxGeometry(1.0, 2.0, 0.16));
  return g;
}

function desktop(T: ThreeNS): THREE.Group {
  const g = new T.Group();
  part(T, g, new T.BoxGeometry(2.6, 1.7, 0.12), { pos: [0, 0.45, 0] }); // monitor
  part(T, g, new T.BoxGeometry(0.25, 0.5, 0.25), { pos: [0, -0.55, 0] }); // neck
  part(T, g, new T.BoxGeometry(1.0, 0.12, 0.5), { pos: [0, -0.85, 0] }); // foot
  return g;
}

function smartglasses(T: ThreeNS): THREE.Group {
  const g = new T.Group();
  part(T, g, new T.TorusGeometry(0.55, 0.09, 8, 20), { pos: [-0.7, 0, 0] }); // left lens
  part(T, g, new T.TorusGeometry(0.55, 0.09, 8, 20), { pos: [0.7, 0, 0] }); // right lens
  part(T, g, new T.BoxGeometry(0.5, 0.08, 0.08)); // bridge
  return g;
}

function wearables(T: ThreeNS): THREE.Group {
  const g = new T.Group();
  part(T, g, new T.BoxGeometry(1.1, 1.3, 0.3)); // watch face
  part(T, g, new T.TorusGeometry(0.75, 0.12, 8, 24)); // band ring
  return g;
}

const BUILDERS: Record<DeviceKey, (T: ThreeNS) => THREE.Group> = {
  laptop,
  tablet,
  smartglasses,
  mobile,
  desktop,
  wearables,
};

/** Build a normalized (≈unit-size, centred) holographic group for a device. */
export function buildDeviceGroup(T: ThreeNS, key: DeviceKey): THREE.Group {
  const g = BUILDERS[key](T);

  // Recentre on the bounding-box centre, then scale so the largest dim ≈ 1.
  const box = new T.Box3().setFromObject(g);
  const size = new T.Vector3();
  const center = new T.Vector3();
  box.getSize(size);
  box.getCenter(center);
  for (const child of g.children) child.position.sub(center);
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  g.scale.setScalar(1 / maxDim);
  return g;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- device-geometries`
Expected: PASS (3 test blocks; the `it.each` runs 6 cases).

- [ ] **Step 5: Commit**

```bash
git add src/features/platform/device-geometries.ts src/features/platform/device-geometries.test.ts
git commit -m "feat: three.js holographic device geometry builders"
```

---

### Task 3: Share viewBox constants from network-data

`VW`/`VH` currently live as private consts in `NetworkGraph.tsx`. Export them from `network-data.tsx` so both the SVG and the 3D overlay use one source of truth. Also remove the now-unused 2D `ICONS` export.

**Files:**
- Modify: `src/features/platform/network-data.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: `export const VW = 1040;` and `export const VH = 460;`. Removes `export const ICONS`. Keeps `NODES`, `EDGES`, `GraphNode` exactly as they are.

- [ ] **Step 1: Add VW/VH exports at the top of the NODES section**

In `src/features/platform/network-data.tsx`, immediately after the `import type { ReactNode }` line region, add the constants above the `NODES` declaration. Insert just before `export const NODES`:

```tsx
// Shared viewBox dimensions for the network graph — consumed by the SVG and by
// the 3D icon overlay so both map into the same coordinate space.
export const VW = 1040;
export const VH = 460;
```

- [ ] **Step 2: Remove the unused 2D ICONS export**

Delete the entire `export const ICONS: Record<string, ReactNode> = { ... };` block (the laptop/tablet/smartglasses/mobile/desktop/wearables SVG path definitions) at the bottom of the file, and delete the now-unused `import type { ReactNode } from "react";` line at the top.

- [ ] **Step 3: Verify the file still type-checks (ICONS removal has no dangling refs yet)**

Run: `npx tsc --noEmit`
Expected: ONE error remains — `NetworkGraph.tsx` still imports `ICONS`. That is expected and fixed in Task 5. (If you see errors in any *other* file, the edit was wrong.)

- [ ] **Step 4: Commit**

```bash
git add src/features/platform/network-data.tsx
git commit -m "refactor: export VW/VH from network-data, drop unused 2D ICONS"
```

---

### Task 4: The 3D overlay client component

**Files:**
- Create: `src/features/platform/DeviceIcons3D.tsx`

**Interfaces:**
- Consumes: `DEVICE_KEYS`, `buildDeviceGroup` (Task 2); `NODES`, `VW`, `VH` (Task 3); `three` at runtime via `await import("three")`.
- Produces: `export function DeviceIcons3D({ className }: { className?: string }): JSX.Element;` — renders a single `aria-hidden` `<canvas>`; all WebGL work runs in a `useEffect`.

- [ ] **Step 1: Create the component**

Create `src/features/platform/DeviceIcons3D.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";
import { DEVICE_KEYS, buildDeviceGroup } from "./device-geometries";
import { NODES, VW, VH } from "./network-data";

// How many viewBox units the normalized (unit-size) icon should span.
const ICON_WORLD = 46;

/**
 * Six holographic device icons drawn on one transparent canvas, aligned to the
 * `NetworkGraph` SVG's viewBox via an orthographic camera. Three.js is loaded
 * lazily (client-only) the first time the effect runs. Decorative: aria-hidden,
 * honours prefers-reduced-motion, and pauses while off-screen.
 */
export function DeviceIcons3D({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    type ThreeNS = typeof import("three");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let disposed = false;
    let running = false;
    let raf = 0;
    let last = 0;
    let renderer: import("three").WebGLRenderer | null = null;
    let scene: import("three").Scene | null = null;
    let camera: import("three").OrthographicCamera | null = null;
    let io: IntersectionObserver | null = null;
    let ro: ResizeObserver | null = null;
    const spinners: { group: import("three").Object3D; speed: number }[] = [];

    function render() {
      if (renderer && scene && camera) renderer.render(scene, camera);
    }

    function frame(t: number) {
      if (disposed) return;
      const dt = last ? (t - last) / 1000 : 0;
      last = t;
      for (const s of spinners) s.group.rotation.y += s.speed * dt;
      render();
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (running || disposed || reduce) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(frame);
    }

    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    function fit() {
      if (!renderer) return;
      const w = canvas.clientWidth || 1;
      const h = canvas.clientHeight || 1;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(w, h, false);
      render();
    }

    (async () => {
      const THREE: ThreeNS = await import("three");
      if (disposed) return;

      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      scene = new THREE.Scene();
      camera = new THREE.OrthographicCamera(
        -VW / 2,
        VW / 2,
        VH / 2,
        -VH / 2,
        0.1,
        1000,
      );
      camera.position.set(0, 0, 500);
      camera.lookAt(0, 0, 0);

      DEVICE_KEYS.forEach((key, i) => {
        const node = NODES[key];
        const g = buildDeviceGroup(THREE, key);
        g.scale.multiplyScalar(ICON_WORLD); // unit-size -> viewBox units
        g.position.set(node.x - VW / 2, VH / 2 - node.y, 0);
        g.rotation.x = 0.35; // slight tilt so depth reads even at rest
        scene!.add(g);
        spinners.push({ group: g, speed: 0.5 + (i % 3) * 0.18 });
      });

      fit();

      ro = new ResizeObserver(() => fit());
      ro.observe(canvas);

      io = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            if (reduce) render();
            else start();
          } else {
            stop();
          }
        },
        { threshold: 0.01 },
      );
      io.observe(canvas);
    })();

    return () => {
      disposed = true;
      stop();
      io?.disconnect();
      ro?.disconnect();
      scene?.traverse((obj) => {
        const any = obj as unknown as {
          geometry?: { dispose?: () => void };
          material?: { dispose?: () => void } | { dispose?: () => void }[];
        };
        any.geometry?.dispose?.();
        const m = any.material;
        if (Array.isArray(m)) m.forEach((x) => x.dispose?.());
        else m?.dispose?.();
      });
      renderer?.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
```

- [ ] **Step 2: Type-check the new component in isolation**

Run: `npx tsc --noEmit`
Expected: the only error is still the unresolved `ICONS` import in `NetworkGraph.tsx` (fixed next task). `DeviceIcons3D.tsx` itself must produce no errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/platform/DeviceIcons3D.tsx
git commit -m "feat: DeviceIcons3D overlay — lazy three.js, reduced-motion + offscreen pause"
```

---

### Task 5: Wire the overlay into NetworkGraph

Drop the inner 2D icon `<g>` from each device chip, wrap the SVG in a relative container, and mount `DeviceIcons3D` on top.

**Files:**
- Modify: `src/features/platform/NetworkGraph.tsx`

**Interfaces:**
- Consumes: `EDGES`, `NODES`, `VW`, `VH` from `network-data`; `DeviceIcons3D` from Task 4.
- Produces: unchanged public API — `export function NetworkGraph({ className }: { className?: string })`.

- [ ] **Step 1: Update imports and remove local VW/VH + icon-scale consts**

In `src/features/platform/NetworkGraph.tsx`:

Replace the import line:
```tsx
import { EDGES, ICONS, NODES } from "./network-data";
```
with:
```tsx
import { EDGES, NODES, VW, VH } from "./network-data";
import { DeviceIcons3D } from "./DeviceIcons3D";
```

Then delete these now-shared/unused local constants:
```tsx
const VW = 1040;
const VH = 460;
```
and
```tsx
const ICON = 40; // device icon size (24-unit viewBox scaled to this)
const ISCALE = ICON / 24;
```
Keep `const NH = 38;` and `const R = 34;`.

- [ ] **Step 2: Remove the inner SVG icon group from each device chip**

Replace the device-endpoints block (the `Object.entries(NODES).filter(...).map(...)` at the end) with this version — the chip `<circle>` stays, the inner icon `<g>` is gone:

```tsx
      {/* Device endpoints — chip circles only; the icons themselves are drawn
          as 3D holograms by the <DeviceIcons3D> overlay. */}
      {Object.entries(NODES)
        .filter(([, n]) => !n.root)
        .map(([key, n]) => (
          <circle
            key={key}
            cx={n.x}
            cy={n.y}
            r={R}
            fill="#0b1d4d"
            stroke="rgba(79,195,255,0.45)"
            strokeWidth={1.2}
          />
        ))}
```

- [ ] **Step 3: Wrap the SVG in a relative container and mount the overlay**

Change the component's outer markup so it returns a relative `<div>` carrying the incoming `className`, with the SVG sized to fill it and the overlay canvas absolutely positioned on top.

Change the opening from:
```tsx
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      className={className}
      role="img"
      aria-label="Six devices — Laptop, Tablet, Smart Glasses, Mobile, Desktop and Wearables — all connect inward to the central MINDER AI hub."
    >
```
to:
```tsx
    <div className={`relative ${className}`}>
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        className="block h-auto w-full"
        role="img"
        aria-label="Six devices — Laptop, Tablet, Smart Glasses, Mobile, Desktop and Wearables — all connect inward to the central MINDER AI hub."
      >
```

And change the closing `</svg>` to:
```tsx
      </svg>
      <DeviceIcons3D className="pointer-events-none absolute inset-0 h-full w-full" />
    </div>
```

(Re-indent the SVG body by one level if your editor doesn't auto-format; indentation is cosmetic and not required for correctness.)

- [ ] **Step 4: Type-check — all dangling refs now resolved**

Run: `npx tsc --noEmit`
Expected: PASS, no errors.

- [ ] **Step 5: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/features/platform/NetworkGraph.tsx
git commit -m "feat: mount 3D device-icon overlay in Section 03 network graph"
```

---

### Task 6: Full verification

**Files:** none (verification only).

**Interfaces:** none.

- [ ] **Step 1: Run the unit tests**

Run: `npm test`
Expected: PASS — all suites green, including `device-geometries.test.ts`.

- [ ] **Step 2: Production build**

Run: `npm run build`
Expected: build succeeds. Confirm in the route output that `three` is split into its own client chunk (loaded for the home route), not blocking the server bundle.

- [ ] **Step 3: Manual check in the browser**

Run: `npm run dev`, open the home page, scroll to Section 03 ("The platform").
Expected:
- Six glowing cyan **3D** device icons sit inside their chip circles (laptop, tablet, smart glasses, mobile, desktop, wearables), slowly rotating with a slight tilt.
- The icons stay aligned to their circles at both mobile (~375px) and desktop (~1440px) widths.
- The MINDER AI hub, wires, and flowing packets are unchanged.

- [ ] **Step 4: Reduced-motion check**

In DevTools, emulate `prefers-reduced-motion: reduce` (Rendering tab) and reload.
Expected: the 3D icons render but do **not** rotate (static frame).

- [ ] **Step 5: Off-screen pause check**

Scroll far away from Section 03.
Expected: no console errors; the page stays smooth (the render loop is paused while the section is off-screen).

- [ ] **Step 6: Final commit (if any tweaks were needed)**

```bash
git add -A
git commit -m "chore: verify 3D device icons (build, tests, manual)"
```

---

## Self-Review Notes

- **Spec coverage:** library=Three.js vanilla (Task 1, 4) ✓; scope=only 6 icons, hub/wires/packets/circles kept (Task 5) ✓; wireframe/holographic cyan edges (Task 2) ✓; one overlay canvas + orthographic viewBox mapping (Task 4) ✓; staggered Y-rotation (Task 4) ✓; prefers-reduced-motion (Task 4, 6) ✓; IntersectionObserver offscreen pause (Task 4, 6) ✓; cleanup/dispose (Task 4) ✓; SVG aria-label kept, canvas aria-hidden (Task 4, 5) ✓.
- **Deviation from spec (intentional, documented):** the spec said "dynamic import with `ssr: false`". Next 16 forbids `ssr: false` in Server Components (`NetworkGraph` is one). The corrected approach — a leaf Client Component that lazy-loads `three` via `import("three")` — satisfies the same intent (client-only, three kept out of the initial bundle).
- **Type consistency:** `buildDeviceGroup(T, key)` / `DEVICE_KEYS` / `DeviceKey` used identically in Task 2, its test, and Task 4. `VW`/`VH` exported in Task 3 and consumed in Tasks 4 and 5. `DeviceIcons3D({ className })` defined in Task 4, used in Task 5.
- **No placeholders:** every code step contains complete code; every run step has an exact command and expected output.
