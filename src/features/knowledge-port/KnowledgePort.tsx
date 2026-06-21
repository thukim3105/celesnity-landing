import { SectionShell } from "@/components/layout/SectionShell";
import { sectionsByNumber } from "@/data";

/** Section 06 — "Knowledge Port": prose only. */
export function KnowledgePort() {
  return <SectionShell section={sectionsByNumber["06"]} />;
}
