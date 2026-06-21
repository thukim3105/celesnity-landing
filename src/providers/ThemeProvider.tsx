"use client";

import type { ReactNode } from "react";

/**
 * ThemeProvider — placeholder for future centralised theme state.
 *
 * Today the theme is driven directly by the `dark` class on <html> (set by
 * {@link ThemeScript} and toggled in the Navbar via the `useTheme` hook). This
 * provider is intentionally a pass-through so a React context can be introduced
 * later without touching the component tree wiring.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
