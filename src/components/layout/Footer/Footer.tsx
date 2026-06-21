import Image from "next/image";
import { footerColumns, socialLinks } from "@/data";
import { SITE, poppinsFont, unnaFont, monoFont } from "@/constants";
import { StatusBadge } from "./StatusBadge";
import { SocialIcon } from "./SocialIcon";

/** Site footer — server component (no interactivity). */
export function Footer() {
  return (
    <footer className="bg-[#04091e] pl-(--gutter) text-white" style={poppinsFont}>
      <div className="mx-auto w-full max-w-7xl border-t border-white/10 px-6 py-8 sm:px-10 lg:px-12">
        {/* Top — brand block + link columns */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 sm:gap-10 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div className="col-span-2 flex flex-col gap-5 sm:col-span-3 lg:col-span-1">
            <div className="flex items-center gap-1.5">
              <Image
                src="/imgs/Celesnity%20Logo%20transparent.png"
                alt="Celesnity"
                width={36}
                height={36}
                className="h-9 w-9 object-contain invert dark:invert-0"
              />
              <span className="text-xl leading-none text-white" style={unnaFont}>
                Celesnity
              </span>
            </div>

            <p className="max-w-xs text-sm leading-relaxed text-white/50">
              {SITE.tagline}
            </p>

            <StatusBadge label="All systems operational" />
          </div>

          {/* Link columns */}
          {footerColumns.map((col) => (
            <div key={col.title} className="flex flex-col gap-4">
              <h3 className="text-xs uppercase tracking-[0.2em] text-white/40">
                {col.title}
              </h3>
              <ul className="flex flex-col gap-3">
                {col.links.map((link, i) => (
                  <li key={`${link.label}-${i}`}>
                    <a
                      href={link.href}
                      className="text-sm text-white/55 transition-colors hover:text-[#4FC3FF]"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom — copyright + socials */}
        <div className="mt-7 -mx-6 flex flex-col items-start justify-between gap-6 border-t border-white/10 px-6 pt-5 sm:-mx-10 sm:flex-row sm:items-center sm:px-10 lg:-mx-12 lg:px-12">
          <p className="text-xs text-white/40" style={monoFont}>
            {SITE.copyright}
          </p>

          <div className="flex items-center gap-3">
            {socialLinks.map((social) => (
              <SocialIcon key={social.key} social={social} />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
