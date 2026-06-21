"use client";

import { COMET_SPAN_RATIO, COMET_TOP_RATIO } from "@/constants";
import { useScrollSpy } from "@/hooks";
import type { Marker } from "@/types";

const STAR_CLIP =
  "polygon(50% 0%, 61% 39%, 100% 50%, 61% 61%, 50% 100%, 39% 61%, 0% 50%, 39% 39%)";

/**
 * Smooth-scroll to an absolute Y, temporarily suspending scroll-snap.
 *
 * `html` carries `scroll-snap-type: y proximity`. On mobile, where sections can
 * be taller than the viewport, the snap engine interrupts a programmatic smooth
 * scroll mid-flight and yanks the page back to the snap point it started from —
 * so tapping a star "jumps there, then back". Disabling snap for the duration of
 * the scroll and restoring it once the scroll settles (scrollend, with a timeout
 * fallback for browsers without it) lets the navigation land cleanly.
 */
function smoothScrollTo(top: number) {
  const html = document.documentElement;
  const max = html.scrollHeight - window.innerHeight;
  const target = Math.min(Math.max(top, 0), Math.max(max, 0));

  const prevSnap = html.style.scrollSnapType;
  html.style.scrollSnapType = "none";

  let restored = false;
  const restore = () => {
    if (restored) return;
    restored = true;
    html.style.scrollSnapType = prevSnap;
    window.removeEventListener("scrollend", restore);
  };
  window.addEventListener("scrollend", restore, { once: true });
  window.setTimeout(restore, 1200);

  window.scrollTo({ top: target, behavior: "smooth" });
}

/** Smooth-scroll to a section, landing it where its content reads best. */
function goToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const absTop = el.getBoundingClientRect().top + window.scrollY;
  // 01 (tall Strands visual below the text), 03 and 05 (top buffer clears the
  // navbar) land at their top; every other section centres.
  const landAtTop = id === "sec-01" || id === "sec-03" || id === "sec-05";
  const top = landAtTop
    ? absTop
    : absTop + el.offsetHeight / 2 - window.innerHeight / 2;
  smoothScrollTo(top);
}

/**
 * Fixed left-rail scroll-spy navigation: star-shaped markers spaced evenly down
 * the rail (matching the comet head's path), highlighting the active section.
 */
export function SectionNav({ markers }: { markers: Marker[] }) {
  const { active, setActive } = useScrollSpy(markers);
  const last = markers.length - 1;

  return (
    <nav
      aria-label="Section navigation"
      className="pointer-events-none fixed inset-y-0 left-(--rail) z-30"
    >
      {markers.map((m, i) => {
        const isActive = i === active;
        // Stars are spaced evenly down the rail; the comet head is mapped to the
        // same even steps (see ScrollProgress) so it stays on the active star.
        const progress = last > 0 ? i / last : 0;
        const ratio = COMET_TOP_RATIO + progress * COMET_SPAN_RATIO;
        // `svh` (small viewport height) is stable — it does NOT change as the
        // mobile URL bar shows/hides — so the star rail never shifts while
        // scrolling. The comet head uses the same svh reference (useScrollComet)
        // so head + star stay coincident on every device.
        const top = `${ratio * 100}svh`;

        return (
          <button
            key={m.id}
            type="button"
            onClick={() => {
              setActive(i);
              goToSection(m.id);
            }}
            aria-label={m.label}
            aria-current={isActive ? "true" : undefined}
            className="group pointer-events-auto absolute left-0 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-brand-deep"
            style={{ top }}
          >
            {/* Hover label */}
            <span
              className="pointer-events-none absolute left-8 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-white/10 px-2 py-1 text-xs tracking-wide text-white opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100"
              style={{ fontFamily: "var(--font-poppins)" }}
            >
              {m.label}
            </span>

            {/* Sparkle star marker */}
            <span
              aria-hidden
              className="comet-twinkle block transition-all duration-300"
              style={{
                width: isActive ? 16 : 10,
                height: isActive ? 16 : 10,
                clipPath: STAR_CLIP,
                background:
                  "radial-gradient(circle, #ffffff 0%, #bae6fd 45%, #00BFFF 100%)",
                opacity: isActive ? 1 : 0.4,
                filter: isActive
                  ? "drop-shadow(0 0 5px #ffffff) drop-shadow(0 0 12px #00BFFF)"
                  : "drop-shadow(0 0 3px rgba(0,191,255,0.55))",
                animation: `comet-twinkle ${
                  2.4 + (i % 3) * 0.5
                }s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          </button>
        );
      })}
    </nav>
  );
}
