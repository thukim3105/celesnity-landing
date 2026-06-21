"use client";

import { useReducedMotion } from "@/hooks";
import { useIntroAnimation } from "./useIntroAnimation";

/**
 * Full-screen intro: a glowing spark flies across the screen and, in its wake,
 * the "Celesnity" wordmark fades up in the centre, then shrinks and flies into
 * the navbar's wordmark slot before the overlay fades out to reveal the hero.
 * Animation logic lives in {@link useIntroAnimation}.
 */
export function IntroOverlay() {
  const reduced = useReducedMotion();
  const { show, overlayRef, wrapRef, streakRef, onSkip } = useIntroAnimation();

  // Respect prefers-reduced-motion: skip the intro entirely (no animation).
  if (reduced || !show) return null;

  return (
    <div
      ref={overlayRef}
      onClick={onSkip}
      aria-hidden
      className="fixed inset-0 z-[60] grid place-items-center overflow-hidden bg-[#04091e]"
    >
      {/* Cross-screen spark — a bright beacon head with a trailing tail. */}
      <div
        ref={streakRef}
        className="pointer-events-none absolute left-0 top-0 mix-blend-screen"
        style={{ opacity: 0 }}
      >
        {/* Tail — a horizontal smear pointing back along the travel direction. */}
        <div
          className="absolute right-1 top-1/2 h-1 -translate-y-1/2 blur-[2px]"
          style={{
            width: 260,
            background:
              "linear-gradient(to left, rgba(255,255,255,0.9), rgba(0,191,255,0.5) 30%, transparent 100%)",
          }}
        />
        {/* Head — layered radial glow + a hot white core. */}
        <div
          className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full blur-md"
          style={{
            background:
              "radial-gradient(circle, rgba(0,191,255,0.65) 0%, rgba(0,102,255,0.25) 45%, transparent 72%)",
          }}
        />
        <div
          className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
          style={{
            boxShadow:
              "0 0 6px 2px #fff, 0 0 16px 6px rgba(0,191,255,0.95), 0 0 34px 14px rgba(0,102,255,0.6)",
          }}
        />
      </div>

      {/* The word — Unna (matching the navbar wordmark), centred, with a blue
          celestial glow. Flown to the logo at the end. */}
      <div
        ref={wrapRef}
        className="relative inline-block leading-none"
        style={{
          fontFamily: "var(--font-unna)",
          fontWeight: 700,
          fontSize: "clamp(3rem, 12vw, 9rem)",
          color: "#eaf6ff",
          textShadow:
            "0 0 8px rgba(0,191,255,0.55), 0 0 24px rgba(0,102,255,0.45), 0 0 48px rgba(0,102,255,0.3)",
          clipPath: "inset(0 100% 0 0)",
        }}
      >
        Celesnity
      </div>
    </div>
  );
}
