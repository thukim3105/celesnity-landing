import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

export type ButtonVariant = "primary" | "ghost";

const BASE =
  "group inline-flex items-center justify-center gap-2.5 rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-brand-deep";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-[#4FC3FF] px-7 py-3 text-sm font-semibold text-[#04091e] shadow-[0_8px_30px_rgba(79,195,255,0.35)] hover:bg-[#6fd0ff] hover:shadow-[0_10px_40px_rgba(79,195,255,0.5)]",
  ghost:
    "border border-white/20 px-7 py-3 text-sm font-medium text-white hover:border-white/40 hover:bg-white/5",
};

/** Compose the class string for a button variant. */
export function buttonClasses(variant: ButtonVariant, className = "") {
  return `${BASE} ${VARIANTS[variant]} ${className}`.trim();
}

interface BaseProps {
  variant?: ButtonVariant;
  children: ReactNode;
  className?: string;
}

/** Pill button rendered as a native <button>. */
export function Button({
  variant = "primary",
  className,
  children,
  ...rest
}: BaseProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={buttonClasses(variant, className)} {...rest}>
      {children}
    </button>
  );
}

/** Pill button rendered as an anchor (for navigation / external links). */
export function ButtonLink({
  variant = "primary",
  className,
  children,
  ...rest
}: BaseProps & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={buttonClasses(variant, className)} {...rest}>
      {children}
    </a>
  );
}
