import type { CSSProperties } from "react";
import { poppinsFont } from "@/constants";
import type { TickerItem } from "@/types";

interface TickerProps {
  items: TickerItem[];
  /** Loop duration in seconds. */
  speed?: number;
}

/**
 * Infinite, constant-speed right-to-left marquee. The item list is duplicated
 * so the track loops seamlessly (translateX(-50%) lands the second copy exactly
 * where the first began). Pauses on hover. CSS-driven — server component.
 */
export function Ticker({ items, speed = 45 }: TickerProps) {
  const loop = [...items, ...items];

  return (
    <div className="ticker flex overflow-hidden">
      <ul
        className="ticker-track flex w-max items-center"
        style={
          { ...poppinsFont, "--ticker-duration": `${speed}s` } as CSSProperties
        }
      >
        {loop.map((item, i) => (
          <li
            key={i}
            className="flex items-center whitespace-nowrap"
            aria-hidden={i >= items.length}
          >
            <span className="mx-6 inline-flex items-center gap-2.5 text-sm uppercase tracking-[0.12em] sm:text-base">
              <span className="font-semibold text-[#4FC3FF]">
                {item.highlight}
              </span>
              <span className="text-white/65">{item.text}</span>
            </span>
            <span className="text-sm text-[#4FC3FF]/45" aria-hidden>
              ✦
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
