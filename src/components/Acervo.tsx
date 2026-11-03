import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LOOKS, LOOK_ORDER, paintLook, type LookId } from "../lib/looks";
import { REDUCE, useGSAPContext, tc } from "../lib/motion";

type Work = { name: string; look: LookId; take: number };

// real pieces from the Seu Caveira vitrine (names as published)
const WORKS: Work[] = [
  { name: "CVC", look: "kodak", take: 2 },
  { name: "TIM", look: "teal", take: 0 },
  { name: "Mercedes Vans", look: "night", take: 1 },
  { name: "TENA", look: "highkey", take: 3 },
  { name: "TIM UltraFibra", look: "neon", take: 2 },
  { name: "Amstel — Case Conmebol", look: "teal", take: 1 },
  { name: "Manifesto Ana Maria", look: "bleach", take: 0 },
];

export default function Acervo() {
  const { ref } = useGSAPContext(() => {
    if (REDUCE) {
      gsap.set(".work", { opacity: 1, y: 0 });
      return;
    }
    gsap.from(".work", {
      y: 56, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.09,
      scrollTrigger: { trigger: ".acervo__grid", start: "top 84%" },
    });
  });

  return (
    <section className="band" id="acervo" ref={ref as React.RefObject<HTMLElement>} aria-label="Acervo">
      <div className="wrap">
        <div className="acervo__head">
          <div>
            <span className="sec-label">O acervo</span>
            <h2 className="display h-sec" style={{ margin: "0.35em 0 0" }}>O acervo,<br />na íntegra.</h2>
          </div>
          <p className="lede" style={{ maxWidth: "34ch" }}>
            Passe o mouse — ou toque — para ver cada peça rodar.
            Look de grading por peça. Sem firula.
          </p>
        </div>
        <div className="acervo__grid">
          {WORKS.map((w, i) => <WorkCard key={w.name} work={w} index={i} />)}
        </div>
      </div>
    </section>
  );
}

function WorkCard({ work, index }: { work: Work; index: number }) {
  const cardRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const state = useRef({ p: 0, raf: 0, lastTake: -1, playing: false, start: 0 });
  const [hud, setHud] = useState({ tc: "00:00:00", take: index });
  const [glitch, setGlitch] = useState(false);
  const look = LOOKS[work.look];

  useEffect(() => {
    const card = cardRef.current, canvas = canvasRef.current;
    if (!card || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const st = state.current;

    let cw = 0, ch = 0;
    const size = () => {
      const dpr = Math.min(1.5, devicePixelRatio || 1);
      cw = Math.max(2, Math.round(card.clientWidth * dpr));
      ch = Math.max(2, Math.round(card.clientWidth * dpr * 0.75));
      if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
    };
    const draw = () => {
      size();
      const w = cw, h = ch;
      const p = st.p;
      const take = work.take + Math.floor(p * 3.999);
      if (take !== st.lastTake) {
        if (st.lastTake !== -1) {
          setGlitch(true);
          setTimeout(() => setGlitch(false), 130);
        }
        st.lastTake = take;
      }
      paintLook(ctx, w, h, look, take, p % 1, st.playing && !REDUCE, performance.now() / 1000);
      card.style.setProperty("--p", String(Math.min(1, p / 2)));
      setHud((prev) => (prev.take !== take ? { tc: tc(p * 240), take } : prev));
    };

    draw();
    const ro = new ResizeObserver(() => draw());
    ro.observe(card);

    let tw: gsap.core.Tween | null = null;
    const on = () => {
      st.playing = true;
      card.dataset.playing = "true";
      tw?.kill();
      if (REDUCE) { st.p = 0.99; draw(); return; }
      tw = gsap.to(st, {
        p: 1, duration: 1.6, ease: "none", onUpdate: draw,
        onComplete: () => { tw = gsap.to(st, { p: 1.999, duration: 3.2, ease: "none", repeat: -1, onUpdate: draw }); },
      });
    };
    const off = () => {
      st.playing = false;
      delete card.dataset.playing;
      tw?.kill();
      if (REDUCE) { st.p = 0; draw(); return; }
      tw = gsap.to(st, { p: 0, duration: 0.3, ease: "power2.out", onUpdate: draw });
    };
    const enter = () => { if (!matchMedia("(hover:hover)").matches) st.playing ? off() : on(); else on(); };
    const leave = () => { if (!matchMedia("(hover:hover)").matches) return; off(); };
    card.addEventListener("pointerenter", enter);
    card.addEventListener("pointerleave", leave);
    card.addEventListener("touchstart", on, { passive: true });
    return () => {
      ro.disconnect();
      card.removeEventListener("pointerenter", enter);
      card.removeEventListener("pointerleave", leave);
      card.removeEventListener("touchstart", on);
      cancelAnimationFrame(st.raf);
    };
  }, [look, work.take]);

  return (
    <article
      className="work"
      ref={cardRef}
      data-glitch={glitch}
      data-cursor="play"
      data-cursor-label="rodar"
      style={{ ["--p" as never]: "0" }}
    >
      <div className="work__frame frame">
        <canvas aria-hidden="true" ref={canvasRef} />
        <span className="work__scanline" aria-hidden="true" />
        <span className="frame__hud" aria-hidden="true">
          <span className="tl">{look.name}</span>
          <span className="br">TK {String(hud.take % 9).padStart(2, "0")} · {hud.tc}</span>
        </span>
        <span className="work__scrub" aria-hidden="true"><i /></span>
      </div>
      <div className="work__meta">
        <h3 className="work__name">{work.name}</h3>
        <span className="work__look">arraste · veja rodar</span>
      </div>
    </article>
  );
}
