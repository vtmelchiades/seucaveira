/**
 * SEU CAVEIRA — procedural "footage" for the acervo cards.
 * One deterministic painter shared by all looks: stacked sine ridges, sun,
 * fbm clouds, water — recolored per grading preset. Zero assets, zero 404.
 * Hover-scrub advances `take`, which changes composition phase — reads as cuts.
 */

export type LookId = "teal" | "bleach" | "night" | "kodak" | "highkey" | "neon";

export type Look = {
  id: LookId;
  name: string;
  sky: [string, string];
  sun: string;
  ridgeA: string;
  ridgeB: string;
  water: string;
  fog: number;
  vignette: number;
  scan: number;
};

export const LOOKS: Record<LookId, Look> = {
  teal: {
    id: "teal", name: "TEAL & ORANGE",
    sky: ["#071a20", "#c96a2a"], sun: "#ffb46a",
    ridgeA: "#02141b", ridgeB: "#04303a", water: "#062a33",
    fog: 0.16, vignette: 0.5, scan: 0.14,
  },
  bleach: {
    id: "bleach", name: "BLEACH BYPASS",
    sky: ["#d9d7d2", "#8f8d88"], sun: "#ffffff",
    ridgeA: "#101010", ridgeB: "#4a4a48", water: "#2c2c2b",
    fog: 0.32, vignette: 0.24, scan: 0.2,
  },
  night: {
    id: "night", name: "NOITE AMERICANA",
    sky: ["#060b18", "#12233f"], sun: "#9fb9d8",
    ridgeA: "#01040a", ridgeB: "#081226", water: "#050d1c",
    fog: 0.1, vignette: 0.66, scan: 0.12,
  },
  kodak: {
    id: "kodak", name: "KODAK QUENTE",
    sky: ["#3a1d10", "#e08a3c"], sun: "#ffd9a0",
    ridgeA: "#180b06", ridgeB: "#54301a", water: "#241209",
    fog: 0.2, vignette: 0.42, scan: 0.1,
  },
  highkey: {
    id: "highkey", name: "HIGH-KEY",
    sky: ["#f4f1ea", "#ded9cf"], sun: "#ffffff",
    ridgeA: "#b9b4aa", ridgeB: "#cdc8be", water: "#e6e2da",
    fog: 0.4, vignette: 0.1, scan: 0.05,
  },
  neon: {
    id: "neon", name: "NEON NOIR",
    sky: ["#05030f", "#1c0a33"], sun: "#ff3ec8",
    ridgeA: "#02010a", ridgeB: "#0d0524", water: "#07031a",
    fog: 0.12, vignette: 0.62, scan: 0.16,
  },
};

export const LOOK_ORDER: LookId[] = ["teal", "bleach", "night", "kodak", "highkey", "neon"];

const TAU = Math.PI * 2;

function hash(n: number) {
  const s = Math.sin(n) * 43758.5453123;
  return s - Math.floor(s);
}
function vnoise(x: number, y: number, seed: number) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const h = (a: number, b: number) => hash(a * 127.1 + b * 311.7 + seed * 74.7);
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  return (
    h(xi, yi) * (1 - u) * (1 - v) +
    h(xi + 1, yi) * u * (1 - v) +
    h(xi, yi + 1) * (1 - u) * v +
    h(xi + 1, yi + 1) * u * v
  );
}
function fbm(x: number, y: number, seed: number) {
  let val = 0, amp = 0.5, f = 1;
  for (let i = 0; i < 3; i++) {
    val += amp * vnoise(x * f, y * f, seed + i * 13);
    f *= 2.1; amp *= 0.55;
  }
  return val;
}

export type SceneKind = 0 | 1 | 2 | 3; // ridge / skyline / dunes / ocean

/**
 * Paint one frame of the procedural plate.
 * @param p 0..1 — "playhead" through the take (scrub position)
 */
