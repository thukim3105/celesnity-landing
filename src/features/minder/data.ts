/**
 * Content for the "Minder AI" section — the three roles one intelligence plays
 * on the floor: a coach for new hires, an assistant for QC, and an agent that
 * writes back to your systems of record. Copy mirrors the product narrative in
 * sec-03 ("One intelligence. Three roles. Any device.").
 */

export interface MinderRole {
  /** Anchor id for the panel (the first one is the nav target). */
  id: string;
  /** Eyebrow text, e.g. "AI Coach · 01". */
  eyebrow: string;
  /** Heading split so the spec's wording stays one uniform style. */
  heading: { pre: string; em: string; post: string };
  /** Lead paragraph. */
  body: string;
  /** Four-item capability checklist. */
  points: string[];
  /** Per-role accent (orb/flash tint). */
  accent: string;
  /** Demo video source (provided later). */
  videoSrc?: string;
  /** Optional placeholder poster image. */
  poster?: string;
}

export const minderRoles: MinderRole[] = [
  {
    id: "sec-minder",
    eyebrow: "AI Coach · 01",
    accent: "#4FC3FF",
    videoSrc: "/videos/demo-v2.mp4",
    heading: {
      pre: "Trains new hires ",
      em: "from day one",
      post: " — no shadowing required.",
    },
    body: "A new operator walks onto the floor and opens Minder. It walks them through every procedure in their language, answers every question and adapts to their pace — freeing your seniors to do the work they were hired for.",
    points: [
      "Voice-guided walkthrough of every SOP in your library",
      "Instant answers with citations back to the source document",
      "Adapts to each worker's pace and preferred language",
      "Replaces weeks of trainer shadowing — measurably",
    ],
  },
  {
    id: "minder-assistant",
    eyebrow: "AI Assistant · 02",
    accent: "#5EEAD4",
    videoSrc: "/videos/demo-v2.mp4",
    heading: {
      pre: "Spots defects ",
      em: "before",
      post: " they cost you a shift.",
    },
    body: "Point the camera at any product, machine or process. Minder identifies anomalies, traces them to likely causes in your SOPs and recommends corrective action — with the context of a senior QC engineer.",
    points: [
      "Visual defect detection across product, line and packaging",
      "Safety warnings tied to your specific regulations and region",
      "Root-cause suggestions grounded in your SOP library",
      "Always on — no waiting for an engineer on another floor",
    ],
  },
  {
    id: "minder-agent",
    eyebrow: "AI Agent · 03",
    accent: "#86EFAC",
    videoSrc: "/videos/demo-v2.mp4",
    heading: {
      pre: "Closes the loop ",
      em: "with your systems of record.",
      post: "",
    },
    body: "Minder doesn't just answer — it acts. It logs production data, files reports, books follow-ups and drafts handover notes. Hands-free, heads-up and auditable. Your ERP and MES stop being data graveyards.",
    points: [
      "Writes to ERP, MES, CMMS and ticketing by voice",
      "Recommends the next best action from real-time context",
      "Drafts shift handovers automatically — zero paperwork",
      "Every action auditable · every decision traceable",
    ],
  },
];
