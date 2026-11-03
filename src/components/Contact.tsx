import gsap from "gsap";
import { REDUCE, useGSAPContext, scrollToTop } from "../lib/motion";
import { Skull } from "./Nav";

function ExternalArrow() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" style={{ display: "inline-block", verticalAlign: "middle", marginLeft: ".3em" }}>
      <path d="M2 9 9 2M4 2h5v5" />
    </svg>
  );
}
function UpArrow() {
  return (
    <svg width="10" height="11" viewBox="0 0 10 11" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" style={{ display: "inline-block", verticalAlign: "middle", marginLeft: ".3em" }}>
      <path d="M5 10V1M1 5l4-4 4 4" />
    </svg>
  );
}

const CHANNELS = [
  { k: "E-mail — novos projetos", v: "posproducao@seucaveira.com", href: "mailto:posproducao@seucaveira.com", go: "escrever" },
  { k: "Atendimento", v: "atendimento@seucaveira.com", href: "mailto:atendimento@seucaveira.com", go: "escrever" },
  { k: "WhatsApp", v: "+55 11 94599-1717", href: "https://wa.me/5511945991717", go: "chamar" },
  { k: "Acervo completo", v: "seucaveira.com/vitrine", href: "https://seucaveira.com/vitrine", go: "ver" },
];

export default function Contact() {
  const { ref } = useGSAPContext(() => {
    if (REDUCE) return;
    gsap.from(".contact__h2", {
      clipPath: "inset(0 100% 0 0)",
      duration: 1.1,
      ease: "expo.out",
      scrollTrigger: { trigger: ".contact__head", start: "top 84%", once: true },
    });
    gsap.from(".channel", {
      y: 40, opacity: 0, duration: 0.7, ease: "power3.out", stagger: 0.08,
      scrollTrigger: { trigger: ".channels", start: "top 88%", once: true },
    });
  });

  return (
    <footer className="band" id="contato" ref={ref as React.RefObject<HTMLElement>} role="contentinfo">
      <div className="wrap">
        <div className="contact__head">
          <span className="sec-label">Contato</span>
          <h2 className="display h-hero contact__h2">Vamos pós-produzir?</h2>
        </div>
        <div className="contact__grid">
          <div>
            <p className="lede" style={{ marginBottom: "2rem" }}>
              Manda o bruto. A gente devolve argumento.
            </p>
            <div className="channels">
              {CHANNELS.map((c) => (
                <a className="channel" key={c.k} href={c.href} data-cursor="action"
                  {...(c.href.startsWith("http") ? { target: "_blank", rel: "noopener" } : {})}>
                  <span className="channel__k">{c.k}</span>
                  <span className="channel__v">{c.v}</span>
                  <span className="channel__go">
                    {c.go}{" "}
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" style={{ display: "inline-block", verticalAlign: "middle" }}>
                      <path d="M1 5h9M7 1.5 10.5 5 7 8.5" />
                    </svg>
                  </span>
                </a>
              ))}
            </div>
            <p className="contact__note">Link do Vimeo serve. HD a gente combina depois.</p>
          </div>
          <aside className="contact__brief" aria-label="Briefing mínimo">
            <h3>Briefing mínimo, sem enrolação</h3>
            <span className="row"><b>Formato</b><span>ProRes · DNxHR · o que você tem</span></span>
            <span className="row"><b>Telas</b><span>TV · OOH · digital — todas</span></span>
            <span className="row"><b>Prazo</b><span>Daqueles. A gente gosta.</span></span>
            <span className="row"><b>Referência</b><span>Manda. A gente decodifica.</span></span>
          </aside>
        </div>

        <div className="footer" style={{ paddingInline: 0 }}>
          <span>SEU CAVEIRA © 2026 — PÓS-PRODUÇÃO · SÃO PAULO</span>
          <a href="https://seucaveira.com/vitrine" target="_blank" rel="noopener">O acervo, na íntegra <ExternalArrow /></a>
          <button className="top" onClick={() => scrollToTop()} data-cursor="action">
            <Skull size={18} /> voltar ao topo <UpArrow />
          </button>
        </div>
      </div>
    </footer>
  );
}
