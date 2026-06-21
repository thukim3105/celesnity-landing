"use client";

import type { CSSProperties, ReactNode } from "react";
import { motion, type Variants } from "motion/react";
import { useReducedMotion } from "@/hooks";

// Parent orchestrates a staggered reveal of its RevealItem children.
const groupVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

// Each item fades in while sliding up a touch.
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

interface RevealProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Wraps a block whose {@link RevealItem} children should fade + rise into view
 * in sequence the first time the group scrolls into view. Honors
 * `prefers-reduced-motion` by rendering a plain, fully-visible element.
 */
export function RevealGroup({ children, className, style }: RevealProps) {
  const reduced = useReducedMotion();
  if (reduced)
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );

  return (
    <motion.div
      className={className}
      style={style}
      variants={groupVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

/** A single staggered child of a {@link RevealGroup}. */
export function RevealItem({ children, className, style }: RevealProps) {
  const reduced = useReducedMotion();
  if (reduced)
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );

  return (
    <motion.div className={className} style={style} variants={itemVariants}>
      {children}
    </motion.div>
  );
}

/**
 * Standalone fade + rise for a single element that isn't part of a
 * {@link RevealGroup} (e.g. a self-contained illustration). Triggers once on
 * scroll-in; `delay` lets it trail neighbouring content.
 */
export function Reveal({
  children,
  className,
  style,
  delay = 0,
}: RevealProps & { delay?: number }) {
  const reduced = useReducedMotion();
  if (reduced)
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );

  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
