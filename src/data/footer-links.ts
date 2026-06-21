import type { FooterColumn, SocialLink } from "@/types";

/** Footer link columns. */
export const footerColumns: FooterColumn[] = [
  {
    title: "Products",
    links: [
      { label: "Coming Soon", href: "#" },
      { label: "Coming Soon", href: "#" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "Coming Soon", href: "#" },
      { label: "Coming Soon", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "#" },
      { label: "Customer Stories", href: "#" },
      { label: "Guides", href: "#" },
      { label: "Glossary", href: "#" },
      { label: "ROI Calculator", href: "#" },
      { label: "Newsroom", href: "#" },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: "Sales", href: "#" },
      { label: "Become Our Partner", href: "#" },
      { label: "start@celesnity.com", href: "mailto:start@celesnity.com" },
    ],
  },
];

/** Footer social links. Icons are resolved by `key` in the Footer component. */
export const socialLinks: SocialLink[] = [
  { key: "linkedin", label: "LinkedIn", href: "#" },
  { key: "x", label: "X", href: "#" },
  { key: "bluesky", label: "Bluesky", href: "#" },
];
