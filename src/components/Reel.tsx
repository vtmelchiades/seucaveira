import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAPContext, REDUCE } from "../lib/motion";
import GradeLayer from "./GradeLayer";

/**
 * O REEL — the house's signature interaction: a scrubbed grade reveal.
 * Scroll drags the split (scrub 0.5–1, ease none); the pointer can take
 * the wheel too. Labels LOG ↔ FINAL swap at 0.5 with an 80ms glitch.
 */
export default function Reel({ webgl }: { webgl: boolean }) {
  const [reveal, setReveal] = useState(REDUCE ? 0.5 : 0.06);
  const manual = useRef(false);
  const { ref } = useGSAPContext((self) => {
    if (REDUCE) return;
    const g = ScrollTrigger.create({
      trigger: ".reel__pin",
      start: "top top",
      end: "+=160%",
      pin: true,
      anticipatePin: 1,
      onUpdate: (st) => {
        if (manual.current) return;
        const p = st.progress;
        // reveal stays behind the pin: last 70% of the pinned range drives it
        const v = gsap.utils.clamp(0, 1, (p - 0.25) / 0.6);
        setReveal(0.06 + v * 0.88);
      },
    });
    self.add(() => g.kill());
    gsap.from(".reel__copy > *", {
      y: 44, opacity: 0, duration: 0.85, ease: "power3.out", stagger: 0.08,
      scrollTrigger: { trigger: ".reel__copy", start: "top 86%", once: true },
    });
  });

  const bindDrag = (el: HTMLDivElement | null) => {
    if (!el) return;
    let dragging = false;
    const setFrom = (clientX: number) => {
      const r = el.getBoundingClientRect();
      const v = gsap.utils.clamp(0.02, 0.98, (clientX - r.left) / r.width);
      manual.current = true;
      setReveal(v);
    };
    el.onpointerdown = (e) => { dragging = true; el.setPointerCapture(e.pointerId); setFrom(e.clientX); };
    el.onpointermove = (e) => { if (dragging) setFrom(e.clientX); };
    el.onpointerup = () => { dragging = false; };
    el.onpointercancel = () => { dragging = false; };
  };

  const side = reveal < 0.5 ? "log" : "final";

  return (
    <section className="band band--surface" id="reel" ref={ref as React.RefObject<HTMLElement>} aria-label="Reel e grade de cor">
      <div className="wrap reel__pin">
        <div className="reel__grid">
          <div className="reel__copy">
            <span className="sec-label">O reel</span>
            <h2 className="display h-sec h-claim">Nosso reel não pede licença. Pede replay.</h2>
            <p className="lede">
              Cor é argumento. A mesma cena, dos dois lados da nossa mesa —
              arraste a linha e veja o plano cru virar filme.
            </p>
            <p className="kicker">
              {REDUCE ? "Toque em antes/depois para alternar" : "Arraste a linha"} 
              {side === "final" ? " — FINAL" : " — LOG"}
            </p>
          </div>

          <div
            className="frame grade"
            ref={bindDrag}
            role="slider"
            aria-label="Comparar LOG e FINAL"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(reveal * 100)}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") { manual.current = true; setReveal((v) => gsap.utils.clamp(0.02, 0.98, v - 0.06)); }
              if (e.key === "ArrowRight") { manual.current = true; setReveal((v) => gsap.utils.clamp(0.02, 0.98, v + 0.06)); }
            }}
            data-cursor="drag"
            data-cursor-label="grade"
          >
            <GradeLayer reveal={reveal} webgl={webgl} />
            <span className="grade__handle">
              <span className="grade__knob" aria-hidden="true"><i /><i /></span>
            </span>
            <span className={`grade__tag grade__tag--log ${side === "log" ? "" : "is-mute"}`} data-log>LOG — o plano cru</span>
            <span className={`grade__tag grade__tag--final ${side === "final" ? "" : "is-mute"}`}>FINAL — o plano que vira filme</span>
            <span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />
            <span className="frame__hud" aria-hidden="true">
              <span className="tl">REC.01 · SEQUÊNCIA CAVEIRA</span>
              <span className="tr rec">REEL 2026</span>
              <span className="bl">4K · 2.39:1 · 23.976</span>
              <span className="br">{Math.round(reveal * 100)}%</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
