"use client";

import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Color, Triangle, RenderTarget } from "ogl";
import {
  MAX_COLORS,
  MAX_STRANDS,
  strandsFragmentShader,
  strandsGlassFragmentShader,
  strandsVertexShader,
} from "@/lib/webgl";

export interface StrandsSceneOptions {
  colors: string[];
  count: number;
  speed: number;
  amplitude: number;
  waviness: number;
  thickness: number;
  glow: number;
  taper: number;
  spread: number;
  hueShift: number;
  intensity: number;
  saturation: number;
  opacity: number;
  scale: number;
  glass: boolean;
  refraction: number;
  dispersion: number;
  glassSize: number;
}

const buildPalette = (colors: string[]): number[][] => {
  const filled = colors && colors.length ? colors : ["#ffffff"];
  const padded: number[][] = [];
  for (let i = 0; i < MAX_COLORS; i++) {
    const hex = filled[i] ?? filled[filled.length - 1];
    const c = new Color(hex);
    padded.push([c.r, c.g, c.b]);
  }
  return padded;
};

/**
 * Sets up the OGL "strands" scene: an animated field of glowing wavy lines with
 * an optional glass/lens refraction post-pass. Owns the renderer, two programs,
 * the rAF loop (re-pushing uniforms each frame from a live props mirror), resize
 * handling, and visibility gating. Returns the container ref.
 */
export function useStrandsScene(opts: StrandsSceneOptions) {
  const propsRef = useRef<StrandsSceneOptions>(opts);
  // Keep the live props mirror current so the per-frame uniform reads see the
  // latest values (updated in an effect, not during render).
  useEffect(() => {
    propsRef.current = opts;
  });

  const ctnDom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctn = ctnDom.current;
    if (!ctn) return;

    // Pause the (multi-pass) shader whenever section 01 is off-screen.
    let visible = true;
    const visibilityObserver = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0 },
    );
    visibilityObserver.observe(ctn);

    const renderer = new Renderer({
      alpha: true,
      premultipliedAlpha: true,
      antialias: true,
    });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.canvas.style.backgroundColor = "transparent";

    const geometry = new Triangle(gl);
    if (geometry.attributes.uv) {
      delete geometry.attributes.uv;
    }

    const initial = propsRef.current;

    const program = new Program(gl, {
      vertex: strandsVertexShader,
      fragment: strandsFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: [ctn.offsetWidth, ctn.offsetHeight] },
        uColors: { value: buildPalette(initial.colors) },
        uColorCount: { value: Math.min(initial.colors.length, MAX_COLORS) },
        uStrandCount: { value: Math.min(initial.count, MAX_STRANDS) },
        uSpeed: { value: initial.speed },
        uAmplitude: { value: initial.amplitude },
        uWaviness: { value: initial.waviness },
        uThickness: { value: initial.thickness },
        uGlow: { value: initial.glow },
        uTaper: { value: initial.taper },
        uSpread: { value: initial.spread },
        uHueShift: { value: initial.hueShift },
        uIntensity: { value: initial.intensity },
        uOpacity: { value: initial.opacity },
        uScale: { value: initial.scale },
        uSaturation: { value: initial.saturation },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });

    const renderTarget = new RenderTarget(gl, {
      width: ctn.offsetWidth,
      height: ctn.offsetHeight,
    });

    const glassProgram = new Program(gl, {
      vertex: strandsVertexShader,
      fragment: strandsGlassFragmentShader,
      uniforms: {
        uScene: { value: renderTarget.texture },
        uResolution: { value: [ctn.offsetWidth, ctn.offsetHeight] },
        uRadius: { value: 0.46 * initial.glassSize },
        uRefraction: { value: initial.refraction },
        uDispersion: { value: initial.dispersion },
      },
    });
    const glassMesh = new Mesh(gl, { geometry, program: glassProgram });

    ctn.appendChild(gl.canvas);

    function resize() {
      if (!ctn) return;
      const width = ctn.offsetWidth;
      const height = ctn.offsetHeight;
      renderer.setSize(width, height);
      program.uniforms.uResolution.value = [width, height];
      renderTarget.setSize(width, height);
      glassProgram.uniforms.uResolution.value = [width, height];
    }
    window.addEventListener("resize", resize);
    resize();

    let animateId = 0;
    const update = (t: number) => {
      animateId = requestAnimationFrame(update);
      if (!visible) return;
      const current = propsRef.current;
      program.uniforms.uTime.value = t * 0.001;
      program.uniforms.uColors.value = buildPalette(current.colors);
      program.uniforms.uColorCount.value = Math.min(
        current.colors.length,
        MAX_COLORS,
      );
      program.uniforms.uStrandCount.value = Math.min(
        Math.max(Math.round(current.count), 1),
        MAX_STRANDS,
      );
      program.uniforms.uSpeed.value = current.speed;
      program.uniforms.uAmplitude.value = current.amplitude;
      program.uniforms.uWaviness.value = current.waviness;
      program.uniforms.uThickness.value = current.thickness;
      program.uniforms.uGlow.value = current.glow;
      program.uniforms.uTaper.value = current.taper;
      program.uniforms.uSpread.value = current.spread;
      program.uniforms.uHueShift.value = current.hueShift;
      program.uniforms.uIntensity.value = current.intensity;
      program.uniforms.uOpacity.value = current.opacity;
      program.uniforms.uScale.value = current.scale;
      program.uniforms.uSaturation.value = current.saturation;

      if (current.glass) {
        renderer.render({ scene: mesh, target: renderTarget });
        glassProgram.uniforms.uScene.value = renderTarget.texture;
        glassProgram.uniforms.uRefraction.value = current.refraction;
        glassProgram.uniforms.uDispersion.value = current.dispersion;
        glassProgram.uniforms.uRadius.value = 0.46 * current.glassSize;
        renderer.render({ scene: glassMesh });
      } else {
        renderer.render({ scene: mesh });
      }
    };
    animateId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animateId);
      visibilityObserver.disconnect();
      window.removeEventListener("resize", resize);
      if (ctn && gl.canvas.parentNode === ctn) {
        ctn.removeChild(gl.canvas);
      }
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
    // The scene reads live values from propsRef every frame, so it only needs
    // to be set up once.
  }, []);

  return ctnDom;
}
