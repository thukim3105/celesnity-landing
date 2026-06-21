import { describe, it, expect } from "vitest";
import { activeIndexFromProgress, dockProgress } from "./projector";

describe("activeIndexFromProgress", () => {
  const docks = [0.1, 0.5, 0.9];
  it("picks the nearest dock within the band", () => {
    expect(activeIndexFromProgress(0.52, docks, 0.18)).toBe(1);
    expect(activeIndexFromProgress(0.08, docks, 0.18)).toBe(0);
  });
  it("returns -1 when no dock is within the band", () => {
    expect(activeIndexFromProgress(0.3, docks, 0.05)).toBe(-1);
  });
});

describe("dockProgress", () => {
  it("maps a panel centre to its centred scroll progress", () => {
    // container 3000 tall, viewport 1000 -> scrollable 2000.
    // a centre at docY 1500 centres when scrollY = 1500 - 500 = 1000 -> 0.5
    expect(dockProgress(1500, 0, 3000, 1000)).toBeCloseTo(0.5, 5);
  });
  it("clamps to 0..1", () => {
    expect(dockProgress(0, 0, 3000, 1000)).toBe(0);
    expect(dockProgress(99999, 0, 3000, 1000)).toBe(1);
  });
  it("returns 0 when not scrollable", () => {
    expect(dockProgress(500, 0, 800, 1000)).toBe(0);
  });
});
