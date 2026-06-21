import type { GalaxyProps } from "@/visuals";

/**
 * Galaxy background tuning for the hero. Stars are a clean blue + white tone:
 * hueShift pins the colour to blue (~220°) and saturation sets how blue the
 * brighter stars get (dimmer ones stay white).
 */
export const heroGalaxyConfig: GalaxyProps = {
  mouseInteraction: false,
  mouseRepulsion: true,
  density: 1,
  glowIntensity: 0.3,
  saturation: 0.6,
  hueShift: 220,
  twinkleIntensity: 0.6,
  rotationSpeed: 0.05,
  repulsionStrength: 2,
  autoCenterRepulsion: 0,
  starSpeed: 0.5,
  speed: 1,
};

/** Hero ticker speed (seconds per loop). */
export const heroTickerSpeed = 45;
