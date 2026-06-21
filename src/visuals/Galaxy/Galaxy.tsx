"use client";

import { useGalaxyScene, type GalaxySceneOptions } from "./useGalaxyScene";

export interface GalaxyProps extends Partial<GalaxySceneOptions> {
  className?: string;
}

/**
 * Animated full-screen WebGL galaxy/starfield background (OGL). All rendering
 * lives in {@link useGalaxyScene}; this component only applies defaults and
 * renders the container.
 */
export function Galaxy({
  focal = [0.5, 0.5],
  rotation = [1.0, 0.0],
  starSpeed = 0.5,
  density = 1,
  hueShift = 140,
  disableAnimation = false,
  speed = 1.0,
  mouseInteraction = true,
  glowIntensity = 0.3,
  saturation = 0.0,
  mouseRepulsion = true,
  repulsionStrength = 2,
  twinkleIntensity = 0.3,
  rotationSpeed = 0.1,
  autoCenterRepulsion = 0,
  transparent = true,
  className,
}: GalaxyProps) {
  const ref = useGalaxyScene({
    focal,
    rotation,
    starSpeed,
    density,
    hueShift,
    disableAnimation,
    speed,
    mouseInteraction,
    glowIntensity,
    saturation,
    mouseRepulsion,
    repulsionStrength,
    twinkleIntensity,
    rotationSpeed,
    autoCenterRepulsion,
    transparent,
  });

  return <div ref={ref} className={`relative h-full w-full ${className ?? ""}`} />;
}
