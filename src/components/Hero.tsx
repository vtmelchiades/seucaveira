import { Suspense, lazy, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { REDUCE } from "../lib/motion";
import GlBoundary from "./GlBoundary";

const HeroGrain = lazy(() => import("../r3f/HeroGrain"));

const TICKER = ["COLOR GRADING", "MONTAGEM", "VFX", "MOTION DESIGN", "FINALIZAÇÃO", "TVC", "OOH"];

export default function Hero({ booted, webgl }: { booted: boolean; webgl: boolean }) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!booted) return;
    const ctx = gsap.context(() => {
      if (REDUCE) {
        gsap.set(".hero__h1 .line > span", { yPercent: 0 });
        gsap.set(".hero__in", { opacity: 1, y: 0 });
        return;
      }
      gsap.timeline({ defaults: { immediateRender: false } })
        .set(".hero__in", { opacity: 0, y: 44 })
        .fromTo(".hero__h1 .line > span", { yPercent: 126 }, {
          yPercent: 0, duration: 1.15, ease: "power4.out", stagger: 0.12,
        }, 0)
        .to(".hero__in", { opacity: 1, y: 0, duration: 0.85, ease: "power3.out", stagger: 0.08 }, 0.25);

      // ticker: linear infinite (none easing = machine rhythm)
      const track = document.querySelector<HTMLElement>(".ticker__track");
      if (track) {
        const dist = track.scrollWidth / 2;
        const loop = gsap.to(track, { x: -dist, duration: dist / 90, ease: "none", repeat: -1 });
        const gate = (e: Event) => {
          const d = (e as CustomEvent).detail;
          if (d?.id === "hero") loop.timeScale(d.vis ? 1 : 0);
        };
        addEventListener("band-vis", gate);
      }
      gsap.to(".hero__cue", {
        opacity: 0,
        scrollTrigger: { trigger: root.current, start: "top top", end: "18% top", scrub: true },
      });
    }, root);
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [booted]);

  return (
    <section className="hero" id="hero" ref={root} aria-label="Apresentação">
      <div className="hero__canvas" aria-hidden="true">
        <div className="fallback" />
        {booted && !REDUCE && webgl ? (
          <GlBoundary fallback={null}>
            <Suspense fallback={null}><HeroGrain /></Suspense>
          </GlBoundary>
        ) : null}
      </div>

      <div className="hero__top">
        <p className="kicker hero__in">ESTÚDIO DE PÓS-PRODUÇÃO · SÃO PAULO — BRASIL</p>
        <p className="kicker hero__in" style={{ color: "var(--rec)" }}><i className="livedot" aria-hidden="true" />SALA 01 — ON-LINE</p>
      </div>

      <h1 className="display h-hero hero__h1">
        <span className="line"><span>Pós-produção</span></span>
        <span className="line"><span>nível caveira</span></span>
      </h1>

      <div className="hero__row">
        <p className="lede hero__sub hero__in">
          Edição, cor e motion para ideias que não morrem no bruto.
        </p>
        <div className="hero__ctas hero__in">
          <a
            className="btn"
            href="#reel"
            data-cursor="action"
            data-cursor-label="rolar"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("reel")?.scrollIntoView({ behavior: REDUCE ? "auto" : "smooth" });
            }}
          >
            Ver o reel
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M1 6h10M7 2l4 4-4 4" />
            </svg>
          </a>
          <a className="btn" href="#contato" data-cursor="action">Vamos pós-produzir?</a>
        </div>
      </div>

      <div className="hero__cue" aria-hidden="true">
        <span className="rail" />
        <span className="kicker">Role</span>
      </div>

      <div className="ticker" aria-hidden="true">
        <div className="ticker__track">
          {[0, 1].map((k) => (
            <span className="ticker__item" key={k}>
              {TICKER.map((t) => <span key={t}>{t}</span>)}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
