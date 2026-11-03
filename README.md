# SEU CAVEIRA — site

Site-of-the-Day attempt for the post-production studio **Seu Caveira** (seucaveira.com).
Design doctrine: **A MESA É O SITE** — the grade room table is the site. Full spec in
[`SPEC.md`](SPEC.md); research corpus (Awwwards DNA, briefs, QA evidence) in [`research/`](research/).

Copy is PT-BR, written in the voice of a veteran Brazilian copywriter. All media is
procedural (GLSL/WebGL + CSS/SVG) — zero remote assets.

## Stack

- Vite + React 19 + TypeScript
- GSAP + ScrollTrigger (pins, scrubs, stagger entrances) + Lenis (smooth scroll, single rAF via GSAP ticker)
- React Three Fiber / raw WebGL for the procedural grade plates (100% GLSL — no textures, no video)
- No UI kit, no CSS framework, no analytics

```
src/
  App.tsx                  boot gate, band order, wipe transition
  lib/motion.ts            gsap/ST/lenis wiring, useGSAPContext, band-visibility IO, REDUCE
  components/              Boot · Nav · Cursor · Hero · Reel · Acervo · Services ·
                           Process · GradeLayer · Manifesto · Marquee · Contact
  shaders/                 grade + plate GLSL
```

Bands: `#hero #reel #acervo #servicos #processo #estudio #clientes #contato`
(sections are `main > section.band`; `#contato` is the `footer.band`). Palette binding:
body `#090909`, hero `#0A0A0A`, reel/serviços `#141414`, acervo `#101010`, processo `#0C0C0C`
(NLE `#0D0D0D`), estúdio bone inversion `#ECE7DE`, clientes `#131313`, contato `#0E0E0E`.

## Commands

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production bundle in dist/ (single chunk, ~130 kB gz)
npx tsc -b         # typecheck gate
npm run preview    # serve dist/ (use :4173 for QA)
```

## QA harness

Measurement runs against the **production preview** (`vite preview`, port 4173) — never dev.

```bash
# runtime probe (boot, console errors, overflow, screenshots at each band)
node scripts/qaprobe.mjs http://localhost:4173 research/qa --scroll          # desktop
node scripts/qaprobe.mjs http://localhost:4173 research/qa-m --mobile        # mobile

# band-map comparison vs the deliberately motionless reference replica
node ~/mcp-call.mjs verify_build '{"buildUrl":"http://localhost:4173/","referenceUrl":"file:///home/user/seucaveira/research/reference-replica.html","viewport":"desktop"}' /tmp/verify.json

# perf + anti-pattern audit / a11y census / motion DNA (awwwards-mcp)
node ~/mcp-call.mjs audit_url '{"url":"http://localhost:4173/"}' research/qa/audit-url.json
node ~/mcp-call.mjs analyze_accessibility '{"url":"http://localhost:4173/"}' research/qa/a11y.json
node ~/mcp-call.mjs get_motion_dna '{"url":"http://localhost:4173/"}' research/qa/motion-dna.json

# reduced-motion probe (prefers-reduced-motion: reduce, both viewports)
node scripts/reduced-motion.mjs        # prefers-reduced-motion probe, both viewports
```

`~/mcp-call.mjs` is a stdio client for `awwwards-mcp` (`/usr/local/lib/node_modules/awwwards-mcp`)
with `AEGON_BROWSER` pointed at the local Chromium.

## Gate scoreboard (final run, production build)

| Gate | Result |
|---|---|
| `tsc -b` / build | ✅ clean, single chunk 388 kB raw / **129.9 kB gz** (budget ≤ 350) |
| Console errors · failed requests | ✅ `[]` desktop + mobile |
| Horizontal overflow | ✅ none (390px and 1440px, pinned scroll included) |
| Band map vs replica | ✅ **80/100**, 8/8 matched, `refOnly []` |
| Mobile parity (structure) | ✅ same band order, none removed/reordered |
| Motion fingerprint (live census) | ✅ 2 pins (`#reel`, `#servicos`), 13 ScrollTriggers, scrubs + once-entrances, stagger 0.08/0.09 |
| Perf audit (`audit_url`) | ✅ high 0 · medium 1 · longTasks 1 (82 ms) · thrash 21 (env-capped fps ~29, see notes) |
| A11y census | ✅ lang `pt-BR`, heading order no skips, 0 positive tabindex, 0 unlabeled controls |
| Reduced motion | ✅ instant boot, full opacity content, no pins/lenis, no overflow |

## Notes / honest caveats

- **FPS is environment-capped.** The sandbox renders Chromium via SwiftShader; ~29 fps with
  GL active is the ceiling there, not the site's. On real hardware the GL layers are trivial
  (two small procedural canvases, paused via IO when their band is offscreen: `data-vis`).
- `research/qa-m` mobile band *scores* from `verify_build` sit lower (≈54) because the scanner
  splits pinned/stacked bands into extra segments on narrow viewports; the DOM itself has exactly
  one node per band id (verified) and structure parity passes.
- Outline-text display lines (`NÍVEL CAVEIRA`, service ghosts) intentionally score contrast 1:1
  in fill-based auto-checkers — the fill is `transparent` by design with a bone stroke; readable
  at stroke contrast. Ghost letters are decorative.
- WebGL content can't be pixel-verified headless; `capture_pose_3d` evidence saved in
  `research/qa/pose.json` (pose-grid frame sampling of the live canvases).
- Scroll UX: `#reel` pins for `+=150%` (scrubbed grade reveal LOG→FINAL, drag/tap fallback),
  `#servicos` pins into a horizontal chapter **only ≥1020 px** (`gsap.matchMedia`; phones get
  the vertical stack), mirroring `research/reference-replica.html`'s static layout.
