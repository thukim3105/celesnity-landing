"use client";

import { useEffect, useRef } from "react";
import { DEVICE_KEYS, buildDeviceGroup } from "./device-geometries";
import { NODES, VW, VH } from "./network-data";

// How many viewBox units the normalized (unit-size) icon should span.
const ICON_WORLD = 78;
// Gentle rock instead of a full spin: the recognizable face stays toward the
// viewer, swinging ±ROCK radians so the shape still reads as 3D.
const ROCK = 0.5;

/**
 * Six holographic device icons drawn on one transparent canvas, aligned to the
 * `NetworkGraph` SVG's viewBox via an orthographic camera. Three.js is loaded
 * lazily (client-only) the first time the effect runs. Decorative: aria-hidden,
 * honours prefers-reduced-motion, and pauses while off-screen.
 */
export function DeviceIcons3D({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    type ThreeNS = typeof import("three");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let disposed = false;
    let running = false;
    let raf = 0;
    let last = 0;
    let renderer: import("three").WebGLRenderer | null = null;
    let scene: import("three").Scene | null = null;
    let camera: import("three").OrthographicCamera | null = null;
    let io: IntersectionObserver | null = null;
    let ro: ResizeObserver | null = null;
    let clock = 0;
    const spinners: {
      group: import("three").Object3D;
      rate: number;
      phase: number;
    }[] = [];

    function render() {
      if (renderer && scene && camera) renderer.render(scene, camera);
    }

    function frame(t: number) {
      if (disposed) return;
      const dt = last ? (t - last) / 1000 : 0;
      last = t;
      clock += dt;
      for (const s of spinners) {
        s.group.rotation.y = ROCK * Math.sin(clock * s.rate + s.phase);
      }
      render();
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (running || disposed || reduce) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(frame);
    }

    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    function fit() {
      if (!renderer) return;
      const w = canvas!.clientWidth || 1;
      const h = canvas!.clientHeight || 1;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(w, h, false);
      render();
    }

    (async () => {
      const THREE: ThreeNS = await import("three");
      if (disposed) return;

      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      scene = new THREE.Scene();
      camera = new THREE.OrthographicCamera(
        -VW / 2,
        VW / 2,
        VH / 2,
        -VH / 2,
        0.1,
        1000,
      );
      camera.position.set(0, 0, 500);
      camera.lookAt(0, 0, 0);

      DEVICE_KEYS.forEach((key, i) => {
        const node = NODES[key];
        const g = buildDeviceGroup(THREE, key);
        g.scale.multiplyScalar(ICON_WORLD); // unit-size -> viewBox units
        g.position.set(node.x - VW / 2, VH / 2 - node.y, 0);
        g.rotation.x = 0.18; // slight tilt so depth reads even at rest
        scene!.add(g);
        spinners.push({ group: g, rate: 0.7 + (i % 3) * 0.12, phase: i * 0.9 });
      });

      fit();

      ro = new ResizeObserver(() => fit());
      ro.observe(canvas);

      io = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            if (reduce) render();
            else start();
          } else {
            stop();
          }
        },
        { threshold: 0.01 },
      );
      io.observe(canvas);
    })();

    return () => {
      disposed = true;
      stop();
      io?.disconnect();
      ro?.disconnect();
      scene?.traverse((obj) => {
        const any = obj as unknown as {
          geometry?: { dispose?: () => void };
          material?: { dispose?: () => void } | { dispose?: () => void }[];
        };
        any.geometry?.dispose?.();
        const m = any.material;
        if (Array.isArray(m)) m.forEach((x) => x.dispose?.());
        else m?.dispose?.();
      });
      renderer?.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
