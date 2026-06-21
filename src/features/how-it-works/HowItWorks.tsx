import { SectionShell } from "@/components/layout/SectionShell";
import { Stepper, Step } from "@/components/ui";
import { unnaFont, poppinsFont } from "@/constants";
import { sectionsByNumber, workflowSteps } from "@/data";

/** Section 05 — "How it works": an auto-advancing stepper. */
export function HowItWorks() {
  return (
    <SectionShell
      section={sectionsByNumber["05"]}
      topPadClassName="pt-[clamp(2rem,10vh,6rem)]"
    >
      <div className="mt-2 h-auto min-h-75 w-full max-w-3xl">
        <Stepper autoAdvance autoAdvanceDelay={3000} contentClassName="min-h-[96px]">
          {workflowSteps.map((step) => (
            <Step key={step.id}>
              <h3
                className="text-2xl font-bold leading-tight text-white"
                style={unnaFont}
              >
                {step.title}
              </h3>
              <p
                className="mt-2 text-sm leading-relaxed text-white/70 sm:text-base"
                style={poppinsFont}
              >
                {step.description}
              </p>
            </Step>
          ))}
        </Stepper>
      </div>
    </SectionShell>
  );
}
