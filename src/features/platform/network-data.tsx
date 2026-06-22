export type GraphNode = { label: string; x: number; y: number; root?: boolean };

// Shared viewBox dimensions for the network graph — consumed by the SVG and by
// the 3D icon overlay so both map into the same coordinate space.
export const VW = 1040;
export const VH = 460;

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
