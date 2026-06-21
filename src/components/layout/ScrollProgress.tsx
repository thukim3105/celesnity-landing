"use client";

import { useScrollComet } from "@/hooks";
import type { Marker } from "@/types";

// Needle silhouette for the trail: full width at the base (head), curving
// inward to an extremely thin point at the tip.
const NEEDLE =
  "polygon(0% 100%, 30% 56%, 46% 20%, 50% 0%, 54% 20%, 70% 56%, 100% 100%)";

// Falling embers that drop off the head.
const FALL_SPARKS = [
  { left: "-7px", size: 3, duration: 1.6, delay: 0 },
  { left: "3px", size: 4, duration: 2.0, delay: 0.5 },
  { left: "-2px", size: 2.5, duration: 1.4, delay: 0.9 },
  { left: "8px", size: 3, duration: 2.2, delay: 1.3 },
];

/**
 * A glowing comet pinned to the left edge that falls down following the user's
 * scroll; its tail grows longer the closer you get to the bottom. `markers` are
 * the section anchors (the same array `SectionNav` uses) — the animation logic
 * lives in `useScrollComet`.
 */
export function ScrollProgress({ markers = [] }: { markers?: Marker[] }) {
  const { wrapRef, tailRef } = useScrollComet(markers);

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className="pointer-events-none fixed left-(--rail) top-0 z-20 h-0 mix-blend-screen"
    >
      {/* Luminous trail — thick bright base tapering to a needle-thin point */}
      <div ref={tailRef} className="absolute bottom-0 left-1/2 -translate-x-1/2">
        {/* Wide atmospheric haze (#0066FF) */}
        <div className="absolute bottom-0 left-1/2 h-full w-[72px] -translate-x-1/2 blur-lg">
          <div
            className="h-full w-full"
            style={{
              clipPath: NEEDLE,
              background:
                "linear-gradient(to top, rgba(0,102,255,0.32) 0%, rgba(0,102,255,0.1) 42%, transparent 86%)",
            }}
          />
        </div>
        {/* Cyan-blue glow (#00BFFF) */}
        <div className="absolute bottom-0 left-1/2 h-full w-[30px] -translate-x-1/2 blur-sm">
          <div
            className="h-full w-full"
            style={{
              clipPath: NEEDLE,
              background:
                "linear-gradient(to top, rgba(0,191,255,0.6) 0%, rgba(0,191,255,0.2) 46%, transparent 82%)",
            }}
          />
        </div>
        {/* Bright white spine — thick base, needle-thin tip */}
        <div className="absolute bottom-0 left-1/2 h-full w-2.5 -translate-x-1/2 blur-[0.5px]">
          <div
            className="h-full w-full"
            style={{
              clipPath: NEEDLE,
              background:
                "linear-gradient(to top, rgba(255,255,255,0.98) 0%, rgba(0,191,255,0.6) 30%, rgba(0,102,255,0.3) 55%, transparent 82%)",
            }}
          />
        </div>
      </div>

      {/* Falling embers — break off the head and drop, selling the fall */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
        {FALL_SPARKS.map((s, i) => (
          <span
            key={i}
            className="comet-fall-spark absolute bottom-0 rounded-full bg-white blur-[0.5px]"
            style={{
              left: s.left,
              width: s.size,
              height: s.size,
              boxShadow: "0 0 6px 2px rgba(0,191,255,0.9)",
              animation: `comet-fall-spark ${s.duration}s ease-in ${s.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Celestial beacon head — eight-ray blue-white lens flare */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
        <div
          className="comet-twinkle comet-flicker relative h-0 w-0"
          style={{
            animation:
              "comet-twinkle 3s ease-in-out infinite, comet-flicker 4.5s ease-in-out infinite",
          }}
        >
          {/* Layer 1 — large diffused outer-blue halo (#0066FF) */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
            style={{
              width: 200,
              height: 200,
              background:
                "radial-gradient(circle, rgba(0,102,255,0.42) 0%, rgba(0,102,255,0.16) 45%, transparent 72%)",
            }}
          />
          {/* Layer 2 — cyan-blue glow (#00BFFF) */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl"
            style={{
              width: 96,
              height: 96,
              background:
                "radial-gradient(circle, rgba(0,191,255,0.7) 0%, rgba(0,191,255,0.3) 45%, transparent 72%)",
            }}
          />
          {/* Layer 3 — inner white glow */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-md"
            style={{
              width: 38,
              height: 38,
              background:
                "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(0,191,255,0.55) 55%, transparent 78%)",
            }}
          />

          {/* Secondary diagonal ray — 45° / 225° (softly glowing blue) */}
          <div
            className="absolute left-1/2 top-1/2 blur-[0.5px]"
            style={{
              width: 4,
              height: 78,
              transform: "translate(-50%, -50%) rotate(45deg)",
              clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
              background:
                "linear-gradient(to bottom, transparent 0%, rgba(0,191,255,0.4) 40%, rgba(0,191,255,0.75) 50%, rgba(0,191,255,0.4) 60%, transparent 100%)",
            }}
          />
          {/* Secondary diagonal ray — 135° / 315° */}
          <div
            className="absolute left-1/2 top-1/2 blur-[0.5px]"
            style={{
              width: 4,
              height: 78,
              transform: "translate(-50%, -50%) rotate(-45deg)",
              clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
              background:
                "linear-gradient(to bottom, transparent 0%, rgba(0,191,255,0.4) 40%, rgba(0,191,255,0.75) 50%, rgba(0,191,255,0.4) 60%, transparent 100%)",
            }}
          />

          {/* Primary horizontal ray — slightly shorter than vertical */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 blur-[0.5px]"
            style={{
              width: 150,
              height: 5,
              clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
              background:
                "linear-gradient(to right, transparent 0%, rgba(0,102,255,0.45) 26%, rgba(0,191,255,0.85) 44%, #ffffff 50%, rgba(0,191,255,0.85) 56%, rgba(0,102,255,0.45) 74%, transparent 100%)",
            }}
          />
          {/* Primary vertical ray — longest, extremely thin and sharp */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 blur-[0.5px]"
            style={{
              width: 5,
              height: 220,
              clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
              background:
                "linear-gradient(to bottom, transparent 0%, rgba(0,102,255,0.45) 24%, rgba(0,191,255,0.85) 43%, #ffffff 50%, rgba(0,191,255,0.85) 57%, rgba(0,102,255,0.45) 76%, transparent 100%)",
            }}
          />

          {/* Core — tiny, intensely bright white diamond (brightest point) */}
          <div
            className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-white"
            style={{
              boxShadow:
                "0 0 6px 2px #ffffff, 0 0 14px 5px rgba(0,191,255,0.95), 0 0 30px 12px rgba(0,102,255,0.6)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
