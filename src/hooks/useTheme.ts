"use client";

import { useCallback, useSyncExternalStore } from "react";

// Read the active theme straight from the <html> `dark` class (set by the
// ThemeScript no-flash init and toggled below). useSyncExternalStore is the
// idiomatic way to subscribe to that external state — no setState-in-effect.
function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

const getSnapshot = () => document.documentElement.classList.contains("dark");
const getServerSnapshot = () => true; // layout defaults to the dark theme

/**
 * Theme state bound to the `dark` class on <html>. Returns whether dark mode is
 * active and a `toggle` that flips the class and persists the choice.
 */
export function useTheme() {
  const isDark = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const toggle = useCallback(() => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
  }, []);

  return { isDark, toggle };
}
