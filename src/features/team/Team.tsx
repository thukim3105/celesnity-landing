import { SectionShell } from "@/components/layout/SectionShell";
import { sectionsByNumber } from "@/data";

/** Section 07 — "The team": prose only (no heading). */
export function Team() {
  return <SectionShell section={sectionsByNumber["07"]} />;
}
