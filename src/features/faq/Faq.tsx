import { Accordion, Eyebrow, RevealGroup, RevealItem, Reveal } from "@/components/ui";
import { unnaFont, poppinsFont } from "@/constants";
import { sectionsByNumber, faqs } from "@/data";

/** Section 08 — "Questions": heading/body on the left, FAQ accordion on the right. */
export function Faq() {
  const { n, label, heading, body } = sectionsByNumber["08"];

  return (
    <section
      id="sec-08"
      className="flex min-h-svh items-start px-6 pb-28 pt-[clamp(6rem,18vh,11rem)]"
    >
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-12 lg:grid-cols-[0.6fr_1.4fr] lg:items-start">
        <RevealGroup className="flex flex-col gap-5 text-left">
          <RevealItem>
            <Eyebrow>
              {n} · {label}
            </Eyebrow>
          </RevealItem>
          {heading && (
            <RevealItem>
              <h2
                className="whitespace-pre-line text-2xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl"
                style={unnaFont}
              >
                {heading}
              </h2>
            </RevealItem>
          )}
          {body.map((p, i) => (
            <RevealItem key={i}>
              <p
                className="max-w-md text-base leading-relaxed text-white/80 sm:text-lg"
                style={poppinsFont}
              >
                {p}
              </p>
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal className="w-full" delay={0.15}>
          <Accordion items={faqs} />
        </Reveal>
      </div>
    </section>
  );
}
