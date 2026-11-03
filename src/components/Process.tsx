import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { REDUCE, useGSAPContext } from "../lib/motion";

const STAGES = [
  { t: "Ingestão", d: "Conform, sincronização e organizamos a bagunça: cada take sabe onde mora." },
  { t: "Montagem", d: "Corte, estrutura, ritmo. A história começa a andar sozinha." },
  { t: "Grade", d: "Cor e look aprovados com você no mesmo fone — não por e-mail às 23h." },
  { t: "Finalização", d: "Master, inserts, entregáveis por tela. Sai pronto, sai no prazo." },
];

/** Processo = a timeline. Playhead scrubbed by scroll, clips light as it passes. */
export default function Process() {
  const headRef = useRef<HTMLDivElement>(null);
  const clipRefs = useRef<(HTMLDivElement | null)[]>([]);
  const { ref } = useGSAPContext((self) => {
    const st = ScrollTrigger.create({
      trigger: ".nle",
      start: "top 82%",
      end: "bottom 30%",
      scrub: true,
      onUpdate: (self2) => update(self2.progress),
    });
    queueMicrotask(() => update(st.progress)); // paint state on entry, not only on move
    let span = 0;
    const measure = () => {
      const head = headRef.current;
      if (!head) return;
      span = Math.max(0, head.parentElement!.clientWidth - head.offsetLeft * 2 - 2);
    };
    measure();
    addEventListener("resize", measure);
    const update = (p: number) => {
      if (headRef.current) {
        headRef.current.style.transform = `translateX(${(p * span).toFixed(1)}px)`;
      }
      clipRefs.current.forEach((el, i) => {
        if (!el) return;
        const hot = p >= i / STAGES.length - 0.001;
        el.dataset.hot = String(hot);
      });
    };
    if (REDUCE) update(1);
    self.add(() => () => {
      st.kill();
      removeEventListener("resize", measure);
    });
  });

  return (
    <section className="band" id="processo" ref={ref as React.RefObject<HTMLElement>} aria-label="Processo">
      <div className="wrap">
        <span className="sec-label">Processo</span>
        <h2 className="display h-sec" style={{ margin: "0.3em 0 0", maxWidth: "16ch" }}>
          Como passa na caveira.
        </h2>
        <div className="nle" aria-hidden="false">
          <div className="nle__ruler" />
          <div className="nle__playhead" ref={headRef} style={{ position: "absolute", transform: "translateX(-1px)" }} />
          <div className="nle__lanes" aria-hidden="true">
            <div className="nle-lane">
              {STAGES.map((s, i) => (
                <div key={s.t} className="nle-clip" ref={(el) => { clipRefs.current[i] = el; }}>
                  <span className="tick" />
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                </div>
              ))}
            </div>
            <div className="nle-lane" style={{ opacity: 0.5 }}>
              {STAGES.map((s, i) => (
                <div key={i} className="nle-clip" style={{ minHeight: 34, padding: "0.35rem 0.6rem" }}>
                  <span style={{ fontFamily: "var(--f-ui)", fontSize: "0.62rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--dim)" }}>
                    ÁUDIO — {s.t}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
