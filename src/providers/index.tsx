import type { ReactNode } from "react";
import { ThemeProvider } from "./ThemeProvider";
import { AnalyticsProvider } from "./AnalyticsProvider";

export { ThemeScript } from "./ThemeScript";
export { ThemeProvider } from "./ThemeProvider";
export { AnalyticsProvider } from "./AnalyticsProvider";

/**
 * Composes all global providers in one place so the root layout stays flat.
 * Add new providers here rather than nesting them in `layout.tsx`.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AnalyticsProvider>{children}</AnalyticsProvider>
    </ThemeProvider>
  );
}
