"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useScroll, useTransform, useMotionValueEvent } from "motion/react";
import { Eyebrow } from "@/components/ui";
import { CheckIcon } from "@/components/ui/icons";
import { unnaFont, poppinsFont } from "@/constants";
import { useReducedMotion } from "@/hooks";
import { minderRoles, type MinderRole } from "./data";
import { VideoStage } from "./VideoStage";
import { ProjectorOrb } from "./ProjectorOrb";
import { useProjectorPath } from "./useProjectorPath";
import { activeIndexFromProgress } from "./projector";

function RolePanel({
  role,
  index,
  active,
  reducedMotion,
  stageRef,
}: {
  role: MinderRole;
  index: number;
  active: boolean;
  reducedMotion: boolean;
  stageRef: (el: HTMLElement | null) => void;
}) {
  const mediaRight = index % 2 === 0;
  return (
    <section id={role.id} className="flex min-h-svh items-center px-6 py-16 sm:py-24 snap-start">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 md:grid-cols-2 md:gap-16">
        <div className={mediaRight ? "md:order-1" : "md:order-2"}>
          <Eyebrow className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-brand shadow-[0_0_8px] shadow-brand/70" />
            {role.eyebrow}
          </Eyebrow>
          <h2 className="mt-4 text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl" style={unnaFont}>
            {role.heading.pre}
            {role.heading.em}
            {role.heading.post}
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg" style={poppinsFont}>
            {role.body}
          </p>
          <ul className="mt-8 flex flex-col gap-3.5" style={poppinsFont}>
            {role.points.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand/15 text-brand">
                  <CheckIcon className="h-3 w-3" />
                </span>
                <span className="text-sm text-white/80 sm:text-[15px]">{point}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className={`flex justify-center ${mediaRight ? "md:order-2 md:justify-end" : "md:order-1 md:justify-start"}`}>
          <VideoStage role={role} active={active} reducedMotion={reducedMotion} stageRef={stageRef} />
        </div>
      </div>
    </section>
  );
}

export function MinderRoles() {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const stageRefs = useRef<(HTMLElement | null)[]>([]);

  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const { pathD, size, dockDistances, dockProgresses } = useProjectorPath({
    overlayRef,
    stageRefs,
    mobile,
  });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Build a monotonic mapping: scroll progress -> offset-distance %.
  const { input, output } = useMemo(() => {
    if (dockProgresses.length === 0 || dockDistances.length === 0) {
      return { input: [0, 1], output: ["0%", "100%"] as string[] };
    }
    const inp = [0, ...dockProgresses, 1];
    const out = ["0%", ...dockDistances.map((d) => `${d}%`), "100%"];
    // Enforce strictly increasing input to satisfy useTransform.
    for (let i = 1; i < inp.length; i++) {
      if (inp[i] <= inp[i - 1]) inp[i] = inp[i - 1] + 0.0001;
    }
    return { input: inp, output: out };
  }, [dockProgresses, dockDistances]);

  const offsetDistance = useTransform(scrollYProgress, input, output);

  // Active panel + flash, derived from the same scroll progress.
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);
  const [flashing, setFlashing] = useState(false);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (dockProgresses.length === 0) return;
    const next = activeIndexFromProgress(p, dockProgresses, 0.16);
    if (next !== -1 && next !== activeIndexRef.current) {
      setActiveIndex(next);
      setFlashing(true);
      if (flashTimer.current) clearTimeout(flashTimer.current);
      flashTimer.current = setTimeout(() => setFlashing(false), 600);
    }
  });

  // Static fallback (no scroll events fire if reduced motion / SSR): use an
  // IntersectionObserver so every box still activates when scrolled into view.
  useEffect(() => {
    if (!reducedMotion) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const i = stageRefs.current.indexOf(e.target as HTMLElement);
            if (i >= 0) setActiveIndex(i);
          }
        });
      },
      { rootMargin: "-40% 0px -40% 0px" },
    );
    stageRefs.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, [reducedMotion]);

  return (
    <div ref={containerRef} className="relative">
      {/* Orb + trail overlay — spans the whole Minder section */}
      {!reducedMotion && (
        <div ref={overlayRef} className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
          <ProjectorOrb
            pathD={pathD}
            size={size}
            offsetDistance={offsetDistance}
            flashing={flashing}
            pathRef={pathRef}
          />
        </div>
      )}

      <div className="relative z-10">
        {minderRoles.map((role, i) => (
          <RolePanel
            key={role.id}
            role={role}
            index={i}
            active={i === activeIndex}
            reducedMotion={reducedMotion}
            stageRef={(el) => { stageRefs.current[i] = el; }}
          />
        ))}
      </div>
    </div>
  );
}
