"use client";

import type { CSSProperties } from "react";
import { useStrandsScene, type StrandsSceneOptions } from "./useStrandsScene";

export interface StrandsProps extends Partial<StrandsSceneOptions> {
  className?: string;
  style?: CSSProperties;
}

/**
 * Animated WebGL background of glowing wavy "strand" lines with an optional
 * glass refraction pass. Rendering lives in {@link useStrandsScene}.
 */
export function Strands({
  colors = ["#FF4242", "#7C3AED", "#06B6D4", "#EAB308"],
  count = 3,
  speed = 0.5,
  amplitude = 1,
  waviness = 1,
  thickness = 0.7,
  glow = 2.6,
  taper = 3,
  spread = 1,
  hueShift = 0,
  intensity = 0.6,
  saturation = 1.5,
  opacity = 1,
  scale = 1.5,
  glass = false,
  refraction = 1,
  dispersion = 1,
  glassSize = 1,
  className = "",
  style,
}: StrandsProps) {
  const ref = useStrandsScene({
    colors,
    count,
    speed,
    amplitude,
    waviness,
    thickness,
    glow,
    taper,
    spread,
    hueShift,
    intensity,
    saturation,
    opacity,
    scale,
    glass,
    refraction,
    dispersion,
    glassSize,
  });

  return (
    <div
      ref={ref}
      className={`relative h-full w-full bg-transparent ${className}`}
      style={style}
    />
  );
}
