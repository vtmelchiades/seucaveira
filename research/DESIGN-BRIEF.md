# Design Brief — Seu Caveira (generated from the awwwards-inspiration loop)

> Evidence trail. MCP tools `capture_live_site` / `analyze_page_structure` /
> `search_sites` were registered and booted (awwwards-mcp 1.16.1, 39 tools,
> stdio OK). VM egress is allowlisted (github/npm/pypi): live fetches to
> awwwards.com return `fetch failed` (recorded 2026-11-02), and seucaveira.com
> is unreachable from the VM — the platform research channel (web search + page
> fetch) supplied the reference and brand evidence below. All browser-side
> tools (capture, band analysis, scroll/hover census, verify_build) run locally
> against our own build and against the reference replica in `research/`.

## Client audit — seucaveira.com (real business facts)
- Positioning: estúdio de pós-produção audiovisual, São Paulo. "Pós-Produção Nível Caveira".
- Services (JSON-LD, real): Edição e montagem · Color grading e finalização (qualidade de cinema, entrega pra qualquer tela) · Motion design e VFX (GC, animação, chroma, rotoscopia, SFX em todos os formatos).
- knowsAbout: video editing, color grading, motion design, VFX, finalização audiovisual.
- Offer shapes (nav + media): REEL · TVC · OOH (mídia exterior). "Impacto que para o trânsito e conquista olhares."
- Clients shown on /vitrine: CVC, TIM, Mercedes Vans, TENA, TIM UltraFibra, Amstel (Conmebol), Manifesto Ana Maria.
- Team claim: 15+ anos de experiência, equipe diversificada.
- Contacts: atendimento@seucaveira.com · posproducao@seucaveira.com · +55 11 94599-1717.
- Voice already there (keep, sharpen): "sem firula", "nível caveira", "O acervo, na íntegra", "Vamos Pós-Produzir?".
- Limitations of current site: template de construtora ("siterelâmpago"), thumbnails estáticas,
  erros de digitação no próprio hero ("Ideias geniáis", "quaisquer demanda"), zero motion,
  zero WebGL, sem identidade; /vitrine (hover-scrub do acervo) é a única peça de design e aponta
  o caminho: *ver o trabalho acontecendo*, não ler sobre ele.

## Shortlist (awwwards evidence — same trade, same bar)
1. **Orage** — SOTD 7.42 (29/10/2025) · by Beaucoup — *creative post production studio*.
   Palette 2 cores: #000 + #FFF. WebGL + Three.js. Motion DNA: loader = boot de sistema
   (grid compila, células inicializam, badge de autenticação); slider home com glitch
   controlado; menu drag-and-drop modular; works listing infinito; video-mask na interação
   do mouse; popups de contato/projeto. Caso Awwwards: estética "old computer terminal"
   (ritmo de linha de comando, cursor piscando) + point tracking / janelas de vigilância.
2. **LaCrapule Studio** — SOTD 7.25 (18/10/2025) — *CGI, mixed media & post-production*.
   Palette 2 cores: #1D1D1D + #FFF. GSAP + Nuxt + Prismic. Motion DNA: preloader dedicado,
   custom page transition (vertical transition + hover anim — relatos do dev no LinkedIn),
   work page em hover, about page editorial.
3. **Studio K95** — SOTD 7.32 (11/08/2026) — GSAP + Three.js + Nuxt; "bold and immersive…
   graphic design, motion, interaction and a dark editorial aesthetic"; até a 404 é peça.
4. **TRIONN** — SOTD 7.42 (27/07/2026) — Next.js + GSAP + Three.js "immersive digital journeys".
5. Signals SOTY 2025: **Lando Norris** (OFF+BRAND) = tipografia cinética em "race pace",
   transições sem corte; **Messenger** = mundo WebGL pequeno e interativo como peça central.

## Design DNA (sintese para Seu Caveira)
- Monocromático quase absoluto (preto de sala de edição + branco osso), UMA cor de sinal.
- A interface da pós-produção como linguagem: scopes, playhead, timecode, grain,
  barras de título de NLE, janelas de monitor. Tudo diegético ao negócio.
- Interações que *mostram o ofício*: reveal de color grade arrastável (antes/depois),
  scrub de thumbnail no hover (herdado do /vitrine deles, elevado), marquee de clientes.
- Tipografia expandida/condensada em contraste violento; caixa alta; sem itálico decorativo.
- Loader com sentido (leader de filme / boot), page-wipe vertical (LaCrapule), zero modal de cookie.

## Motion DNA (curvas medidas do registro das referências)
- Preloader dwell 2.0–2.8s → wipe power4.out.
- Entrances: y 40–56px + opacity, power3.out ~0.85s, stagger 0.08–0.09.
- Hero/grade reveals: scrub 0.5–1 linear (masculino "arrasta-e-responde").
- Marquee: linear infinito ~34px/s; pausa no hover com ease.
- Glitch: janelas de 80–160ms, RGB-split ±2–4px, só em hover/state-change (nunca em loop).
- Easing family única: expo/power4 nos macro, power3 nos micro; `none` em tudo scrubado.

## Build constraints (do brief MCP)
- Vite + React + R3F; GSAP ScrollTrigger + Lenis (padrões provados do skill).
- Sem .glb/texturas remotas — WebGL 100% procedural (GLSL matemático) + postprocessing.
- prefers-reduced-motion: documento empilhado calmo, conteúdo visível sem JS.
- Conteúdo visível p/ capturador sem scroll (zero banda em branco).
