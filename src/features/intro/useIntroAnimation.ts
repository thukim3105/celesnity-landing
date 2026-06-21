"use client";

import { useEffect, useRef, useState } from "react";
import { clamp01, easeInOut, easeInOutQuart } from "@/lib/animation/easing";
import { T_FLYREVEAL, T_HOLD, T_SWEEP } from "./constants";

/**
 * Drives the intro overlay: a spark sweeps across the screen revealing the
 * "Celesnity" wordmark in its wake, the word holds for a beat, then flies into
 * the navbar wordmark slot (#brand-wordmark) while the overlay fades to reveal
 * the page. Skippable on click; respects prefers-reduced-motion (skips
 * entirely). Returns the `show` flag, the element refs, and a skip handler.
 */
export function useIntroAnimation() {
  const [show, setShow] = useState(true);

  const overlayRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null); // centred word box (flown to logo)
  const streakRef = useRef<HTMLDivElement>(null); // the cross-screen spark

  // Click anywhere to skip — flipped by the skip handler, read in the loop.
  const skipRef = useRef(false);

  useEffect(() => {
    // Reduced motion: don't animate. The overlay itself is removed in the
    // component (see IntroOverlay) via useReducedMotion, so there is nothing to
    // tear down here.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const overlay = overlayRef.current;
    const wrap = wrapRef.current;
    const streak = streakRef.current;
    if (!overlay || !wrap || !streak) return;

    // The intro always plays from the hero, so start at the very top. Disabling
    // the browser's scroll restoration stops it from jumping back to a previous
    // position on refresh. A hash link is still honoured.
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    if (!window.location.hash) window.scrollTo(0, 0);

    // The spark sweeps straight across, along the word's vertical centre.
    const wordRect = wrap.getBoundingClientRect();
    const sweepY = wordRect.top + wordRect.height / 2;
    const sweepFromX = -0.15 * window.innerWidth;
    const sweepToX = 1.15 * window.innerWidth;

    // The word is uncovered left-to-right in the star's wake: a clip rectangle
    // that exposes the word only up to the star's current x.
    const setReveal = (frac: number) => {
      if (frac >= 1) {
        wrap.style.clipPath = "none";
        return;
      }
      wrap.style.clipPath = `inset(0 ${(1 - frac) * 100}% 0 0)`;
    };

    wrap.style.opacity = "1";
    setReveal(0);
    streak.style.opacity = "0";

    // Fly-to-logo transform, measured lazily at the start of the fly phase so the
    // navbar wordmark has settled (Unna font load can shift its width).
    let fly: { dx: number; dy: number; scale: number } | null = null;
    const measureFly = () => {
      const from = wrap.getBoundingClientRect();
      const to = document
        .getElementById("brand-wordmark")
        ?.getBoundingClientRect();
      // On narrow screens the navbar wordmark is hidden (display:none → zero
      // rect). With no valid target, fade the word out in place instead of
      // flying it into the top-left corner.
      if (!to || to.height === 0 || from.height === 0)
        return { dx: 0, dy: 0, scale: 1 };
      return {
        dx: to.left - from.left,
        dy: to.top - from.top,
        scale: to.height / from.height,
      };
    };
    const applyFly = (p: number) => {
      if (!fly) fly = measureFly();
      wrap.style.transformOrigin = "0 0";
      wrap.style.transform = `translate(${fly.dx * p}px, ${fly.dy * p}px) scale(${
        1 + (fly.scale - 1) * p
      })`;
      // Dim the celestial glow as it arrives, so the landed word matches the
      // plain navbar wordmark underneath and the cross-fade is seamless.
      const g = 1 - p;
      wrap.style.textShadow = `0 0 ${8 * g}px rgba(0,191,255,${0.55 * g}), 0 0 ${
        24 * g
      }px rgba(0,102,255,${0.45 * g}), 0 0 ${48 * g}px rgba(0,102,255,${0.3 * g})`;
    };

    // Phase boundaries (cumulative ms).
    const P1 = T_SWEEP;
    const P2 = P1 + T_HOLD;
    const END = P2 + T_FLYREVEAL;

    let raf = 0;
    let t0 = 0;
    let revealed = false;

    const frame = (now: number) => {
      if (!t0) t0 = now;
      let t = now - t0;
      if (skipRef.current) t = END; // a click jumps straight to the finished state

      if (t < P1) {
        // 1 — the star crosses; the word is uncovered exactly up to the star's x.
        const tt = t / T_SWEEP;
        const x = sweepFromX + (sweepToX - sweepFromX) * easeInOut(tt);
        streak.style.opacity = "1";
        streak.style.transform = `translate(${x}px, ${sweepY}px) translate(-50%, -50%)`;
        setReveal(clamp01((x - wordRect.left) / wordRect.width));
      } else if (t < P2) {
        // 2 — hold the finished wordmark for a beat; the star has left the screen.
        streak.style.opacity = "0";
        setReveal(1);
      } else if (t < END) {
        // 3 — the word flies to the navbar wordmark slot AND the overlay reveals
        // the page in the same beat.
        const p = (t - P2) / T_FLYREVEAL;
        applyFly(easeInOutQuart(p));
        if (!revealed) {
          revealed = true;
          if (!window.location.hash) window.scrollTo(0, 0);
        }
        overlay.style.opacity = `${1 - Math.pow(p, 3)}`;
      } else {
        setShow(false);
        return;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    // Safety net: guarantee the overlay tears down even if rAF stalls (e.g. the
    // tab is backgrounded mid-intro), so it can never linger and block the page.
    const safety = window.setTimeout(() => setShow(false), END + 800);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(safety);
    };
  }, []);

  const onSkip = () => {
    skipRef.current = true;
  };

  return { show, overlayRef, wrapRef, streakRef, onSkip };
}
