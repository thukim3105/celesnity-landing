import type { ReactNode } from "react";

export type GraphNode = { label: string; x: number; y: number; root?: boolean };

// Coordinates live in the viewBox space (1040 × 460) — wide and short so the
// whole graph sits under the heading on one screen. MINDER AI is the single hub
// at the centre; the six device endpoints are scattered around it.
export const NODES: Record<string, GraphNode> = {
  minder: { label: "MINDER AI", x: 520, y: 235, root: true },
  laptop: { label: "Laptop", x: 140, y: 115 },
  tablet: { label: "Tablet", x: 470, y: 75 },
  smartglasses: { label: "Smart Glasses", x: 880, y: 110 },
  mobile: { label: "Mobile", x: 120, y: 340 },
  desktop: { label: "Desktop", x: 500, y: 388 },
  wearables: { label: "Wearables", x: 905, y: 355 },
};

// Every device points at the hub: the path runs device → MINDER AI, so the
// glowing packets flow inward, toward MINDER AI.
export const EDGES: [string, string][] = [
  ["laptop", "minder"],
  ["tablet", "minder"],
  ["smartglasses", "minder"],
  ["mobile", "minder"],
  ["desktop", "minder"],
  ["wearables", "minder"],
];

// Line icons (24×24, stroke style) for each device chip — same visual language
// as the inline icons in the Navbar (thin rounded strokes, currentColor).
export const ICONS: Record<string, ReactNode> = {
  laptop: (
    <>
      <rect x="3" y="4" width="18" height="12" rx="1.6" />
      <path d="M1.5 19.5h21" />
    </>
  ),
  tablet: (
    <>
      <rect x="5" y="2.5" width="14" height="19" rx="2" />
      <path d="M12 18.5h.01" />
    </>
  ),
  smartglasses: (
    <>
      {/* Sleek one-piece AR visor with a nose notch + hinge ticks. */}
      <path d="M2 11.3C2 9.5 3.5 8 5.3 8h13.4C20.5 8 22 9.5 22 11.3c0 2-1.4 3.7-3.4 3.7h-2.5c-1 0-1.9-.6-2.3-1.5l-.3-.6c-.3-.6-.9-1-1.6-1h-.2c-.7 0-1.3.4-1.6 1l-.3.6c-.4.9-1.3 1.5-2.3 1.5H5.4C3.4 15 2 13.3 2 11.3Z" />
      <path d="M4.6 8.2 3.2 6.4" />
      <path d="M19.4 8.2 20.8 6.4" />
    </>
  ),
  mobile: (
    <>
      <rect x="7" y="2" width="10" height="20" rx="2.2" />
      <path d="M10.5 18.5h3" />
    </>
  ),
  desktop: (
    <>
      <rect x="2.5" y="3.5" width="19" height="13" rx="2" />
      <path d="M8.5 20.5h7" />
      <path d="M12 16.5v4" />
    </>
  ),
  wearables: (
    <>
      <rect x="7" y="7" width="10" height="10" rx="3" />
      <path d="M9 7.2 9.4 3.7A1.7 1.7 0 0 1 11.1 2.2h1.8A1.7 1.7 0 0 1 14.6 3.7L15 7.2" />
      <path d="M9 16.8 9.4 20.3A1.7 1.7 0 0 0 11.1 21.8h1.8a1.7 1.7 0 0 0 1.7-1.5L15 16.8" />
    </>
  ),
};
