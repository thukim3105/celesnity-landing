import { SectionShell } from "@/components/layout/SectionShell";
import { Strands } from "@/visuals";
import { sectionsByNumber } from "@/data";

/** Section 01 — "In their hand": text, then the Strands WebGL visual. */
export function InHand() {
  return (
    <SectionShell
      section={sectionsByNumber["01"]}
      topPadClassName="pt-[clamp(1rem,8vh,5rem)]"
    >
      <div
        aria-hidden
        className="relative h-[clamp(14rem,42vh,26rem)] w-full max-w-5xl"
      >
        <Strands
          colors={["#ff0033", "#3cff00", "#1b00ff"]}
          count={5}
          speed={1.3}
          amplitude={1}
          waviness={2.4}
          thickness={0.7}
          glow={2.6}
          taper={3}
          spread={1}
          hueShift={0}
          intensity={0.6}
          saturation={2}
          opacity={1}
          scale={1.5}
        />
      </div>
    </SectionShell>
  );
}
