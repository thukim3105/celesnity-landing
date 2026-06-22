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

/** A clean circle outline as a `LineSegments` geometry (pairs of points). Far
 *  crisper than a torus run through EdgesGeometry, which frays into spokes. */
function circleGeo(T: ThreeNS, radius: number, segments = 44): THREE.BufferGeometry {
  const pts: number[] = [];
  for (let i = 0; i < segments; i++) {
    const a0 = (i / segments) * Math.PI * 2;
    const a1 = ((i + 1) / segments) * Math.PI * 2;
    pts.push(Math.cos(a0) * radius, Math.sin(a0) * radius, 0);
    pts.push(Math.cos(a1) * radius, Math.sin(a1) * radius, 0);
  }
  return new T.BufferGeometry().setAttribute(
    "position",
    new T.Float32BufferAttribute(pts, 3),
  );
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

/** Add a crisp circle outline (lens, dial) to a group at an optional pose. */
function ring(
  T: ThreeNS,
  group: THREE.Group,
  radius: number,
  opts: { pos?: [number, number, number] } = {},
): void {
  for (const seg of linePair(T, circleGeo(T, radius))) {
    if (opts.pos) seg.position.set(opts.pos[0], opts.pos[1], opts.pos[2]);
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
  ring(T, g, 0.5, { pos: [-0.62, 0, 0] }); // left lens
  ring(T, g, 0.5, { pos: [0.62, 0, 0] }); // right lens
  part(T, g, new T.BoxGeometry(0.42, 0.05, 0.05), { pos: [0, 0.06, 0] }); // bridge
  part(T, g, new T.BoxGeometry(0.06, 0.06, 0.85), { pos: [-1.05, 0.05, -0.42] }); // left temple
  part(T, g, new T.BoxGeometry(0.06, 0.06, 0.85), { pos: [1.05, 0.05, -0.42] }); // right temple
  return g;
}

function wearables(T: ThreeNS): THREE.Group {
  const g = new T.Group();
  part(T, g, new T.BoxGeometry(0.95, 1.05, 0.18)); // watch case
  ring(T, g, 0.32, { pos: [0, 0, 0.1] }); // dial bezel on the face
  part(T, g, new T.BoxGeometry(0.1, 0.16, 0.1), { pos: [0.55, 0, 0] }); // crown
  part(T, g, new T.BoxGeometry(0.62, 0.78, 0.1), { pos: [0, 0.82, 0] }); // top strap
  part(T, g, new T.BoxGeometry(0.62, 0.78, 0.1), { pos: [0, -0.82, 0] }); // bottom strap
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
