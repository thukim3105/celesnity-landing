import type { StatItem } from "@/types";

/** Animated stat cards shown inside section 02 ("The problem"). */
export const problemStats: StatItem[] = [
  {
    prefix: "$",
    to: 8.3,
    suffix: "T",
    text: "Lost each year to operational inefficiency across global manufacturing — rework, unplanned downtime, human error, knowledge gaps.",
  },
  {
    prefix: "",
    to: 70,
    suffix: "%",
    text: "Of the knowledge that keeps a factory running isn't in any system. It's in the head of the shift lead, the senior operator, the one engineer.",
  },
  {
    prefix: "",
    to: 6,
    suffix: " wks",
    text: "Is the average time to onboard a new line worker to full productivity — three of those weeks are spent shadowing a trainer who can't do their own job.",
  },
];
