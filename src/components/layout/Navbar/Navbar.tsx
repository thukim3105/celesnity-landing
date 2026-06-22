"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { menu, languages } from "@/data";
import { useDismiss, useScrollSpy } from "@/hooks";
import { ChevronIcon, MenuIcon } from "@/components/ui/icons";
import { NavDropdown, NavDropdownLink } from "./NavDropdown";
import { LanguageSelector } from "./LanguageSelector";
import { ThemeToggle } from "./ThemeToggle";

// Shared menu-item style: animated ocean-blue underline on hover.
const navItem =
  "relative px-3 py-2 text-sm transition-colors after:absolute after:inset-x-3 after:bottom-1 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-[#00BFFF] after:transition-transform after:duration-300 hover:text-[#0091d6] hover:after:scale-x-100 dark:hover:text-[#4FC3FF] rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";

// Selected item: persistent, darker-blue underline.
const activeItemCls =
  "text-[#0066FF] after:scale-x-100 after:!bg-[#0066FF] dark:text-[#60A5FA]";

// In-page anchors on the home page ("/"). Their section is observed by the
// scroll-spy so the matching nav item lights up as you scroll. Route links like
// "Minder AI" (its own page) are handled by pathname instead — see below.
const HOME_MARKERS = [
  { id: "sec-hero", label: "About Us" },
  { id: "sec-cta", label: "Contact" },
];
const NO_MARKERS: typeof HOME_MARKERS = [];

