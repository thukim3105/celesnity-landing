"use client";

import { useTheme } from "@/hooks";
import { MoonIcon, SunIcon } from "@/components/ui/icons";

/** Light/dark mode toggle button, bound to the `dark` class on <html>. */
export function ThemeToggle() {
  const { isDark, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle light and dark mode"
      className="grid h-11 w-11 place-items-center rounded-full border border-zinc-200/80 transition-colors hover:bg-zinc-900/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-transparent dark:border-white/10 dark:hover:bg-white/10"
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
