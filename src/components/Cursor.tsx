import { useEffect, useRef, useState } from "react";
import { REDUCE } from "../lib/motion";

type State = "idle" | "action" | "drag" | "play";

/** Suite reticle: crosshair ring + contextual label (Orage/LaCrapule cursor DNA). */
export default function Cursor() {
  const root = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<State>("idle");
  const [label, setLabel] = useState("");

  useEffect(() => {
    const fine = matchMedia("(pointer: fine)").matches;
    if (!fine || REDUCE) return;
    document.body.dataset.cursor = "on";
    const pos = { x: innerWidth / 2, y: innerHeight / 2 };
    const cur = { ...pos };
    let raf = 0;
    const move = (e: PointerEvent) => {
      pos.x = e.clientX; pos.y = e.clientY;
    };
    const loop = () => {
      cur.x += (pos.x - cur.x) * 0.22;
      cur.y += (pos.y - cur.y) * 0.22;
      if (root.current) root.current.style.transform = `translate3d(${cur.x}px,${cur.y}px,0)`;
      raf = requestAnimationFrame(loop);
    };
    const over = (e: PointerEvent) => {
      const t = (e.target as HTMLElement).closest?.("[data-cursor]");
      if (!t) { setState("idle"); setLabel(""); return; }
      setState((t.getAttribute("data-cursor") as State) || "action");
      setLabel(t.getAttribute("data-cursor-label") || "");
    };
    addEventListener("pointermove", move, { passive: true });
    addEventListener("pointerover", over, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      removeEventListener("pointermove", move);
      removeEventListener("pointerover", over);
      cancelAnimationFrame(raf);
      delete document.body.dataset.cursor;
    };
  }, []);

  return (
    <div className="cursor" ref={root} data-state={state} aria-hidden="true">
      <span className="cursor__ring" />
      <span className="cursor__cross" />
      <span className="cursor__label">{label}</span>
    </div>
  );
}
