import type { Marker, Section } from "@/types";

/** Hero copy (sec-hero). */
export const hero = {
  headline: ["An AI expert", "for every front-line worker."],
  body: "Minder turns the physical world into operational intelligence — reading your SOPs, seeing through your camera, speaking your workforce’s language. Coach, inspector and agent across phones, tablets and smart glasses.",
  primaryCta: "Request a demo",
  secondaryCta: "Watch the 90s demo",
} as const;

/** Final CTA copy (sec-cta). */
export const cta = {
  eyebrow: "Ship with us",
  heading: ["Put an AI expert", "on every worker’s device."],
  body: "We’re onboarding a small cohort of pilot partners in manufacturing, logistics and energy. If that’s your world, we should talk.",
  emailPlaceholder: "you@company.com",
  submitLabel: "Request a demo",
} as const;

/** The eight narrative sections (01–08). */
export const sections: Section[] = [
  {
    n: "01",
    label: "In their hand",
    heading: "One app. Live voice. Every shift.",
    body: [
      "Minder lives on the phone your worker already carries. A single tap, a single sentence — the procedure is guided, the defect is logged, and the shift report is drafted by the time they look up.",
    ],
  },
  {
    n: "02",
    label: "The problem",
    heading: "When workers leave, operational knowledge goes with them.",
    body: [""],
  },
  {
    n: "03",
    label: "The platform",
    heading: "One intelligence. Three roles. Any device.",
    body: [
      "Minder runs on the hardware your team already carries. The same model powers a coach for new hires, an inspector for QC engineers and an agent that closes the loop with your systems of record.",
    ],
  },
  {
    n: "04",
    label: "Intelligence",
    heading: "Multimodal at the edge. Agentic at the core.",
    body: [
      "Minder reasons over voice, vision and your systems of record in a single loop. What the worker sees, hears and does, it acts on — and writes back to the source of truth.",
    ],
  },
  {
    n: "05",
    label: "How it works",
    heading: "From a PDF on a shared drive\nto an agent on the floor — in a day.",
    body: [
      "Most industrial AI projects stall in integration. Minder is designed to go live before the integration ever happens.",
    ],
  },
  {
    n: "06",
    label: "Knowledge Port",
    heading: "Your company's expertise,\nmade addressable.",
    body: [
      "Upload procedures, manuals, safety guidelines, machine configurations and local regulations. Minder becomes an expert in your operations — not a generic chatbot trained on the open web.",
      "It learns from real usage. The more your team works with it, the sharper it gets. That compounding knowledge is your moat — and no competitor can replicate it without the same deployment work.",
    ],
  },
  {
    n: "07",
    label: "The team",
    heading: null,
    body: [
      "Built by operators and researchers who've shipped AI at scale — advised by engineers who trained the models you already use.",
    ],
  },
  {
    n: "08",
    label: "Questions",
    heading: "Good ones, answered plainly.",
    body: [
      "Still have a question? Talk to the team — we'll route you to whoever is best placed to answer.",
    ],
  },
];

/** Sections keyed by their two-digit number for direct lookup by a feature. */
export const sectionsByNumber: Record<string, Section> = Object.fromEntries(
  sections.map((s) => [s.n, s]),
);

/**
 * Scroll-rail markers: hero + every section + the CTA. Consumed by
 * `ScrollProgress` and `SectionNav`.
 */
export const sectionMarkers: Marker[] = [
  { id: "sec-hero", label: "Intro" },
  ...sections.map((s) => ({ id: `sec-${s.n}`, label: `${s.n} · ${s.label}` })),
  { id: "sec-cta", label: "Contact" },
];
