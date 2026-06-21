import { Eyebrow, Reveal } from "@/components/ui";
import { SolarOrbit } from "@/visuals";
import { unnaFont, poppinsFont } from "@/constants";
import { sectionsByNumber, orbitLabels } from "@/data";

/** Section 04 — "Intelligence": capability labels orbiting the centred copy. */
export function Intelligence() {
  const { n, label, heading, body } = sectionsByNumber["04"];

  return (
    <section
      id="sec-04"
      className="flex min-h-svh flex-col items-center justify-center px-6 py-14 text-center sm:py-20"
    >
      {/* Cap the orbit's width by viewport height so the outermost ring always
          fits a short (16:9) screen without being clipped top or bottom. */}
      <Reveal className="mx-auto w-full" style={{ maxWidth: "min(100%, 156svh)" }}>
        <SolarOrbit
          aspect="1.85 / 1"
          items={orbitLabels.map((orbitLabel, i) => (
            <span
              key={i}
              className="whitespace-nowrap rounded-full border border-white/15 bg-white/[0.06] px-8 py-4 text-xl font-medium text-white/90 backdrop-blur-sm"
              style={poppinsFont}
            >
              {orbitLabel}
            </span>
          ))}
          centerContent={
            <div className="flex max-w-sm flex-col items-center gap-4 px-4">
              <Eyebrow>
                {n} · {label}
              </Eyebrow>
              {heading && (
                <h2
                  className="text-2xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl"
                  style={unnaFont}
                >
                  {heading}
                </h2>
              )}
              {body.map((p, i) => (
                <p
                  key={i}
                  className="text-sm leading-relaxed text-white/80 sm:text-base"
                  style={poppinsFont}
                >
                  {p}
                </p>
              ))}
            </div>
          }
        />
      </Reveal>
    </section>
  );
}
