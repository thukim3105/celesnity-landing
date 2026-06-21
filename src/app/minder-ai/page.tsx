import type { Metadata } from "next";
import { Navbar, Footer } from "@/components/layout";
import { MinderRoles } from "@/features/minder";
import { SITE } from "@/constants";

export const metadata: Metadata = {
  title: `${SITE.product} — ${SITE.name}`,
  description:
    "Minder AI — one intelligence, three roles on the floor: a coach for new hires, an assistant for QC, and an agent that closes the loop with your systems of record.",
};

/** `/minder-ai` — a standalone page for Minder AI, independent of the home
 *  landing page. Shows only the three roles (Coach · Assistant · Agent). */
export default function MinderAIPage() {
  return (
    <>
      <main className="relative bg-brand-deep text-white">
        {/* Top navigation bar */}
        <Navbar />

        {/* Minder AI — the three roles one intelligence plays on the floor */}
        <MinderRoles />
      </main>

      <Footer />
    </>
  );
}
