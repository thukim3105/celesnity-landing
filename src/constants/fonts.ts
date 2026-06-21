import type { CSSProperties } from "react";

/**
 * Inline font-family style objects mapping to the CSS variables defined by
 * `next/font` in the root layout. Previously redefined ad-hoc in nearly every
 * component; centralised here so the wiring lives in one place.
 */
export const unnaFont: CSSProperties = { fontFamily: "var(--font-unna)" };
export const poppinsFont: CSSProperties = { fontFamily: "var(--font-poppins)" };
export const monoFont: CSSProperties = { fontFamily: "var(--font-geist-mono)" };
export const scriptFont: CSSProperties = { fontFamily: "var(--font-script)" };
export const playwriteFont: CSSProperties = {
  fontFamily: "var(--font-playwrite)",
};
