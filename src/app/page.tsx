import { Navbar, Footer, ScrollProgress, SectionNav } from "@/components/layout";
import { IntroOverlay } from "@/features/intro";
import { Hero } from "@/features/hero";
import { InHand } from "@/features/in-hand";
import { Problem } from "@/features/problem";
import { Platform } from "@/features/platform";
import { Intelligence } from "@/features/intelligence";
import { HowItWorks } from "@/features/how-it-works";
import { KnowledgePort } from "@/features/knowledge-port";
import { Team } from "@/features/team";
import { Faq } from "@/features/faq";
import { Contact } from "@/features/contact";
import { sectionMarkers } from "@/data";

/** Home — the Celesnity landing page (About Us). Minder AI lives on its own
 *  route at `/minder-ai`. */
export default function Home() {
  return (
    <>
      {/* Intro — a spark streaks in, draws "Celesnity", then flies to the logo. */}
      <IntroOverlay />

      <main className="relative bg-brand-deep pl-(--gutter) text-white">
        {/* Top navigation bar */}
        <Navbar />

        {/* Comet falling down the left edge, following the scroll */}
        <ScrollProgress markers={sectionMarkers} />

        {/* Sparkle markers — jump to any section */}
        <SectionNav markers={sectionMarkers} />

        <Hero />
        <InHand />
        <Problem />
        <Platform />
        <Intelligence />
        <HowItWorks />
        <KnowledgePort />
        <Team />
        <Faq />
        <Contact />
      </main>

      <Footer />
    </>
  );
}
