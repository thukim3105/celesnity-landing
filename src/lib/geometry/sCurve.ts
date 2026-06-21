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
