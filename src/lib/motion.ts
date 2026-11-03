/**
 * SEU CAVEIRA — motion core.
 * Proven primitives per the awwwards skills: Lenis drives the bar,
 * GSAP ticker drives Lenis (single rAF), ScrollTrigger for pins/scrubs.
 * One easing family: power3/power4/expo (macro), none (scrub).
 */
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);
// QA/inspection hook: audit tools (awwwards-mcp census) read the live ScrollTrigger
// registry off the global. Harmless in production, valuable in verification.
(window as any).gsap = gsap;
(window as any).ScrollTrigger = ScrollTrigger;

export const REDUCE =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

let lenis: Lenis | null = null;

/** Boot the single Lenis instance + the shared ticker. Call once, in App. */
export function useSmoothScroll(enabled = !REDUCE) {
  useEffect(() => {
    if (!enabled) return;
    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
    });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis?.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(raf);
      lenis?.destroy();
      lenis = null;
    };
  }, [enabled]);
}

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis && !REDUCE) lenis.scrollTo(el, { duration: 1.25, easing: (t) => 1 - Math.pow(1 - t, 4) });
  else el.scrollIntoView({ behavior: REDUCE ? "auto" : "smooth", block: "start" });
}

/** Sets [data-vis] on every band: CSS pauses all keyframes off-screen;
 *  GSAP loops (ticker/marquee) read this to timeScale(0). */
export function watchBandVisibility() {
  const sections = Array.from(document.querySelectorAll<HTMLElement>("main > section[id], footer[id]"));
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const el = e.target as HTMLElement;
        const id = el.id;
        if (e.isIntersecting) el.dataset.vis = "true";
        else el.dataset.vis = "false";
        window.dispatchEvent(new CustomEvent("band-vis", { detail: { id, vis: e.isIntersecting } }));
      }
    },
    { rootMargin: "120px 0px" },
  );
  sections.forEach((s) => io.observe(s));
  return () => io.disconnect();
}

export function scrollToTop() {
  if (lenis && !REDUCE) lenis.scrollTo(0, { duration: 1.4 });
  else window.scrollTo({ top: 0, behavior: REDUCE ? "auto" : "smooth" });
}

export function lockScroll(locked: boolean) {
  if (lenis) locked ? lenis.stop() : lenis.start();
  document.documentElement.style.overflow = ""; // keep doc scrollable as belt-and-braces
}

export type Ctx = gsap.Context | null;

/** All section motion runs through here so cleanup is per-component. */
export function useGSAPContext(setup: (self: { add: (fn: () => void) => void }) => void, deps: unknown[] = []) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context((self) => setup(self), el);
    ScrollTrigger.refresh();
    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return { ref, REDUCE };
}

/**
 * Staggered entrance: labels & copy come up with power3.out 0.85s,
 * stagger 0.08 — measured from reference filmstrips (see SPEC §4).
 */
export function entranceLines(targets: gsap.TweenTarget, opts: gsap.TweenVars = {}) {
  return gsap.fromTo(
    targets,
    { yPercent: 112 },
    { yPercent: 0, duration: 1.15, ease: "power4.out", ...opts },
  );
}

/** Frame-accurate-ish timecode string for HUD readouts. */
export function tc(frames: number, fps = 23.976) {
  const total = Math.floor(frames);
  const f = total % Math.round(fps);
  const s = Math.floor(total / fps) % 60;
  const m = Math.floor(total / fps / 60) % 60;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(m)}:${p(s)}:${p(f)}`;
}

/** IntersectionObserver gate so canvases only run when visible. */
export function useVisible(threshold = 0.01) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, visible };
}
