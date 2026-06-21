"use client";

import { useEffect, useRef } from "react";

/**
 * Fires `onAdvance` after `delay` ms while `enabled`, resetting the timer
 * whenever `resetKey` changes (e.g. the current step). The callback is read
 * from a ref so passing an inline function does not constantly reset the timer.
 */
export function useAutoAdvance(
  enabled: boolean,
  delay: number,
  onAdvance: () => void,
  resetKey: unknown,
) {
  const cb = useRef(onAdvance);
  useEffect(() => {
    cb.current = onAdvance;
  });

  useEffect(() => {
    if (!enabled) return;
    const timer = setTimeout(() => cb.current(), delay);
    return () => clearTimeout(timer);
  }, [enabled, delay, resetKey]);
}
