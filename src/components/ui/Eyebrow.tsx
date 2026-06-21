import type { ReactNode } from "react";
import { poppinsFont } from "@/constants";

/** Small uppercase eyebrow label sitting above a section heading. */
export function Eyebrow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`text-sm uppercase tracking-[0.25em] text-white/50 ${className}`}
      style={poppinsFont}
    >
      {children}
    </span>
  );
}
