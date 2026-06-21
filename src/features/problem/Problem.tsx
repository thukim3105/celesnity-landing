import { SectionShell } from "@/components/layout/SectionShell";
import { sectionsByNumber, problemStats } from "@/data";
import { StatCard } from "./StatCard";

/** Section 02 — "The problem": three animated stat cards. */
export function Problem() {
  return (
    <SectionShell section={sectionsByNumber["02"]}>
      <div className="grid w-full max-w-5xl grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-6">
        {problemStats.map((stat, i) => (
          <StatCard key={i} stat={stat} />
        ))}
      </div>
    </SectionShell>
  );
}
