import { ElectricBorder } from "@/visuals";
import { CountUp } from "@/components/ui";
import { unnaFont, poppinsFont } from "@/constants";
import type { StatItem } from "@/types";

/** A single animated stat card: electric border + count-up figure + caption. */
export function StatCard({ stat }: { stat: StatItem }) {
  return (
    <ElectricBorder
      color="#00BFFF"
      speed={0.5}
      chaos={0.07}
      borderRadius={20}
      className="h-full w-full"
    >
      <div className="flex h-full flex-col rounded-[20px] bg-[#050e2a] px-5 py-5 text-center sm:px-6 sm:py-8">
        <div
          className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl"
          style={unnaFont}
        >
          {stat.prefix}
          <CountUp from={0} to={stat.to} duration={2} />
          {stat.suffix}
        </div>
        <p
          className="mt-2 text-sm leading-relaxed text-white/70 sm:mt-3"
          style={poppinsFont}
        >
          {stat.text}
        </p>
      </div>
    </ElectricBorder>
  );
}
