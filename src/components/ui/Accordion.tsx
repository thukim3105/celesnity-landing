"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { poppinsFont } from "@/constants";
import type { FaqItem } from "@/types";

/**
 * Minimal single-open accordion. Each row shows the question with a "+" toggle
 * that becomes a "−" when open; the answer expands smoothly below.
 */
export function Accordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="w-full border-t border-white/10">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className="border-b border-white/10">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="group flex w-full items-center justify-between gap-6 rounded-lg py-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset"
            >
              <span
                className={`text-lg font-semibold leading-snug transition-colors sm:text-xl ${
                  isOpen ? "text-white" : "text-white/85 group-hover:text-white"
                }`}
                style={poppinsFont}
              >
                {item.question}
              </span>
              <span
                className={`relative grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-colors ${
                  isOpen
                    ? "border-[#4FC3FF] text-[#4FC3FF]"
                    : "border-white/25 text-white/70 group-hover:border-white/50"
                }`}
                aria-hidden
              >
                {/* horizontal bar */}
                <span className="absolute h-px w-3 bg-current" />
                {/* vertical bar — collapses to form a minus when open */}
                <span
                  className={`absolute h-3 w-px bg-current transition-transform duration-300 ${
                    isOpen ? "scale-y-0" : "scale-y-100"
                  }`}
                />
              </span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <p
                    className="max-w-2xl pb-6 pr-12 text-sm leading-relaxed text-white/65 sm:text-base"
                    style={poppinsFont}
                  >
                    {item.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
