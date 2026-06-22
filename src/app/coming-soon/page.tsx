import type { Metadata } from "next";
import { Navbar, Footer } from "@/components/layout";
import { ButtonLink } from "@/components/ui/Button";
import { SITE } from "@/constants";

export const metadata: Metadata = {
  title: `Coming soon — ${SITE.name}`,
  description: "This part of Celesnity is on its way. Check back soon.",
};

/** `/coming-soon` — a single placeholder for nav entries that don't have a
 *  page yet. Unbuilt links route here (optionally with `?from=<label>`) instead
 *  of falling back to the home page. */
export default async function ComingSoonPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;

  return (
    <>
      <main className="relative flex min-h-svh flex-col bg-brand-deep text-white">
        <Navbar />

        <section className="flex flex-1 flex-col items-center justify-center px-6 py-32 text-center">
          <span className="mb-5 rounded-full border border-white/15 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-[#4FC3FF]">
            Coming soon
          </span>

          <h1
            className="max-w-3xl text-balance text-4xl font-semibold leading-tight sm:text-5xl md:text-6xl"
            style={{ fontFamily: "var(--font-unna)" }}
          >
            {from ? `${from} is on its way` : "We're building this"}
          </h1>

          <p className="mt-5 max-w-xl text-base text-white/65 sm:text-lg">
            This part of Celesnity isn&apos;t live yet. We&apos;re putting it
            together — check back soon, or reach out if you&apos;d like an early
            look.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink href="/" variant="primary">
              Back to home
            </ButtonLink>
            <ButtonLink href={`mailto:${SITE.contactEmail}`} variant="ghost">
              Get in touch
            </ButtonLink>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
