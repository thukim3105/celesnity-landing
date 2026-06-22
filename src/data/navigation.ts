import type { Language, MenuItem } from "@/types";

/** Top-nav menu. Entries with `items` render as dropdowns. */
export const menu: MenuItem[] = [
  // Home / hero. Links to "/" (not "/#sec-hero") because the hero is the top of
  // the page anyway — a cross-route "/#hash" link makes Next's App Router emit a
  // duplicated fragment (e.g. "/#sec-hero#sec-hero") when returning from another
  // route. The scroll-spy still lights this item via the sec-hero HOME_MARKER.
  { label: "About Us", href: "/" },
  { label: "Minder AI", href: "/minder-ai" },
  { label: "Solutions", items: ["Manufacturing", "Logistics", "Energy"] },
  { label: "Resources", items: ["Blog", "Case Studies", "Guides", "Glossary"] },
  { label: "Contact", href: "/coming-soon?from=Contact", comingSoon: true },
];

/** Selectable interface languages in the navbar. */
export const languages: Language[] = [
  { code: "EN", label: "English" },
  { code: "VI", label: "Tiếng Việt" },
  { code: "JA", label: "日本語" },
];
