import { ButtonLink, MailIcon, PlayCircleIcon } from "@/components/ui";
import { poppinsFont } from "@/constants";
import { hero } from "@/data";

/**
 * Hero call-to-action pair: primary "Request a demo" (envelope) and secondary
 * "Watch the 90s demo" (play-in-circle). `pointer-events-auto` re-enables clicks
 * inside the otherwise pass-through hero content.
 */
export function HeroCtas() {
  return (
    <div
      className="pointer-events-auto mt-2 flex w-full max-w-xs flex-col items-stretch gap-4 sm:w-auto sm:max-w-none sm:flex-row sm:items-center"
      style={poppinsFont}
    >
      <ButtonLink href="#" variant="primary" className="w-full sm:w-auto">
        <MailIcon />
        {hero.primaryCta}
      </ButtonLink>

      <ButtonLink href="#" variant="ghost" className="w-full sm:w-auto">
        <PlayCircleIcon />
        {hero.secondaryCta}
      </ButtonLink>
    </div>
  );
}
