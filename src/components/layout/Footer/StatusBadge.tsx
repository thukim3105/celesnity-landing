import { monoFont } from "@/constants";

/** Live "all systems operational" pill with a pulsing dot. */
export function StatusBadge({ label }: { label: string }) {
  return (
    <div
      className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 px-3.5 py-1.5 text-xs text-white/70"
      style={monoFont}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
      </span>
      {label}
    </div>
  );
}
