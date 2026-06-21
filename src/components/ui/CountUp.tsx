"use client";

import { useCountUp, type UseCountUpOptions } from "./useCountUp";

interface CountUpProps extends UseCountUpOptions {
  className?: string;
}

/** Animated number counter that springs to its value when scrolled into view. */
export function CountUp({ className = "", ...options }: CountUpProps) {
  const ref = useCountUp(options);
  return <span className={className} ref={ref} />;
}
