# Section 03 — 3D holographic device icons

**Date:** 2026-06-22
**Status:** Approved (pending spec review)

## Goal

Replace the six **flat 2D SVG line-icons** of the device endpoints in Section 03
("The platform", the `NetworkGraph`) with **3D holographic device models** rendered
with Three.js. Everything else in the network diagram — the glowing MINDER AI hub,
the wires, the travelling packets, and the cyan device-chip *circles* — stays exactly
as it is today.

## Decisions (locked)

| Decision | Choice |
| --- | --- |
| 3D library | **Three.js** (`three` + `@types/three`) — added to `package.json` |
| Scope | **Only the 6 device icons**; rest of the SVG graph unchanged |
| Visual style | **Wireframe / holographic** — glowing cyan edges (`#4FC3FF`) |
| API style | **Vanilla three.js** in a client component (no React Three Fiber) |

## Architecture

### One canvas, not six

Six separate WebGL canvases would be heavy and risk hitting the browser's WebGL
context limit (~16). Instead:

- A **single transparent `<canvas>`** is overlaid on top of the existing SVG, covering
  the same box.
- The SVG keeps drawing the hub, wires, packets, and the dark cyan-bordered device
  *circles* (the "sockets"). Only the inner `ICONS` glyphs are removed from the SVG.
- The 3D icons are drawn into the overlay canvas at the exact chip positions.

### Coordinate alignment

The SVG uses `viewBox="0 0 1040 460"` inside a responsive, fixed-aspect container
(`h-auto w-full max-w-5xl`). The overlay canvas fills the same container, so both
scale together and stay aligned.

The three.js scene uses an **orthographic camera** whose frustum is mapped to the
viewBox space (width 1040, height 460). Each device mesh is placed at its node
coordinate, converting SVG space (y-down, origin top-left) to three.js space
(y-up, origin centre):

```
x_world = NODES[key].x - VW/2      // VW = 1040
y_world = VH/2 - NODES[key].y      // VH = 460
```

The icons are sized to roughly the chip's icon footprint (~40 viewBox units).

### Components / files

| File | Change |
| --- | --- |
| `package.json` | add `three` (dep) + `@types/three` (devDep) |
| `src/features/platform/device-geometries.ts` | **new** — pure builders that return a `THREE.Group` of glowing edges for each of the 6 devices |
| `src/features/platform/DeviceIcons3D.tsx` | **new** — `"use client"` component: sets up renderer/scene/camera, mounts the 6 device groups at node coords, runs the animation loop |
| `src/features/platform/NetworkGraph.tsx` | stop rendering the inner SVG `ICONS`; wrap the SVG in a relative container and mount `<DeviceIcons3D>` (dynamic import, `ssr: false`) as an absolutely-positioned overlay |
| `src/features/platform/network-data.tsx` | `ICONS` no longer needed by the SVG; remove it (or keep node list as the single source of device keys) |

`NetworkGraph` is currently a server component. It stays a server component; only the
new overlay child is a client component, dynamically imported with `ssr: false`.

### The 6 holographic models

Each model is built from three.js primitives, then rendered **edges-only** using
`THREE.EdgesGeometry` + `THREE.LineBasicMaterial` (color `#4FC3FF`), giving a clean
holographic outline that echoes the current thin-stroke line icons. A faint additive
glow (a slightly larger, low-opacity duplicate, or `LineBasicMaterial` with additive
blending) gives the neon feel consistent with the hub's `#4FC3FF` glow.

- **laptop** — flat base box + angled screen box
- **tablet** — thin rounded slab
- **mobile** — slimmer, taller slab
- **desktop** — monitor box + small stand/foot
- **smart glasses** — two lens rings (`TorusGeometry`) joined by a bridge
- **wearables** — watch: small face box + band (`TorusGeometry`)

Geometries are low-poly (few segments) — this is decorative, not detailed CAD.

### Motion

- Each icon slowly rotates about its Y axis. Rotation speed/phase is **staggered per
  icon** (e.g. by index) so they don't spin in lockstep.
- Optional very subtle vertical bob is out of scope (YAGNI) unless trivially free.
- **`prefers-reduced-motion: reduce`** → render a single static frame and do **not**
  start the `requestAnimationFrame` loop.
- An **IntersectionObserver** on the section pauses the render loop when Section 03 is
  off-screen, and resumes it when visible — saves GPU while scrolling the rest of the
  page.

### Lifecycle / cleanup

The client component disposes the renderer, geometries, and materials and cancels the
animation frame on unmount, and disconnects the IntersectionObserver. Renderer uses
`alpha: true` (transparent background) and a capped `devicePixelRatio` (≤ 2) for
performance.

### Accessibility

- The SVG keeps its existing descriptive `aria-label`.
- The overlay canvas is `aria-hidden="true"` and not focusable (purely decorative).

## Non-goals (YAGNI)

- No rebuild of the hub, wires, or packets in 3D.
- No interactivity (hover/click) on the icons.
- No textured/realistic materials — wireframe holographic only.
- No React Three Fiber / drei.

## Testing / verification

- `npm run build` and `npm run lint` pass.
- Manual: run `npm run dev`, scroll to Section 03 — six glowing cyan 3D device icons
  appear exactly inside their chip circles, slowly rotating; layout matches at mobile
  and desktop widths.
- `prefers-reduced-motion` on → icons render static.
- Existing tests still pass (`npm test`).

## Open risks

- **Three.js + Next 16 / React 19**: must follow the Next 16 docs for client-component
  + dynamic `ssr: false` usage (per `AGENTS.md`). Verify three.js version resolves
  cleanly. Confirm at implementation time before writing the component.
- Coordinate mapping must be validated visually against the SVG chip positions.
