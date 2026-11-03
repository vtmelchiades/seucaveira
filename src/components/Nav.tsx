import { useEffect, useState } from "react";
import gsap from "gsap";
import { scrollToId, scrollToTop, REDUCE } from "../lib/motion";

const LINKS = [
  { id: "reel", label: "Reel" },
  { id: "acervo", label: "Acervo" },
  { id: "servicos", label: "Serviços" },
  { id: "processo", label: "Processo" },
  { id: "estudio", label: "Estúdio" },
];

export default function Nav({ booted, wipe }: { booted: boolean; wipe: (cb: () => void) => void }) {
  const [shrunk, setShrunk] = useState(false);
  const [onBone, setOnBone] = useState(false);
  const [current, setCurrent] = useState("");

  useEffect(() => {
    let ticking = false;
    const work = () => {
      const y = window.scrollY;
      setShrunk(y > 80);
      const study = document.getElementById("estudio");
      if (study) {
        const r = study.getBoundingClientRect();
        setOnBone(r.top < 90 && r.bottom > 20);
      }
      let cur = "";
      for (const l of LINKS) {
        const el = document.getElementById(l.id);
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.45) cur = l.id;
      }
      setCurrent(cur);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        work();
      });
    };
    work();
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (REDUCE) return scrollToId(id);
    wipe(() => scrollToId(id));
  };

  return (
    <header className="nav" data-shrunk={shrunk} data-onbone={onBone} style={{ opacity: booted ? 1 : 0, transition: "opacity .4s" }}>
      <a href="#" aria-label="Seu Caveira — início" onClick={(e) => { e.preventDefault(); scrollToTop(); }}>
        <span className="brand">
          <Skull aria-hidden="true" />
          Seu Caveira
          <i className="dot" aria-hidden="true" />
        </span>
      </a>
      <nav aria-label="Seções">
        <div className="nav-links">
          {LINKS.map((l) => (
            <a key={l.id} href={`#${l.id}`} onClick={go(l.id)} aria-current={current === l.id || undefined}>
              {l.label}
            </a>
          ))}
          <a className="nav-cta" href="#contato" onClick={go("contato")}>Pós-produzir?</a>
        </div>
      </nav>
    </header>
  );
}

export function Skull({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="currentColor" aria-hidden="true">
      <path d="M32 6C20 6 12 14.3 12 24.9c0 6.2 2.9 10.8 6.8 14.2v6.4c0 3 1.9 4.9 4.8 4.9h1.8V45h3.8v6.3h5.6V45h3.8v5.4h1.8c2.9 0 4.8-1.9 4.8-4.9v-6.4c3.9-3.4 6.8-8 6.8-14.2C52 14.3 44 6 32 6Zm-8 24.2a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm16 0a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z" />
      <path d="M32 31.6l3.1 6h-6.2Z" />
    </svg>
  );
}
