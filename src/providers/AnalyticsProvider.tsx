"use client";

import type { ReactNode } from "react";

/**
 * AnalyticsProvider — placeholder for a future analytics integration
 * (page-view + event tracking). Pass-through for now so wiring it up later is a
 * one-file change.
 */
export function AnalyticsProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
