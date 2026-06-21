import { Input, MailIcon } from "@/components/ui";
import { poppinsFont } from "@/constants";
import { cta } from "@/data";

/** Email capture + "Request a demo" button for the final CTA. */
export function ContactForm() {
  return (
    <div
      className="mt-2 flex w-full max-w-md flex-col items-stretch gap-3 sm:flex-row"
      style={poppinsFont}
    >
      <Input
        type="email"
        placeholder={cta.emailPlaceholder}
        aria-label="Work email"
        className="flex-1"
      />
      <button
        type="button"
        className="inline-flex h-12 shrink-0 items-center justify-center gap-2.5 rounded-full bg-[#4FC3FF] px-7 text-sm font-semibold text-[#04091e] shadow-[0_8px_30px_rgba(79,195,255,0.35)] transition hover:bg-[#6fd0ff] hover:shadow-[0_10px_40px_rgba(79,195,255,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-brand-deep"
      >
        <MailIcon />
        {cta.submitLabel}
      </button>
    </div>
  );
}
