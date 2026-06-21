import { Eyebrow, RevealGroup, RevealItem } from "@/components/ui";
import { unnaFont, poppinsFont, SITE } from "@/constants";
import { cta } from "@/data";
import { ContactForm } from "./ContactForm";

/** Final CTA section (sec-cta): pilot signup + direct email. */
export function Contact() {
  return (
    <section
      id="sec-cta"
      className="flex min-h-svh flex-col items-center justify-center px-6 py-16 sm:py-24"
    >
      <RevealGroup className="flex w-full flex-col items-center gap-4 text-center sm:gap-6">
        <RevealItem>
          <Eyebrow>{cta.eyebrow}</Eyebrow>
        </RevealItem>

        <RevealItem>
          <h2
            className="max-w-4xl text-2xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl"
            style={unnaFont}
          >
            {cta.heading[0]}
            <br />
            {cta.heading[1]}
          </h2>
        </RevealItem>

        <RevealItem className="max-w-2xl">
          <p
            className="text-base leading-relaxed text-white/80 sm:text-lg"
            style={poppinsFont}
          >
            {cta.body}
          </p>
        </RevealItem>

        <RevealItem className="flex w-full justify-center">
          <ContactForm />
        </RevealItem>

        <RevealItem>
          <p className="text-sm text-white/50" style={poppinsFont}>
            Or email us directly at{" "}
            <a
              href={`mailto:${SITE.contactEmail}`}
              className="text-[#4FC3FF] underline-offset-4 transition hover:underline"
            >
              {SITE.contactEmail}
            </a>
          </p>
        </RevealItem>
      </RevealGroup>
    </section>
  );
}
