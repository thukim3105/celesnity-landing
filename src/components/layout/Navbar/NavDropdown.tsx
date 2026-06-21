import type { ReactNode } from "react";

/** Floating dropdown surface anchored under its trigger. */
export function NavDropdown({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`absolute top-full mt-2 min-w-[12rem] rounded-xl border p-1.5 shadow-xl shadow-black/5 backdrop-blur-xl
        border-zinc-200/80 bg-white/90 text-zinc-700
        dark:border-white/10 dark:bg-[#0a0e1a]/90 dark:text-white/85 ${className}`}
    >
      {children}
    </div>
  );
}

/** A single link row inside a {@link NavDropdown}. */
export function NavDropdownLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      className="flex min-h-11 items-center rounded-lg px-3 py-2 text-sm transition-colors hover:bg-zinc-900/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset dark:hover:bg-white/10"
    >
      {children}
    </a>
  );
}
