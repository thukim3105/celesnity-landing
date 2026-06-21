"use client";

import { useEffect, useRef, useState } from "react";
import { monoFont } from "@/constants";
import type { MinderRole } from "./data";

/** A 16:9 media box that materialises (flash + reveal) when `active`, playing a
 *  muted, looping video with a small unmute/pause control. Hidden otherwise. */
export function VideoStage({
  role,
  active,
  reducedMotion,
  stageRef,
}: {
  role: MinderRole;
  active: boolean;
  reducedMotion: boolean;
  stageRef?: React.Ref<HTMLDivElement>;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);

  const prevActiveRef = useRef(false);
  // Play from the start when activated; pause + rewind when deactivated.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (active && !paused) {
      if (!prevActiveRef.current) v.currentTime = 0; // only on panel activation
      v.play().catch(() => {});
    } else {
      v.pause();
    }
    prevActiveRef.current = active;
  }, [active, paused]);

  const visible = active || reducedMotion;

  return (
    <div
      ref={stageRef}
      className={`relative aspect-[16/9] w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#070d20]/80 shadow-2xl shadow-black/40 transition-all duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] ${
        visible
          ? "scale-100 opacity-100 blur-0"
          : "pointer-events-none scale-[0.35] opacity-0 blur-[3px]"
      }`}
    >
      {/* Flash overlay on activation */}
      <div
        className={`pointer-events-none absolute inset-0 z-10 bg-brand/60 transition-opacity duration-300 ${
          active && !reducedMotion ? "animate-[minder-flash_600ms_ease-out_forwards]" : "opacity-0"
        }`}
      />

      {role.videoSrc ? (
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          src={role.videoSrc}
          poster={role.poster}
          muted={muted}
          loop
          playsInline
          preload="none"
        />
      ) : (
        // Placeholder until a real video is supplied.
        <div className="grid h-full w-full place-items-center bg-[radial-gradient(60%_60%_at_50%_40%,rgba(79,195,255,0.18),transparent_70%)]">
          <span className="text-xs uppercase tracking-[0.2em] text-white/40" style={monoFont}>
            {role.eyebrow}
          </span>
        </div>
      )}

      {/* Controls — only meaningful once a real video exists */}
      {role.videoSrc && visible && (
        <div className="absolute bottom-2 right-2 z-20 flex gap-1.5" style={monoFont}>
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "Play video" : "Pause video"}
            className="grid h-7 w-7 place-items-center rounded-full border border-white/15 bg-black/40 text-[11px] text-white/80 backdrop-blur hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            {paused ? "▶" : "⏸"}
          </button>
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? "Unmute video" : "Mute video"}
            className="grid h-7 w-7 place-items-center rounded-full border border-white/15 bg-black/40 text-[11px] text-white/80 backdrop-blur hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            {muted ? "🔇" : "🔊"}
          </button>
        </div>
      )}
    </div>
  );
}
