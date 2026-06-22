"use client";

import { useLayoutEffect, useState } from "react";
import { buildSCurvePath, type Pt } from "@/lib/geometry";
import { dockProgress } from "./projector";

interface Args {
  overlayRef: React.RefObject<HTMLDivElement | null>;
  stageRefs: React.MutableRefObject<(HTMLElement | null)[]>;
  mobile: boolean;
}

interface Result {
  pathD: string;
  size: { w: number; h: number };
  dockDistances: number[];
  dockProgresses: number[];
}

const SVG_NS = "http://www.w3.org/2000/svg";

/**
 * An off-screen, measurable SVG path for `d`, plus a `cleanup` to remove it.
 * We measure against a path we build from the freshly computed `d` string —
 * never the rendered `<path>`, whose `d` lags one React commit behind (on first
 * mount it is still empty, which would collapse every dock distance to 0% and
 * freeze the orb). Attached to a hidden `<svg>` so `getTotalLength` is reliable
 * across browsers.
 */
function makeMeasurablePath(d: string): { path: SVGPathElement; cleanup: () => void } {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("aria-hidden", "true");
  Object.assign(svg.style, {
    position: "absolute",
    width: "0",
    height: "0",
    left: "-9999px",
    top: "0",
    overflow: "hidden",
  });
  const path = document.createElementNS(SVG_NS, "path");
  path.setAttribute("d", d);
  svg.appendChild(path);
  document.body.appendChild(svg);
  return { path, cleanup: () => svg.remove() };
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

export function useProjectorPath({ overlayRef, stageRefs, mobile }: Args): Result {
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

      // Measure against a path built from this exact `pathD` — not the rendered
      // node, whose `d` is one commit stale (empty on first mount).
      const { path, cleanup } = makeMeasurablePath(pathD);
      const total = path.getTotalLength();
      const dockDistances =
        total > 0
          ? localPts.map((p) => distancePercentAt(path, p, total))
          : localPts.map((_, i) => (i / Math.max(1, localPts.length - 1)) * 100);
      cleanup();

      const dockProgresses = centerDocYs.map((y) =>
        dockProgress(y, containerTop, h, viewportH),
      );
      setResult({ pathD, size: { w, h }, dockDistances, dockProgresses });
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
