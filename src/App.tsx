import { useCallback, useEffect, useState } from "react";
import gsap from "gsap";
import Boot from "./components/Boot";
import Nav from "./components/Nav";
import Cursor from "./components/Cursor";
import Hero from "./components/Hero";
import Reel from "./components/Reel";
import Acervo from "./components/Acervo";
import Services from "./components/Services";
import Process from "./components/Process";
import Manifesto from "./components/Manifesto";
import Marquee from "./components/Marquee";
import Contact from "./components/Contact";
import { hasWebGL, REDUCE, useSmoothScroll, watchBandVisibility } from "./lib/motion";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function App() {
  const [booting, setBooting] = useState(!REDUCE && document.documentElement.dataset.booted !== "true");
  const [webgl] = useState(() => hasWebGL());
  const [wipeLabel, setWipeLabel] = useState<string | null>(null);
  useSmoothScroll();

  useEffect(() => {
    if (!webgl) document.documentElement.classList.add("no-webgl");
    document.documentElement.dataset.js = "on";
    const unvis = watchBandVisibility();
    document.fonts.ready.then(() => {
      document.documentElement.classList.add("fonts-ready");
      ScrollTrigger.refresh();
    });
    // release the probe context; some engines die if too many live at once
    const move = (e: PointerEvent) => {
      window.__pointer = { x: e.clientX / innerWidth, y: 1 - e.clientY / innerHeight };
    };
    addEventListener("pointermove", move, { passive: true });
    return () => {
      removeEventListener("pointermove", move);
      unvis();
    };
  }, [webgl]);

  const booted = !booting;
  useEffect(() => {
    if (booted) document.documentElement.dataset.booted = "true";
  }, [booted]);

  /** vertical wipe on anchor nav — LaCrapule page-transition DNA, adapted. */
  const wipe = useCallback((cb: () => void) => {
    const el = document.getElementById("wipe");
    if (!el) return cb();
    setWipeLabel("SEU CAVEIRA");
    const tl = gsap.timeline();
    tl.to(el, { scaleY: 1, duration: 0.45, ease: "expo.inOut", transformOrigin: "bottom" })
      .add(() => cb())
      .to(el, { scaleY: 0, duration: 0.55, ease: "expo.inOut", transformOrigin: "top", onComplete: () => setWipeLabel(null) });
  }, []);

  return (
    <>
      {booting && <Boot onDone={() => setBooting(false)} />}
      <Cursor />
      <a className="skip-link" href="#hero">Pular para o conteúdo</a>
      <Nav booted={booted} wipe={wipe} />
      <main id="main">
        <Hero booted={booted} webgl={webgl} />
        <Reel webgl={webgl} />
        <Acervo />
        <Services />
        <Process />
        <Manifesto />
        <Marquee />
        <Contact />
      </main>
      <div className="wipe" id="wipe" aria-hidden="true" style={{ transform: "scaleY(0)" }}>
        <span>{wipeLabel}</span>
      </div>
    </>
  );
}
