import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { REDUCE, useGSAPContext } from "../lib/motion";

const PANELS = [
  {
    key: "CORTE",
    ghost: "SC",
    title: "Corte",
    lead: "Editamos até sobrar intenção.",
    body: "Do bruto ao master, nenhum frame a mais — e o frame que falta não entra. Estrutura, ritmo e aquele joinha do diretor na primeira passada.",
    items: ["Filme & TVC", "Curtas e conteúdo", "Versões e cortes por tela", "Conform e EDL/XML"],
  },
  {
    key: "COR",
    ghost: "GR",
    title: "Cor",
    lead: "Ajustamos até a imagem concordar com o roteiro.",
    body: "Qualidade de cinema, monitor calibrado, look discutido frame a frame. Entrega fechada para qualquer tela: do streaming ao outdoor que para o trânsito.",
    items: ["Primário + secundário", "Looks e LUTs próprias", "Skin tone em campanha", "QC broadcast"],
  },
  {
    key: "MOTION",
    ghost: "FX",
    title: "Motion & VFX",
    lead: "O impossível entra em conformidade.",
    body: "GC, animação, chroma, rotoscopia e SFX em todos os formatos. Energia e personalidade no motion que destaca o seu melhor — sem firula.",
    items: ["Logo e lettering animado", "CG e limpeza de set", "Chroma & tracking", "Design sonoro de interface"],
  },
];

/** Serviços — pinned horizontal chapter (GSAP ScrollTrigger doctrine). */
export default function Services() {
  const trackRef = useRef<HTMLDivElement>(null);
  const { ref } = useGSAPContext((self) => {
    const track = trackRef.current;
    if (!track || REDUCE) return;
    const getDist = () => track.scrollWidth - window.innerWidth + 32;
    const tween = gsap.to(track, {
      x: () => -getDist(),
      ease: "none",
      scrollTrigger: {
        trigger: "#servicos",
        start: "top top",
        end: () => "+=" + getDist(),
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        anticipatePin: 1,
      },
    });
    // internal entrances: one-shot play (never reverse — QA rule: reverse-on-leave
    // hides copy mid-view; also must fire for the panel already on stage at pin start)
    PANELS.forEach((_, i) => {
      const el = track.children[i] as HTMLElement | undefined;
      if (!el) return;
      gsap.fromTo(
        el.querySelectorAll("[data-in]"),
        { y: 44, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.85, ease: "power3.out", stagger: 0.08,
          immediateRender: i !== 0,
          scrollTrigger: {
            trigger: el, containerAnimation: tween,
            start: "left 96%", once: true, toggleActions: "play none none none",
          },
        },
      );
      if (i === 0) gsap.set(el.querySelectorAll("[data-in]"), { y: 0, opacity: 1 });
    });
    self.add(() => { tween.scrollTrigger?.kill(); tween.kill(); });
  });

  return (
    <section className="band band--surface" id="servicos" ref={ref as React.RefObject<HTMLElement>} aria-label="Serviços" style={{ paddingInline: 0 }}>
      <div className="wrap" style={{ paddingInline: "var(--pad)", marginBottom: "clamp(1.6rem,4vh,2.6rem)" }}>
        <span className="sec-label">Serviços</span>
        <h2 className="display h-sec" style={{ margin: "0.3em 0 0" }}>Três ofícios. Uma mesa.</h2>
      </div>
      <div className="svc-viewport">
        <div className="svc-track" ref={trackRef}>
          {PANELS.map((p) => (
            <article className="svc-panel" key={p.key} aria-labelledby={`svc-${p.key}`}>
              <span className="svc-panel__ghost" aria-hidden="true">{p.ghost}</span>
              <span className="sec-label" data-in>Pós · {p.key}</span>
              <div>
                <h3 className="display h-min" id={`svc-${p.key}`} data-in>{p.title}</h3>
                <p className="lede" style={{ margin: "0.7rem 0 1.2rem" }} data-in>{p.lead}</p>
                <p style={{ margin: 0, color: "var(--bone-dim)", maxWidth: "52ch" }} data-in>{p.body}</p>
              </div>
              <ul className="svc-panel__list" data-in>
                {p.items.map((it) => <li key={it}>{it}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
