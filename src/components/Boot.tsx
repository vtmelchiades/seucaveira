import { useEffect, useRef } from "react";
import gsap from "gsap";
import { REDUCE, lockScroll } from "../lib/motion";

/**
 * Boot = film leader + suite calibration (Orage's system-boot loader DNA,
 * re-signified: a post house calibrates its monitors before anything).
 * Count 3→2→1→◎, status lines, then split-wipe out. Hard cap 2.6s.
 */
export default function Boot({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (REDUCE) {
      finish();
      return;
    }
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ onComplete: finish });
      tl.fromTo(".boot__leader", { "--fill": 0 }, { "--fill": 1, duration: 1.9, ease: "none" }, 0);
      const count = (el: string, at: number, txt: string) => {
        tl.set(el, { textContent: txt, opacity: 0, scale: 1.25 }, at);
        tl.to(el, { opacity: 1, duration: 0.08 }, at);
        tl.to(el, { scale: 0.94, opacity: 0.55, duration: 0.52, ease: "power2.out" }, at + 0.1);
      };
      count(".boot__count", 0.05, "3");
      count(".boot__count", 0.68, "2");
      count(".boot__count", 1.31, "1");
      count(".boot__count", 1.94, "");
      tl.set(".boot__count", { className: "boot__count boot__ring" }, 1.94);
      lockScroll(true);
      const exit = () => {
        gsap.to(root.current, {
          clipPath: "inset(0% 0% 100% 0%)",
          yPercent: -6,
          duration: 0.95,
          ease: "expo.inOut",
          onComplete: finish,
        });
      };
      tl.add(exit, 2.12);
    }, root);
    // safety: never trap the page
    const hard = setTimeout(finish, 2600);
    function finish() {
      clearTimeout(hard);
      lockScroll(false);
      onDone();
    }
    return () => {
      ctx.revert();
      clearTimeout(hard);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="boot" id="boot" ref={root} role="status" aria-label="Carregando o site Seu Caveira">
      <div className="boot__inner">
        <div className="boot__cross" aria-hidden="true" />
        <span className="boot__tc" id="boot-tc">00:00:00:00</span>
        <span className="boot__count" aria-hidden="true">3</span>
        <span className="boot__leader" aria-hidden="true" />
        <div className="boot__status" aria-live="off">
          <b>SEU CAVEIRA</b> — PÓS-PRODUÇÃO
          <br />
          CARREGANDO LUTS · CALIBRANDO MONITOR · NÍVEL: CAVEIRA
        </div>
      </div>
      <BootTimecode />
    </div>
  );
}

function BootTimecode() {
  useEffect(() => {
    const el = document.getElementById("boot-tc");
    if (!el || REDUCE) { el && (el.textContent = "00:00:00:00"); return; }
    let f = 0;
    const id = setInterval(() => {
      f = (f + 1) % 240;
      const p = (n: number) => String(n).padStart(2, "0");
      el.textContent = `00:00:${p(Math.floor(f / 24) % 60)}:${p(f % 24)}`;
    }, 42);
    return () => clearInterval(id);
  }, []);
  return null;
}
