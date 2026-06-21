import type { ReactNode } from "react";
import { unnaFont, poppinsFont } from "@/constants";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import type { Section } from "@/types";

interface SectionShellProps {
  section: Section;
  /** Extra top padding utility (e.g. "pt-[10vh]") for sections that land at
   *  their top rather than centred. */
  topPadClassName?: string;
  /** Visual rendered below the heading/body (Strands, Stepper, stat grid…). */
  children?: ReactNode;
}

/**
 * Generic centred section: eyebrow · heading · body, then optional children.
 * Covers the default-layout sections (01, 02, 05, 06, 07). Special layouts
 * (03, 04, 08, CTA) compose their own markup with {@link Eyebrow}.
 *
 * Content fades + rises into view in sequence the first time the section
 * scrolls into view (see {@link RevealGroup}).
 */
export function SectionShell({
  section,
  topPadClassName = "",
  children,
}: SectionShellProps) {
  const { n, label, heading, body } = section;
  // Skip empty paragraphs (e.g. section 02 has an intentionally blank body) so
  // they don't add height / gaps and push content off a short mobile screen.
  const paragraphs = body.filter((p) => p.trim().length > 0);

  return (
    <section
      id={`sec-${n}`}
      className={`flex min-h-svh flex-col items-center justify-center px-6 py-12 sm:py-20 ${topPadClassName}`}
    >
      <RevealGroup className="flex w-full flex-col items-center gap-4 text-center sm:gap-6">
        <RevealItem>
          <Eyebrow>
            {n} · {label}
          </Eyebrow>
        </RevealItem>

        {heading && (
          <RevealItem>
            <h2
              className="max-w-4xl whitespace-pre-line text-2xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl"
              style={unnaFont}
            >
              {heading}
            </h2>
          </RevealItem>
        )}

        {paragraphs.length > 0 && (
          <RevealItem className="flex max-w-2xl flex-col gap-4">
            {paragraphs.map((p, i) => (
              <p
                key={i}
                className="text-base leading-relaxed text-white/80 sm:text-lg"
                style={poppinsFont}
              >
                {p}
              </p>
            ))}
          </RevealItem>
        )}

        {children && (
          <RevealItem className="flex w-full justify-center">{children}</RevealItem>
        )}
      </RevealGroup>
    </section>
  );
}