export function paintLook(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  look: Look,
  take: number,
  p: number,
  animate: boolean,
  tNow: number,
) {
  const seed = take + 1;
  const kind: SceneKind = (take % 4) as SceneKind;
  const drift = animate ? tNow * 0.02 : 0;
  const phase = p * 2.4 + drift + take * 1.7;
  const horizon = kind === 2 ? 0.30 : kind === 1 ? 0.66 : 0.55;
  const sky = ctx.createLinearGradient(0, h, 0, 0);
  sky.addColorStop(0, look.sky[1]);
  sky.addColorStop(Math.min(0.95, horizon + 0.12), look.sky[0]);
  sky.addColorStop(1, look.sky[0]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // sun disc + halo
  const sunX = w * (0.62 + 0.18 * Math.sin(phase * 0.6));
  const sunY = h * (horizon - 0.14 - 0.05 * Math.cos(phase * 0.5));
  const R = Math.min(w, h) * (kind === 3 ? 0.16 : 0.11);
  const halo = ctx.createRadialGradient(sunX, sunY, R * 0.2, sunX, sunY, R * 4.2);
  halo.addColorStop(0, hexA(look.sun, 0.85));
  halo.addColorStop(0.25, hexA(look.sun, 0.22));
  halo.addColorStop(1, hexA(look.sun, 0));
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, w, h);
  ctx.beginPath();
  ctx.arc(sunX, sunY, R, 0, TAU);
  ctx.fillStyle = hexA(look.sun, kind === 0 || kind === 3 ? 0.95 : 0.8);
  ctx.fill();

  // clouds / fog band above horizon
  ctx.globalAlpha = 0.5;
  const step = Math.max(4, Math.floor(w / 160));
  for (let x = 0; x < w; x += step) {
    const n = fbm(x / w * 3.4 + phase * 0.05, horizon * 2.2, seed);
    const cl = Math.max(0, (n - 0.52) * 2.6);
    if (cl <= 0) continue;
    ctx.fillStyle = hexA(look.fog > 0.25 ? "#ffffff" : look.sun, Math.min(0.5, cl * (0.3 + look.fog)));
    const cy = h * (horizon - 0.06 - cl * 0.22);
    ctx.fillRect(x, cy - step, step, Math.max(2, h * 0.03 * cl + step));
  }
  ctx.globalAlpha = 1;

  // ridges / skyline / dunes
  ridge(ctx, w, h, horizon + 0.02, 0.1, 2.2, phase + 0.9, look.ridgeB, kind, 0.55, seed);
  ridge(ctx, w, h, horizon, 0.16, 3.4, phase, look.ridgeA, kind, 1, seed + 7);

  // water / ground below horizon
  const groundTop = h * (kind === 1 ? 0.82 : horizon + 0.005);
  ctx.fillStyle = look.water;
  ctx.fillRect(0, groundTop, w, h - groundTop);
  if (kind !== 1) {
    // reflection streak of the sun on water
    for (let y = groundTop; y < h; y += 3) {
      const wob = Math.sin((y + phase * 40) * 0.25) * (y - groundTop) * 0.06;
      const ww = (y - groundTop) * 0.12 + 2;
      ctx.fillStyle = hexA(look.sun, 0.16 * (1 - (y - groundTop) / (h - groundTop)) + 0.04);
      ctx.fillRect(sunX - ww / 2 + wob, y, ww, 1.4);
    }
  } else {
    // skyline: tiny lit windows
    ctx.fillStyle = hexA(look.sun, 0.5);
    for (let i = 0; i < 46; i++) {
      const wx = w * hash(i * 3 + seed);
      const wy = h * (0.7 + 0.12 * hash(i * 7 + seed));
      if (Math.sin(phase + i) > 0.2) ctx.fillRect(wx, wy, 2, 2);
    }
  }

  // foreground silhouette for "energy" (a passing element when scrubbing)
  const fx = ((phase * 0.55) % 1.6 - 0.3) * w;
  ctx.fillStyle = look.ridgeA;
  if (kind === 2) {
    ctx.beginPath(); ctx.ellipse(fx, h * 0.93, w * 0.11, h * 0.05, 0, 0, TAU); ctx.fill(); // dune lip
  } else {
    ctx.fillRect(fx, h * horizon, Math.max(6, w * 0.012), h * (1 - horizon)); // crane/mast pass-through
  }

  // house grade: fog wash, scanlines, vignette, grain ticks
  ctx.fillStyle = hexA(look.fog > 0.25 ? "#ffffff" : "#0a0a0a", look.fog * 0.22);
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = `rgba(0,0,0,0.18)`;
  for (let y = 0; y < h; y += 4) ctx.fillRect(0, y, w, 1.4 * look.scan * 5);
  const vg = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.72);
  vg.addColorStop(0, "rgba(0,0,0,0)");
  vg.addColorStop(1, `rgba(0,0,0,${look.vignette})`);
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, w, h);
  // film ticks
  ctx.fillStyle = "rgba(255,255,255,0.05)";
  for (let i = 0; i < 60; i++) {
    const gx = hash(i * 13 + Math.floor(tNow * 24) * 7 + seed) * w;
    const gy = hash(i * 31 + Math.floor(tNow * 24) * 3 + seed) * h;
    ctx.fillRect(gx, gy, 1.6, 1.6);
  }
}

function ridge(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  yBase: number, amp: number, freq: number, ph: number,
  color: string, kind: SceneKind, alpha: number, seed: number,
) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, h);
  const step = Math.max(3, Math.floor(w / 220));
  for (let x = 0; x <= w; x += step) {
    const u = x / w;
    let y: number;
    if (kind === 1) {
      // skyline blocks
      const b = hash(Math.floor(u * 26) * 7 + seed);
      y = h * (yBase - 0.05 - b * 0.24);
      ctx.lineTo(x, y);
      ctx.lineTo(x + step, y);
      continue;
    } else if (kind === 2) {
      y = h * (yBase - amp * 0.6 * (0.5 + 0.5 * Math.sin(u * freq * 1.6 + ph)) - 0.02);
    } else {
      y = h * (yBase - amp * (0.55 + 0.45 * Math.sin(u * freq * TAU * 0.22 + ph)) * 0.5);
    }
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
}

function hexA(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `rgba(${r},${g},${b},${a})`;
}
