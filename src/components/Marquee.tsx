import { useEffect, useRef } from "react";
import gsap from "gsap";
import { REDUCE } from "../lib/motion";

const NAMES = ["CVC", "TIM", "Mercedes Vans", "TENA", "Amstel", "Conmebol", "Ana Maria"];

/** Clientes — outdoor energy: linear marquee, power2 stop on hover (OOH is their turf). */
export default function Marquee() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    if (REDUCE) return;
    const ctx = gsap.context(() => {
      const track = root.current!.querySelector<HTMLElement>(".marquee__track")!;
      const dup = track.children.length; // two copies
      const dist = track.scrollWidth / dup;
      const loop = gsap.to(track, { x: -dist, duration: dist / 34, ease: "none", repeat: -1 });
      const gate = (e: Event) => {
        const d = (e as CustomEvent).detail;
        if (d?.id === "clientes") loop.timeScale(d.vis ? 1 : 0);
      };
      addEventListener("band-vis", gate);
      track.addEventListener("pointerenter", () =>
        gsap.to(loop, { timeScale: 0, duration: 0.4, ease: "power2.out" }));
      track.addEventListener("pointerleave", () =>
        gsap.to(loop, { timeScale: 1, duration: 0.5, ease: "power2.out" }));
    }, root);
    return () => ctx.revert();
  }, []);
  return (
    <section className="band band--tight" id="clientes" ref={root} aria-label="Clientes">
      <span className="kicker" style={{ display: "block", margin: "0 0 1.2rem 0.4rem" }}>Passaram pela mesa</span>
      <div className="marquee">
        <div className="marquee__track">
          {[0, 1].map((k) => (
            <span key={k} style={{ display: "flex", gap: "3.4rem", alignItems: "center" }} aria-hidden={k === 1}>
              {NAMES.map((n) => <span className="marquee__word" key={n}>{n}</span>)}
              <span className="marquee__sep" aria-hidden="true" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
