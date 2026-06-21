import { Eyebrow, RevealGroup, RevealItem } from "@/components/ui";
import { unnaFont, poppinsFont } from "@/constants";
import { sectionsByNumber } from "@/data";
import { NetworkGraph } from "./NetworkGraph";

/** Section 03 — "The platform": heading + the intelligence network diagram. */
export function Platform() {
  const { n, label, heading, body } = sectionsByNumber["03"];

  return (
    <section
      id="sec-03"
      className="flex min-h-svh flex-col items-center justify-center px-6 py-16 sm:py-24"
    >
      <RevealGroup className="flex w-full flex-col items-center gap-4 text-center">
        <RevealItem>
          <Eyebrow>
            {n} · {label}
          </Eyebrow>
        </RevealItem>
        {heading && (
          <RevealItem>
            <h2
              className="whitespace-pre-line text-2xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl xl:whitespace-nowrap"
              style={unnaFont}
            >
              {heading}
            </h2>
          </RevealItem>
        )}
        {body.map((p, i) => (
          <RevealItem key={i} className="max-w-2xl">
            <p
              className="text-base leading-relaxed text-white/80 sm:text-lg"
              style={poppinsFont}
            >
              {p}
            </p>
          </RevealItem>
        ))}

        <RevealItem className="flex w-full justify-center">
          <NetworkGraph className="h-auto w-full max-w-5xl" />
        </RevealItem>
      </RevealGroup>
    </section>
  );
}
