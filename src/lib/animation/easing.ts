/** Shared easing helpers for hand-rolled rAF animations (no GSAP). */

/** Cubic ease-in-out. */
export const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** Gentler quart ease-in-out — accelerates and decelerates more softly. */
export const easeInOutQuart = (t: number) =>
  t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;

/** Cubic ease-out. */
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/** Clamp a value to the [0, 1] range. */
export const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
