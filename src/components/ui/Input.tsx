import type { InputHTMLAttributes } from "react";

/** Rounded pill input matching the contact form / CTA styling. */
export function Input({
  className = "",
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      // Form-filler / password-manager browser extensions inject attributes
      // (e.g. __gcruniqueid) onto inputs before React hydrates, which would
      // otherwise trigger a hydration mismatch warning we can't control.
      suppressHydrationWarning
      className={`h-12 rounded-full border border-white/15 bg-white/4 px-6 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-[#4FC3FF]/60 focus:bg-white/6 focus-visible:ring-2 focus-visible:ring-brand/70 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-deep ${className}`}
      {...rest}
    />
  );
}
