"use client";

// Solar-system style orbit: each item rides its OWN concentric elliptical orbit
// (inner orbits move faster, like real planets), with a faint ring drawn under
// every orbit. Built on the `motion` library + CSS offset-path.

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { ellipsePath } from "@/lib/geometry";

interface SolarOrbitProps {
  items: ReactNode[];
  centerContent?: ReactNode;
  baseWidth?: number;
  /** Container aspect ratio (CSS value). */
  aspect?: string;
  /** Global tilt of the whole system, in degrees. */
  rotation?: number;
  /** Horizontal radius of the innermost orbit (design units). */
  innerRx?: number;
  /** How much each successive orbit grows outward (design units). */
  ringGap?: number;
  /** Vertical/horizontal radius ratio — < 1 flattens orbits into ellipses. */
  ratio?: number;
  /** Seconds for one revolution of the innermost orbit. */
  baseDuration?: number;
  /** Extra seconds added per orbit moving outward. */
  durationStep?: number;
  ringColor?: string;
  ringWidth?: number;
  paused?: boolean;
  className?: string;
}

interface PlanetProps {
  item: ReactNode;
  path: string;
  duration: number;
  phase: number;
  rotation: number;
  paused: boolean;
}

function Planet({ item, path, duration, phase, rotation, paused }: PlanetProps) {
  const progress = useMotionValue(phase);
  const offsetDistance = useTransform(
    progress,
    (p: number) => `${(((p % 100) + 100) % 100)}%`,
  );

  useEffect(() => {
    if (paused) return;
    // Loop phase -> phase+100; since offsetDistance is taken mod 100, the wrap
    // is seamless (same point on the ellipse), giving continuous motion.
    const controls = animate(progress, phase + 100, {
      duration,
      ease: "linear",
      repeat: Infinity,
      repeatType: "loop",
    });
    return () => controls.stop();
  }, [progress, duration, phase, paused]);

  return (
    <motion.div
      className="absolute will-change-transform select-none"
      style={{
        width: "max-content",
        height: "auto",
        offsetPath: `path("${path}")`,
        offsetRotate: "0deg",
        offsetAnchor: "center center",
        offsetDistance,
      }}
    >
      {/* Counter-rotate so chips stay upright despite the global tilt. */}
      <div style={{ transform: `rotate(${-rotation}deg)` }}>{item}</div>
    </motion.div>
  );
}

export function SolarOrbit({
  items,
  centerContent,
  baseWidth = 2400,
  aspect = "1 / 1",
  rotation = -14,
  innerRx = 540,
  ringGap = 96,
  ratio = 0.5,
  baseDuration = 30,
  durationStep = 0,
  ringColor = "79, 195, 255",
  ringWidth = 1.5,
  paused = false,
  className = "",
}: SolarOrbitProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(null);

  const cx = baseWidth / 2;
  const cy = baseWidth / 2;

  // One ring per item, growing outward. Inner orbits are faster; phases are
  // spread with the golden angle so planets never line up.
  const rings = useMemo(
    () =>
      items.map((_, i) => {
        const rx = innerRx + i * ringGap;
        const ry = rx * ratio;
        return {
          rx,
          ry,
          path: ellipsePath(cx, cy, rx, ry),
          duration: baseDuration + i * durationStep,
          phase: (i * 137.508) % 100,
          // Outer rings fade out a little for depth.
          alpha: Math.max(0.05, 0.2 - i * 0.018),
        };
      }),
    [items, innerRx, ringGap, ratio, baseDuration, durationStep, cx, cy],
  );

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / baseWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [baseWidth]);

  // Stop the orbit animations while section 04 is off-screen.
  const [onScreen, setOnScreen] = useState(true);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => setOnScreen(entries[0]?.isIntersecting ?? true),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative mx-auto ${className}`}
      style={{ width: "100%", aspectRatio: aspect }}
      aria-hidden="true"
    >
      <div
        className="absolute left-1/2 top-1/2"
        style={{
          width: baseWidth,
          height: baseWidth,
          transform:
            scale !== null ? `translate(-50%, -50%) scale(${scale})` : undefined,
          visibility: scale === null ? "hidden" : undefined,
          transformOrigin: "center center",
        }}
      >
        <div
          className="relative h-full w-full"
          style={{
            transform: `rotate(${rotation}deg)`,
            transformOrigin: "center center",
          }}
        >
          {/* Faint orbit rings */}
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${baseWidth} ${baseWidth}`}
            className="pointer-events-none absolute inset-0"
          >
            {rings.map((ring, i) => (
              <ellipse
                key={i}
                cx={cx}
                cy={cy}
                rx={ring.rx}
                ry={ring.ry}
                fill="none"
                stroke={`rgba(${ringColor}, ${ring.alpha})`}
                strokeWidth={ringWidth}
              />
            ))}
          </svg>

          {/* Planets — one per orbit */}
          {rings.map((ring, i) => (
            <Planet
              key={i}
              item={items[i]}
              path={ring.path}
              duration={ring.duration}
              phase={ring.phase}
              rotation={rotation}
              paused={paused || !onScreen}
            />
          ))}
        </div>
      </div>

      {/* Center "sun" — soft glow + the supplied content, kept upright. */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: "55%",
          height: "55%",
          background:
            "radial-gradient(circle, rgba(79,195,255,0.18) 0%, rgba(79,195,255,0.05) 38%, transparent 70%)",
        }}
      />
      {centerContent && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          {centerContent}
        </div>
      )}
    </div>
  );
}