export function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const [open, setOpen] = useState<string | null>(null);
  const [lang, setLang] = useState("EN");
  // Which submenu is expanded inside the mobile panel.
  const [mobileSub, setMobileSub] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  // Active nav item: on a sub-route (e.g. /minder-ai) it follows the path; on
  // the home page it follows the section currently centred in the viewport.
  const { active, setActive } = useScrollSpy(isHome ? HOME_MARKERS : NO_MARKERS);
  const routeItem = menu.find(
    (m) => m.href && !m.href.startsWith("/#") && m.href !== "/" && pathname.startsWith(m.href),
  );
  const activeItem = isHome
    ? (HOME_MARKERS[active]?.label ?? "About Us")
    : (routeItem?.label ?? "");

  // Light up a home anchor instantly on click, before the smooth-scroll settles.
  const selectHomeMarker = (label: string) => {
    const idx = HOME_MARKERS.findIndex((m) => m.label === label);
    if (idx >= 0) setActive(idx);
  };

  useDismiss(navRef, () => setOpen(null));

  const toggle = (id: string) => setOpen((o) => (o === id ? null : id));
  const closeMobile = () => {
    setOpen(null);
    setMobileSub(null);
  };

  return (
    <header ref={navRef} className="fixed inset-x-0 top-0 z-40">
      <div
        className="grid h-16 grid-cols-[auto_1fr_auto] items-center gap-2 border-b px-4 backdrop-blur-md sm:gap-4 sm:px-8 md:grid-cols-[1fr_auto_1fr] md:px-12 lg:px-20
          border-zinc-200/80 bg-white/85 text-zinc-700
          dark:border-white/10 dark:bg-brand-deep/85 dark:text-white/85"
        style={{ fontFamily: "var(--font-poppins)" }}
      >
        {/* ── LEFT: logo ───────────────────────────── */}
        <Link
          href="/"
          className="flex items-center gap-1 justify-self-start rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          onClick={closeMobile}
        >
          <Image
            src="/imgs/Celesnity%20Logo%20transparent.png"
            alt="Celesnity"
            width={52}
            height={52}
            priority
            className="h-11 w-11 object-contain invert sm:h-13 sm:w-13 dark:invert-0"
          />
          <span
            id="brand-wordmark"
            className="hidden text-xl leading-none text-zinc-900 min-[380px]:inline dark:text-white"
            style={{ fontFamily: "var(--font-unna)" }}
          >
            Celesnity
          </span>
        </Link>

        {/* ── CENTER: navigation menu (desktop only) ──────────────── */}
        <nav className="hidden justify-self-center md:block">
          <ul className="flex items-center gap-1">
            {menu.map((m) => {
              const isActive = activeItem === m.label;
              return (
                <li key={m.label} className="relative">
                  {m.items ? (
                    <>
                      <button
                        type="button"
                        onClick={() => toggle(m.label)}
                        aria-expanded={open === m.label}
                        className={`${navItem} flex items-center gap-1 ${isActive ? activeItemCls : ""}`}
                      >
                        {m.label}
                        <ChevronIcon open={open === m.label} />
                      </button>
                      {open === m.label && (
                        <NavDropdown className="left-1/2 -translate-x-1/2">
                          {m.items.map((it) => (
                            <NavDropdownLink key={it} href="#">
                              {it}
                            </NavDropdownLink>
                          ))}
                        </NavDropdown>
                      )}
                    </>
                  ) : (
                    <Link
                      href={m.href ?? "/"}
                      onClick={() => {
                        selectHomeMarker(m.label);
                        setOpen(null);
                      }}
                      className={`${navItem} block ${isActive ? activeItemCls : ""}`}
                    >
                      {m.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ── RIGHT: utility controls ──────────────── */}
        <div className="flex items-center gap-1.5 justify-self-end">
          <LanguageSelector
            languages={languages}
            value={lang}
            open={open === "lang"}
            onToggle={() => toggle("lang")}
            onSelect={(code) => {
              setLang(code);
              setOpen(null);
            }}
          />
          <ThemeToggle />

          {/* Mobile menu toggle — hidden once the inline nav appears at md. */}
          <button
            type="button"
            onClick={() => {
              setMobileSub(null);
              toggle("mobile");
            }}
            aria-expanded={open === "mobile"}
            aria-controls="mobile-nav-panel"
            aria-label={open === "mobile" ? "Close menu" : "Open menu"}
            className="grid h-11 w-11 place-items-center rounded-full border transition-colors md:hidden border-zinc-200/80 hover:bg-zinc-900/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-transparent dark:border-white/10 dark:hover:bg-white/10"
          >
            <MenuIcon open={open === "mobile"} />
          </button>
        </div>
      </div>

      {/* ── MOBILE: slide-down navigation panel ──────────────── */}
      {open === "mobile" && (
        <nav
          id="mobile-nav-panel"
          aria-label="Mobile navigation"
          className="max-h-[calc(100svh-4rem)] overflow-y-auto border-b px-4 pb-4 pt-2 backdrop-blur-md md:hidden
            border-zinc-200/80 bg-white/85 text-zinc-700
            dark:border-white/10 dark:bg-brand-deep/85 dark:text-white/85"
        >
          <ul className="flex flex-col">
            {menu.map((m) => (
              <li key={m.label} className="border-b last:border-b-0 border-zinc-200/60 dark:border-white/5">
                {m.items ? (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setMobileSub((s) => (s === m.label ? null : m.label))
                      }
                      aria-expanded={mobileSub === m.label}
                      className="flex min-h-12 w-full items-center justify-between gap-2 px-2 text-left text-base rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset"
                    >
                      {m.label}
                      <ChevronIcon open={mobileSub === m.label} />
                    </button>
                    {mobileSub === m.label && (
                      <ul className="flex flex-col pb-1 pl-3">
                        {m.items.map((it) => (
                          <li key={it}>
                            <a
                              href="#"
                              onClick={closeMobile}
                              className="flex min-h-11 items-center px-2 text-sm text-zinc-600 rounded transition-colors hover:text-brand-link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset dark:text-white/70 dark:hover:text-[#4FC3FF]"
                            >
                              {it}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    href={m.href ?? "/"}
                    onClick={() => {
                      selectHomeMarker(m.label);
                      closeMobile();
                    }}
                    className="flex min-h-12 items-center px-2 text-base rounded transition-colors hover:text-brand-link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset dark:hover:text-[#4FC3FF]"
                  >
                    {m.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
