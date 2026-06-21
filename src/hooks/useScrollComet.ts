"use client";

import { useEffect, useRef } from "react";
import { COMET_SPAN_RATIO, COMET_TOP_RATIO } from "@/constants";
import type { Marker } from "@/types";

/**
 * The small-viewport height (100svh) in pixels. Unlike `window.innerHeight`, svh
 * does NOT change as the mobile URL bar shows/hides, so basing the comet's
 * vertical travel on it keeps the head from jumping (and the glow flashing) while
 * scrolling. It also matches the `svh` units the star rail (SectionNav) uses, so
 * head + stars stay aligned.
 */
function measureSvh(): number {
  if (typeof document === "undefined") return 0;
  const probe = document.createElement("div");
  probe.style.cssText =
    "position:fixed;top:0;left:0;width:0;height:100svh;visibility:hidden;pointer-events:none";
  document.body.appendChild(probe);
  const h = probe.offsetHeight;
  probe.remove();
  return h || window.innerHeight;
}

/**
 * Drives the scroll-comet: maps the scroll position to the comet head's Y
 * offset and trail length, eased with a hand-rolled rAF lerp loop, writing
 * directly to the wrap transform and tail height.
 *
 * The head is mapped to EVEN steps between section markers: when section `i` is
 * centred, the head sits at fraction `i/(n-1)` — exactly where its evenly-spaced
 * star is — and interpolates linearly between section centres, so it tracks the
 * active star regardless of how tall each section is.
 *
 * Returns the refs to attach to the comet wrapper and its tail element.
 */
export function useScrollComet(markers: Marker[]) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const tailRef = useRef<HTMLDivElement>(null);
  const stopsRef = useRef<{ scroll: number; frac: number }[]>([]);
  // Stable svh height (px) for the comet's vertical travel — see measureSvh.
  const vhRef = useRef(0);

  useEffect(() => {
    const wrap = wrapRef.current;
    const tail = tailRef.current;
    if (!wrap || !tail) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ease = reduce ? 1 : 0.08; // 1 = snap instantly, lower = more trailing

    let targetY = 0;
    let currentY = 0;
    let targetLen = 0;
    let currentLen = 0;
    let raf = 0;

    // Scroll position at which each section is centred, paired with its even
    // fraction. Clamped to the scrollable range and kept ascending.
    const measure = () => {
      vhRef.current = measureSvh();
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const vh = window.innerHeight;
      const last = markers.length - 1;
      stopsRef.current = markers.map((m, i) => {
        const el = document.getElementById(m.id);
        const frac = last > 0 ? i / last : 0;
        if (!el || max <= 0) return { scroll: frac * Math.max(max, 0), frac };
        const absTop = el.getBoundingClientRect().top + window.scrollY;
        const center = absTop + el.offsetHeight / 2 - vh / 2;
        return { scroll: Math.min(Math.max(center, 0), max), frac };
      });
    };

    const evenFraction = (scrollY: number) => {
      const stops = stopsRef.current;
      if (!stops.length) return 0;
      if (scrollY <= stops[0].scroll) return stops[0].frac;
      const lastStop = stops[stops.length - 1];
      if (scrollY >= lastStop.scroll) return lastStop.frac;
      for (let k = 0; k < stops.length - 1; k++) {
        const a = stops[k];
        const b = stops[k + 1];
        if (scrollY >= a.scroll && scrollY <= b.scroll) {
          const denom = b.scroll - a.scroll;
          const t = denom > 0 ? (scrollY - a.scroll) / denom : 1;
          return a.frac + t * (b.frac - a.frac);
        }
      }
      return lastStop.frac;
    };

    const compute = () => {
      const frac = evenFraction(window.scrollY);
      // Use the stable svh height (not the live innerHeight, which changes as the
      // mobile URL bar slides) so the head doesn't jump/flash while scrolling.
      const vh = vhRef.current || window.innerHeight;
      // Head travels from the top toward the bottom of the viewport.
      targetY = (COMET_TOP_RATIO + frac * COMET_SPAN_RATIO) * vh;
      // Trail grows from short to long as we approach the end of the page.
      targetLen = 120 + frac * vh * 0.95;
    };

    const tick = () => {
      currentY += (targetY - currentY) * ease;
      currentLen += (targetLen - currentLen) * ease;
      wrap.style.transform = `translateY(${currentY}px)`;
      tail.style.height = `${currentLen}px`;
      raf = requestAnimationFrame(tick);
    };

    const onScroll = () => compute();
    const onResize = () => {
      measure();
      compute();
    };

    measure();
    compute();
    currentY = targetY;
    currentLen = targetLen;
    // Re-measure once layout/fonts settle so the stops are accurate.
    const settle = window.setTimeout(() => {
      measure();
      compute();
    }, 500);

    // Layout height can change after load (fonts, the auto-advancing stepper in
    // section 05, etc.), shifting section centres — re-measure when it does.
    const ro = new ResizeObserver(() => {
      measure();
      compute();
    });
    ro.observe(document.body);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(settle);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [markers]);

  return { wrapRef, tailRef };
}
