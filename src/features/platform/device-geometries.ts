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

/** Wrap a line-segments geometry as a bright cyan core plus a faint additive
 *  glow, returned as two `LineSegments`. */
function linePair(T: ThreeNS, geo: THREE.BufferGeometry): THREE.LineSegments[] {
  const core = new T.LineSegments(
    geo,
    new T.LineBasicMaterial({ color: CYAN, transparent: true, opacity: 0.95 }),
  );
  const glow = new T.LineSegments(
    geo,
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

/** Turn a solid geometry into a cyan edge outline plus a faint additive glow. */
function edgePair(T: ThreeNS, geo: THREE.BufferGeometry): THREE.LineSegments[] {
  const eg = new T.EdgesGeometry(geo, 25);
  geo.dispose();
  return linePair(T, eg);
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
  // Wayfarer-style: two soft-rectangular lenses, a bridge, thick temple arms.
  const g = new T.Group();
  part(T, g, new T.BoxGeometry(0.82, 0.56, 0.06), { pos: [-0.54, 0, 0] }); // left lens
  part(T, g, new T.BoxGeometry(0.82, 0.56, 0.06), { pos: [0.54, 0, 0] }); // right lens
  part(T, g, new T.BoxGeometry(0.3, 0.08, 0.06), { pos: [0, 0.16, 0] }); // bridge (brow)
  part(T, g, new T.BoxGeometry(0.09, 0.12, 0.82), { pos: [-0.96, 0.06, -0.4] }); // left temple
  part(T, g, new T.BoxGeometry(0.09, 0.12, 0.82), { pos: [0.96, 0.06, -0.4] }); // right temple
  return g;
}

function wearables(T: ThreeNS): THREE.Group {
  // Apple-Watch-style: rounded-square case + inset screen, side crown + button,
  // top and bottom straps.
  const g = new T.Group();
  part(T, g, new T.BoxGeometry(0.9, 1.0, 0.22)); // case
  part(T, g, new T.BoxGeometry(0.64, 0.74, 0.02), { pos: [0, 0, 0.12] }); // screen bezel
  part(T, g, new T.BoxGeometry(0.12, 0.16, 0.12), { pos: [0.51, 0.14, 0] }); // crown
  part(T, g, new T.BoxGeometry(0.06, 0.26, 0.1), { pos: [0.49, -0.16, 0] }); // side button
  part(T, g, new T.BoxGeometry(0.6, 0.72, 0.12), { pos: [0, 0.84, 0] }); // top strap
  part(T, g, new T.BoxGeometry(0.6, 0.72, 0.12), { pos: [0, -0.84, 0] }); // bottom strap
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
