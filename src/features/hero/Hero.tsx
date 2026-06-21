import { Galaxy, Ticker } from "@/visuals";
import { poppinsFont, unnaFont } from "@/constants";
import { hero, tickerItems } from "@/data";
import { HeroCtas } from "./HeroCtas";
import { heroGalaxyConfig, heroTickerSpeed } from "./constants";

/**
 * Hero section (sec-hero): a full-bleed galaxy background behind the headline,
 * body, CTAs, and an infinite ticker strip pinned to the bottom. Server
 * component — the only client island is the Galaxy canvas.
 */
export function Hero() {
  return (
    <section
      id="sec-hero"
      className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 py-16 text-center sm:py-24"
    >
      {/* Full-bleed: break out of main's left gutter (var --gutter) so the
          galaxy still spans the whole viewport behind the SectionNav rail. */}
      <div
        aria-hidden
        className="absolute inset-y-0 right-0 -left-(--gutter) z-0"
      >
        <Galaxy {...heroGalaxyConfig} />
      </div>

      <div className="pointer-events-none relative z-10 flex flex-col items-center gap-6">
        <h1
          className="pointer-events-auto text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl"
          style={unnaFont}
        >
          {hero.headline[0]}
          <br />
          {hero.headline[1]}
        </h1>
        <p
          className="pointer-events-auto max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg"
          style={poppinsFont}
        >
          {hero.body}
        </p>

        <HeroCtas />
      </div>

      {/* Infinite ticker — a thin strip pinned to the bottom of the hero,
          sharing the first screen with the intro. */}
      <div className="absolute bottom-0 right-0 -left-(--gutter) z-10 border-y border-white/10 bg-[#071436]/40 py-2 backdrop-blur-sm">
        <Ticker items={tickerItems} speed={heroTickerSpeed} />
      </div>
    </section>
  );
}
