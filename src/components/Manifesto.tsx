import { useRef } from "react";
import gsap from "gsap";
import { REDUCE, useGSAPContext } from "../lib/motion";

const TEXT =
  "Ninguém aplaude o corte certo. Aplaudem o filme. A gente trabalha exatamente aí: no frame a menos que muda tudo, na cor que segura a cena, no motion que não deixa a atenção cair. Mais de 15 anos, uma equipe diversa, uma regra: nada sai daqui \"quase pronto\".";

/** Estúdio — bone inversion, word-by-word light-up (race-pace kinetic type, SOTY signal). */
export default function Manifesto() {
  const countRef = useRef<HTMLSpanElement>(null);
  const { ref } = useGSAPContext((self) => {
    if (REDUCE) { gsap.set(".manifesto__text .w", { opacity: 1 }); gsap.set(".manifesto__years b", { innerText: 15 }); return; }
    const words = gsap.utils.toArray<HTMLElement>(".manifesto__text .w");
    const st = gsap.to(words, {
      opacity: 1,
      ease: "none",
      stagger: 0.4,
      scrollTrigger: { trigger: ".manifesto__text", start: "top 78%", end: "bottom 55%", scrub: 0.6 },
    });
    const count = gsap.fromTo(
      countRef.current,
      { innerText: 0 },
      {
        innerText: 15,
        duration: 1.1,
        ease: "power3.out",
        snap: { innerText: 1 },
        scrollTrigger: { trigger: ".manifesto__text", start: "top 90%", once: true },
      },
    );
    self.add(() => () => { st.scrollTrigger?.kill(); count.scrollTrigger?.kill(); });
  });

  return (
    <section className="band band--bone" id="estudio" ref={ref as React.RefObject<HTMLElement>} aria-label="O estúdio">
      <div className="wrap">
        <span className="sec-label">O estúdio</span>
        <h2 className="display h-sec" style={{ margin: "0.3em 0 0", maxWidth: "18ch" }}>
          Toda pós boa é invisível.
        </h2>
        <p className="manifesto__text" aria-label={TEXT}>
          {TEXT.split(" ").map((w, i) => (
            <span className="w" key={i} aria-hidden="true">{w + " "}</span>
          ))}
        </p>
        <div className="manifesto__big">
          <p className="display h-hero" style={{ color: "#0a0a0a" }}>Sem<br />firula.</p>
          <div className="manifesto__years">
            <b><span ref={countRef}>15</span>+</b>
            <span className="kicker">anos de sala escura</span>
            <span className="kicker">SP → qualquer praça</span>
          </div>
        </div>
      </div>
    </section>
  );
}
