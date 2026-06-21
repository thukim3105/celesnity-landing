import { describe, it, expect } from "vitest";
import { buildSCurvePath } from "./sCurve";

describe("buildSCurvePath", () => {
  it("returns empty string for no points", () => {
    expect(buildSCurvePath([])).toBe("");
  });

  it("draws tails above and below a single point", () => {
    expect(buildSCurvePath([{ x: 100, y: 200 }], 80)).toBe(
      "M 100 120 L 100 200 L 100 280",
    );
  });

  it("connects two points with a vertical-tangent cubic bézier", () => {
    const d = buildSCurvePath([{ x: 100, y: 100 }, { x: 300, y: 500 }], 50, 0.5);
    // start tail
    expect(d.startsWith("M 100 50 L 100 100")).toBe(true);
    // cubic with control handles offset by (500-100)*0.5 = 200 in y
    expect(d).toContain("C 100 300 300 300 300 500");
    // end tail
    expect(d.endsWith("L 300 550")).toBe(true);
  });
});
