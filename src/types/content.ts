/**
 * Shared content types for the landing page. The actual content lives in
 * `src/data/*`; these describe its shape so data and consuming components stay
 * in sync.
 */

/** A narrative section (01–08) of the page. */
export interface Section {
  /** Two-digit section number, e.g. "01". */
  n: string;
  /** Short eyebrow label, e.g. "The problem". */
  label: string;
  /** Section heading; may contain `\n` for manual line breaks. `null` when the
   *  section renders no heading (e.g. section 07). */
  heading: string | null;
  /** Body paragraphs. An empty string entry renders no paragraph. */
  body: string[];
}

/** A scroll-rail / nav anchor target. */
export interface Marker {
  id: string;
  label: string;
}

/** One FAQ accordion entry. */
export interface FaqItem {
  question: string;
  answer: string;
}

/** One marquee item in the hero ticker. */
export interface TickerItem {
  highlight: string;
  text: string;
}

/** One animated stat card in the "problem" section. */
export interface StatItem {
  prefix: string;
  to: number;
  suffix: string;
  text: string;
}

/** One step in the "how it works" workflow stepper. */
export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
}

/** A top-nav menu entry. `items` makes it a dropdown; `href` makes it a link. */
export interface MenuItem {
  label: string;
  href?: string;
  items?: string[];
}

/** A selectable interface language. */
export interface Language {
  code: string;
  label: string;
}

/** A single footer link. */
export interface FooterLink {
  label: string;
  href: string;
}

/** A footer link column. */
export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

/** A footer social link (icon resolved by `key` in the component). */
export interface SocialLink {
  key: "linkedin" | "x" | "bluesky";
  label: string;
  href: string;
}
