import type { FaqItem } from "@/types";

/** FAQ accordion entries (section 08). */
export const faqs: FaqItem[] = [
  {
    question: "What devices does Minder run on?",
    answer:
      "Minder runs on any phone, tablet, or pair of smart glasses equipped with a microphone and camera. No custom hardware is required. It works on the devices your workforce already uses, including iOS, Android, iPad, and Meta Ray-Ban smart glasses.",
  },
  {
    question: "How long does a deployment actually take?",
    answer:
      "Teams can begin using Minder the same day by uploading documents to the Knowledge Port and starting in supervised mode. More advanced integrations with ERP, MES, and CMMS systems are typically completed within 2–6 weeks.",
  },
  {
    question: "Is our data secure, and where does it live?",
    answer:
      "All customer data is encrypted both in transit and at rest, isolated per tenant, and never used to train models shared with other customers. Minder supports EU, US, and Asia-Pacific data residency requirements. SOC 2 Type II attestation is currently in progress.",
  },
  {
    question: "Which industries is Minder built for?",
    answer:
      "Minder is designed for industries where work is procedural, physical, and tied to regulated outcomes. Initial focus areas include discrete manufacturing, logistics, and energy, with expansion into food processing, field maintenance, and other regulated operations.",
  },
  {
    question: "How is this different from ChatGPT with my documents?",
    answer:
      "While general-purpose LLMs provide a foundation, Minder adds multimodal grounding through camera feeds, action execution within systems of record, procedural memory tailored to your workflows, hardware optimization, and a deployment model built specifically for industrial environments.",
  },
  {
    question: "How does Minder compare to traditional Connected Worker Platforms (CWPs)?",
    answer:
      "Traditional CWPs and Minder overlap on the basics — digital SOPs, worker training, checklists, and incident reporting — but a CWP delivers them as static documents and search, while Minder makes the same work conversational, real-time, and contextual. Where Minder pulls ahead is its core: voice-first knowledge access, tribal-knowledge capture, multilingual frontline support, and AI reasoning over your live site context. Hands-free smart-glasses workflows are where it becomes a genuine differentiator rather than a feature checkbox.",
  },
  {
    question: "What does pricing look like?",
    answer:
      "Pricing is offered on a per-seat basis for coach and assistant roles, with site-license options available for agent usage connected to systems of record. Pilot programs are structured to demonstrate value before any long-term seat commitment. Contact the team for a quote tailored to your operation.",
  },
];
