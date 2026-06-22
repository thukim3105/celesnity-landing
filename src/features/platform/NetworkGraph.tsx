import type { CSSProperties } from "react";
import { EDGES, NODES, VW, VH } from "./network-data";
import { DeviceIcons3D } from "./DeviceIcons3D";

// An "intelligence network": MINDER AI sits at the centre as a glowing wordmark
// hub; six device endpoints orbit it as 3D holographic icons (drawn by the
// <DeviceIcons3D> overlay), each wired back to the hub with glowing packets
// flowing both ways. Pure SVG so it scales crisply; the travelling dots are
// hidden under prefers-reduced-motion via the `.net-dot` rule in globals.css.
// Server component.

const NH = 38; // hub pill height

// Hub pill width estimated from label length.
const nodeWidth = (label: string) => Math.max(64, label.length * 9.2 + 34);

export function NetworkGraph({ className = "" }: { className?: string }) {
  const font: CSSProperties = { fontFamily: "var(--font-poppins)" };

  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        className="block h-auto w-full"
        role="img"
        aria-label="Six devices — Laptop, Tablet, Smart Glasses, Mobile, Desktop and Wearables — all connect inward to the central MINDER AI hub."
      >
      <defs>
        {/* Coloured glow behind the hub, keeping its shape crisp. */}
        <filter id="net-root-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="5" result="b" />
          <feFlood floodColor="#4FC3FF" floodOpacity="0.85" />
          <feComposite in2="b" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Soft halo for the travelling packets. */}
        <filter id="net-dot-glow" x="-300%" y="-300%" width="700%" height="700%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {/* Edges — faint blue wires drawn under the nodes. */}
      {EDGES.map(([a, b], i) => {
        const na = NODES[a];
        const nb = NODES[b];
        return (
          <line
            key={`e${i}`}
            x1={na.x}
            y1={na.y}
            x2={nb.x}
            y2={nb.y}
            stroke="rgba(79,195,255,0.28)"
            strokeWidth={1.4}
          />
        );
      })}

      {/* Travelling packets — both directions on every edge so each wire reads as
          a two-way exchange. Inbound packets are cyan, outbound a paler blue.
          Duration scales with edge length so all packets move at the same speed. */}
      {EDGES.flatMap(([a, b], i) => {
        const na = NODES[a];
        const nb = NODES[b];
        const dist = Math.hypot(nb.x - na.x, nb.y - na.y);
        const dur = Math.min(4, Math.max(1.4, dist / 175));
        const base = (i % 5) * 0.5;
        const dirs = [
          { path: `M ${na.x} ${na.y} L ${nb.x} ${nb.y}`, tint: "#4FC3FF" }, // inbound
          { path: `M ${nb.x} ${nb.y} L ${na.x} ${na.y}`, tint: "#cfeeff" }, // outbound
        ];
        return dirs.flatMap((d, di) =>
          [0, dur / 2].map((off, k) => (
            <g key={`d${i}-${di}-${k}`} className="net-dot">
              <animateMotion
                dur={`${dur}s`}
                begin={`-${(base + off + di * 0.35).toFixed(2)}s`}
                repeatCount="indefinite"
                path={d.path}
                calcMode="linear"
              />
              <circle r={7} fill={d.tint} opacity={0.5} filter="url(#net-dot-glow)" />
              <circle r={2.6} fill="#eaf6ff" />
            </g>
          )),
        );
      })}

      {/* Hub — the glowing MINDER AI pill. */}
      {(() => {
        const n = NODES.minder;
        const w = nodeWidth(n.label);
        return (
          <g filter="url(#net-root-glow)">
            <rect
              x={n.x - w / 2}
              y={n.y - NH / 2}
              width={w}
              height={NH}
              rx={NH / 2}
              fill="#10306e"
              stroke="#4FC3FF"
              strokeWidth={1.6}
            />
            <text
              x={n.x}
              y={n.y}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#ffffff"
              fontSize={19}
              fontWeight={600}
              style={font}
            >
              {n.label}
            </text>
          </g>
        );
      })()}

      {/* Device endpoints are drawn as 3D holograms by the <DeviceIcons3D>
          overlay below — no SVG chip circles. */}
      </svg>
      <DeviceIcons3D className="pointer-events-none absolute inset-0 h-full w-full" />
    </div>
  );
}
