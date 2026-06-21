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
