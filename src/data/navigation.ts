import type { Language, MenuItem } from "@/types";

/** Top-nav menu. Entries with `items` render as dropdowns. */
export const menu: MenuItem[] = [
  { label: "About Us", href: "/#sec-hero" },
  { label: "Minder AI", href: "/minder-ai" },
  { label: "Solutions", items: ["Manufacturing", "Logistics", "Field Service"] },
  { label: "Resources", items: ["Documentation", "Guides", "Blog"] },
  { label: "Contact", href: "/#sec-08" },
];

/** Selectable interface languages in the navbar. */
export const languages: Language[] = [
  { code: "EN", label: "English" },
  { code: "VI", label: "Tiếng Việt" },
  { code: "JA", label: "日本語" },
];
