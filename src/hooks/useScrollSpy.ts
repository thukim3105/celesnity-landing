"use client";

import { useEffect, useState } from "react";
import type { Marker } from "@/types";

/**
 * Tracks which marker section is currently centred in the viewport via an
 * IntersectionObserver. Returns the active index plus a setter so callers can
 * optimistically update it on click (before the smooth-scroll settles).
 *
 * A section becomes active once its middle crosses the viewport centre
 * (rootMargin trims 45% off the top and bottom).
 */
export function useScrollSpy(markers: Marker[]) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const els = markers
      .map((m) => document.getElementById(m.id))
      .filter((el): el is HTMLElement => el !== null);
    if (!els.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = markers.findIndex((m) => m.id === entry.target.id);
            if (idx >= 0) setActive(idx);
          }
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [markers]);

  return { active, setActive };
}
