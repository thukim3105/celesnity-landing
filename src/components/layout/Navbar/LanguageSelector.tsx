"use client";

import type { Language } from "@/types";
import { ChevronIcon, GlobeIcon } from "@/components/ui/icons";
import { NavDropdown } from "./NavDropdown";

interface LanguageSelectorProps {
  languages: Language[];
  value: string;
  open: boolean;
  onToggle: () => void;
  onSelect: (code: string) => void;
}

/**
 * Language picker. Controlled by the Navbar so it shares the single-open-popover
 * model (opening it closes any open menu dropdown, and vice versa).
 */
export function LanguageSelector({
  languages,
  value,
  open,
  onToggle,
  onSelect,
}: LanguageSelectorProps) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-label="Select language"
        className="flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-full border border-zinc-200/80 px-2.5 py-2 text-sm transition-colors hover:bg-zinc-900/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-transparent sm:px-3 dark:border-white/10 dark:hover:bg-white/10"
      >
        <GlobeIcon />
        <span className="tabular-nums hidden sm:inline">{value}</span>
        <span className="hidden sm:inline">
          <ChevronIcon open={open} />
        </span>
      </button>
      {open && (
        <NavDropdown className="right-0">
          {languages.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => onSelect(l.code)}
              className={`flex min-h-11 w-full items-center justify-between gap-6 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-zinc-900/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset dark:hover:bg-white/10 ${
                value === l.code ? "text-[#0091d6] dark:text-[#4FC3FF]" : ""
              }`}
            >
              {l.label}
              <span className="text-xs opacity-50">{l.code}</span>
            </button>
          ))}
        </NavDropdown>
      )}
    </div>
  );
}
