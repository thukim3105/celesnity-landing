import type { WorkflowStep } from "@/types";

/** "How it works" steps — rendered as the auto-advancing stepper in section 05. */
export const workflowSteps: WorkflowStep[] = [
  {
    id: "01",
    title: "Upload knowledge",
    description:
      "SOPs, manuals, safety guidelines, machine configs. Minder ingests and indexes — no schema design required.",
  },
  {
    id: "02",
    title: "Workers talk to Minder",
    description:
      "Phone, tablet or glasses. Voice, camera or text — in the language they already think in.",
  },
  {
    id: "03",
    title: "Reasons in context",
    description:
      "Combines your knowledge with what it sees and hears — plus role, task, site and shift.",
  },
  {
    id: "04",
    title: "Acts & learns",
    description:
      "Guides, warns, logs, books, reports. Every day it gets closer to the way your best operator actually works.",
  },
];
