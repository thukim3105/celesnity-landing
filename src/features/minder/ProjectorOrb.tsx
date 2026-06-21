"use client";

import { motion, type MotionValue } from "motion/react";

/** The beacon orb (reuses the ScrollProgress aesthetic) + its glowing trail. */
export function ProjectorOrb({
  pathD,
  size,
  offsetDistance,
  flashing,
  pathRef,
}: {
  pathD: string;
  size: { w: number; h: number };
  offsetDistance: MotionValue<string>;
  flashing: boolean;
  pathRef: React.Ref<SVGPathElement>;
}) {
  if (!pathD) {
    // Render the measuring path even before sizing, so the hook can read it.
    return (
      <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
        <path ref={pathRef} d={pathD} fill="none" />
      </svg>
    );
  }

  return (
    <>
      {/* Faint always-visible S-curve trail */}
      <svg
        className="absolute inset-0"
        width={size.w}
        height={size.h}
        viewBox={`0 0 ${size.w} ${size.h}`}
        fill="none"
        aria-hidden="true"
      >
        <path d={pathD} stroke="rgba(79,195,255,0.16)" strokeWidth={2} />
        <path
          ref={pathRef}
          d={pathD}
          stroke="rgba(79,195,255,0.5)"
          strokeWidth={1}
          style={{ filter: "drop-shadow(0 0 4px rgba(0,191,255,0.6))" }}
        />
      </svg>

      {/* The orb */}
      <motion.div
        className="absolute left-0 top-0 will-change-transform"
        style={{
          offsetPath: `path("${pathD}")`,
          offsetRotate: "0deg",
          offsetAnchor: "center center",
          offsetDistance,
        }}
        aria-hidden="true"
      >
        <motion.div
          className="relative h-0 w-0"
          animate={{ scale: flashing ? 2.4 : 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 18 }}
        >
          {/* outer blue halo */}
          <div className="absolute left-1/2 top-1/2 h-[120px] w-[120px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
            style={{ background: "radial-gradient(circle, rgba(0,102,255,0.4) 0%, rgba(0,102,255,0.14) 45%, transparent 72%)" }} />
          {/* cyan glow */}
          <div className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full blur-md"
            style={{ background: "radial-gradient(circle, rgba(0,191,255,0.7) 0%, rgba(0,191,255,0.3) 45%, transparent 72%)" }} />
          {/* white core */}
          <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-white"
            style={{ boxShadow: "0 0 6px 2px #fff, 0 0 14px 5px rgba(0,191,255,0.95), 0 0 30px 12px rgba(0,102,255,0.6)" }} />
        </motion.div>
      </motion.div>
    </>
  );
}
