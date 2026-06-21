"use client";

import type { CSSProperties, ReactNode } from "react";
import { hexToRgba } from "@/lib/color";
import { useElectricBorder } from "./useElectricBorder";

interface ElectricBorderProps {
  children?: ReactNode;
  color?: string;
  speed?: number;
  chaos?: number;
  borderRadius?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * Wraps children in an animated "electric" lightning border (canvas-drawn
 * noise-displaced rounded rectangle) plus layered CSS blur glow. The canvas
 * animation lives in {@link useElectricBorder}.
 */
export function ElectricBorder({
  children,
  color = "#5227FF",
  speed = 1,
  chaos = 0.12,
  borderRadius = 24,
  className,
  style,
}: ElectricBorderProps) {
  const { containerRef, canvasRef } = useElectricBorder({
    color,
    speed,
    chaos,
    borderRadius,
  });

  return (
    <div
      ref={containerRef}
      className={`relative overflow-visible isolate ${className ?? ""}`}
      style={
        {
          "--electric-border-color": color,
          borderRadius,
          ...style,
        } as CSSProperties
      }
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[2]">
        <canvas ref={canvasRef} className="block" />
      </div>
      <div className="absolute inset-0 rounded-[inherit] pointer-events-none z-0">
        <div
          className="absolute inset-0 rounded-[inherit] pointer-events-none"
          style={{ border: `2px solid ${hexToRgba(color, 0.6)}`, filter: "blur(1px)" }}
        />
        <div
          className="absolute inset-0 rounded-[inherit] pointer-events-none"
          style={{ border: `2px solid ${color}`, filter: "blur(4px)" }}
        />
        <div
          className="absolute inset-0 rounded-[inherit] pointer-events-none -z-[1] scale-110 opacity-30"
          style={{
            filter: "blur(32px)",
            background: `linear-gradient(-30deg, ${color}, transparent, ${color})`,
          }}
        />
      </div>
      <div className="relative rounded-[inherit] z-[1]">{children}</div>
    </div>
  );
}
