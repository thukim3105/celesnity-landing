import type { SocialLink } from "@/types";

const ICONS: Record<SocialLink["key"], React.ReactNode> = {
  linkedin: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm6 0h3.8v1.7h.05c.53-1 1.83-2.05 3.76-2.05C20.4 8.65 22 10.6 22 14v7h-4v-6.2c0-1.48-.03-3.38-2.06-3.38-2.06 0-2.38 1.6-2.38 3.27V21H9V9Z" />
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  ),
  bluesky: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <path d="M12 10.8C10.9 8.6 7.9 4.6 5.1 3.2 3.8 2.5 2 2 2 4.2c0 1.2.7 4.9 1.1 5.5.6 1.1 1.9 1.4 3.1 1.2-2 .3-3.7 1-1.4 3.6 2.5 2.7 3.6-1 4.2-2.6.3-.8.4-1.2.7-1.2.3 0 .4.4.7 1.2.6 1.6 1.7 5.3 4.2 2.6 2.3-2.6.6-3.3-1.4-3.6 1.2.2 2.5-.1 3.1-1.2.4-.6 1.1-4.3 1.1-5.5 0-2.2-1.8-1.7-3.1-1C16.1 4.6 13.1 8.6 12 10.8Z" />
    </svg>
  ),
};

/** Circular bordered social link button. */
export function SocialIcon({ social }: { social: SocialLink }) {
  return (
    <a
      href={social.href}
      aria-label={social.label}
      className="grid h-11 w-11 place-items-center rounded-full border border-white/15 text-white/55 transition-colors hover:border-white/30 hover:bg-white/5 hover:text-[#4FC3FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-brand-deep"
    >
      {ICONS[social.key]}
    </a>
  );
}
