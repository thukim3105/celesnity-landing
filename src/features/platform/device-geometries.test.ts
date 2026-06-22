import { describe, it, expect } from "vitest";
import * as THREE from "three";
import { buildDeviceGroup, DEVICE_KEYS } from "./device-geometries";

describe("buildDeviceGroup", () => {
  it("exposes the six device keys", () => {
    expect([...DEVICE_KEYS].sort()).toEqual(
      ["desktop", "laptop", "mobile", "smartglasses", "tablet", "wearables"],
    );
  });

  it.each([...DEVICE_KEYS])("builds a non-empty line group for %s", (key) => {
    const g = buildDeviceGroup(THREE, key);
    expect(g.type).toBe("Group");
    expect(g.children.length).toBeGreaterThan(0);
    for (const child of g.children) {
      const seg = child as THREE.LineSegments;
      expect(seg.isLineSegments).toBe(true);
      expect(seg.geometry.getAttribute("position").count).toBeGreaterThan(0);
    }
  });

  it("normalizes laptop to roughly unit size, centred near origin", () => {
    const g = buildDeviceGroup(THREE, "laptop");
    const box = new THREE.Box3().setFromObject(g);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    expect(Math.max(size.x, size.y, size.z)).toBeLessThanOrEqual(1.2);
    expect(center.length()).toBeLessThan(0.25);
  });
});
