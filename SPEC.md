# SPEC — SEU CAVEIRA · site novo (nível SOTD)

Cliente: Seu Caveira — estúdio de pós-produção audiovisual, São Paulo.
Referências-evidência: `research/DESIGN-BRIEF.md` (Orage SOTD 7.42, LaCrapule SOTD 7.25,
Studio K95 SOTD 7.32, TRIONN SOTD 7.42, sinais SOTY 2025). Este arquivo é o contrato
de implementação e de verificação.

---

## 0. Conceito

**"A MESA É O SITE."** A interface do próprio ofício — sala de edição, monitor calibrado,
scopes, playhead, grain de filme, badge de leader — vira a linguagem visual do site.
O visitante não lê sobre pós-produção: ele *opera* a pós. Cada seção tem uma interação
que demonstra o serviço (reveal de grade arrastável = color grading; scrub no hover =
montagem; marquee = mídia exterior; wipe vertical = transição de LaCrapule).

Tom de marca (copy): brasileiro, seco, confiante, sem firula. Frases curtas. Zero
"elevar sua marca". A caveira é presença, não Halloween: "o que passa aqui não morre no bruto".

## 1. Tokens

| token | valor | origem |
|---|---|---|
| `--bg` | `#0A0A0A` | preto sala de edição (Orage #000 / LaCrapule #1D1D1D) |
| `--surface` | `#141414` | janelas/monitores |
| `--line` | `#262626` | réguas de scope |
| `--bone` | `#ECE7DE` | branco osso (caveira); NUNCA background |
| `--dim` | `#8A857C` | secundário |
| `--signal` | `#FF4B12` | laranja REC — única cor de sinal |
| `--rec` | `#E4352B` | ponto REC / "ao vivo" |
| display | Archivo variable (wght 100–900, wdth se existir) | cinética race-pace (Lando Norris) |
| texto/UI | Space Grotesk | grotesco seco, NÃO mono — labels em caixa alta com tracking |
| corpo | Archivo regular | parágrafos |

Regras anti-slop (travadas): sem fundo creme; sem itálico de ênfase em headline; sem
rótulos "01/02/03"; sem rótulos monospace; sem botões pill (usar retos, 1px border);
sem grid SaaS (hero centralizado + 3 cards de features); sem asset remoto (.glb,
imagens/texturas de URL externa) — tudo procedural e self-hosted.

## 2. Mapa de bandas (desktop 1440×900, alvo `analyze_page_structure`)

| # | id | fundo | altura | conteúdo |
|---|----|-------|--------|----------|
| 0 | `#boot` | bone overlay | 100vh | leader de filme 3-2-1 + calibração; sai com split-wipe ≤2.6s |
| 1 | `#hero` | `--bg` + canvas grain | 110vh | wordmark gigante, kicker, ticker, cue de scroll, REC-dot cursor |
| 2 | `#reel` | `--surface` | pinned 260vh | moldura-monitor com reveal de grade LOG→FINAL arrastável (scrub 0.5–1) |
| 3 | `#acervo` | `--bg` | auto (~220vh) | grid 6 cards; hover/tap = scrub de "peça" procedural + glitch 80–160ms |
| 4 | `#servicos` | `--surface` | pinned horizontal 320vh | 3 painéis full: CORTE / COR / MOTION — entrada um-shot, scrub `none` |
| 5 | `#processo` | `--bg` | 180vh | linha do tempo NLE: playhead scrubado atravessa 4 estações |
| 6 | `#estudio` | `--bone` (inversão total) | auto | manifesto claro-no-papel; reveal palavra-a-palavra; 15+ anos |
| 7 | `#clientes` | `--bg` | 34vh | marquee linear 34px/s, pausa no hover |
| 8 | `#contato` | `--bg` | auto (~120vh) | "VAMOS PÓS-PRODUZIR?" + canais reais + footer |
| — | `#nav` | fixo topo | 64px | logo-mono SC · âncoras · "PÓS-PRODUZIR" (inverte no scroll) |
| — | `#cursor` | blend diff | — | retículo + rótulo contextual; só pointer:fine |

Mobile: mesma ordem; serviços deixa de ser horizontal (stack com reveal), reel vira
slider de 1 toque, grid 1 col, marquee mais lento, cursor off. `compare:"mobile"` não
pode reportar `reordered` nem `bandsRemoved`.

## 3. Copy final (PT-BR, revisada)

- **Boot**: `SEU CAVEIRA — PÓS-PRODUÇÃO` / linhas de status: `CARREGANDO LUTS · CALIBRANDO MONITOR · NÍVEL: CAVEIRA` / timecode rolando no leader.
- **Hero kicker**: `ESTÚDIO DE PÓS-PRODUÇÃO · SÃO PAULO — BRASIL`
- **H1**: `PÓS-PRODUÇÃO` / `NÍVEL CAVEIRA` (duas linhas, display expandido)
- **Sub**: `Edição, cor e motion para ideias que não morrem no bruto.`
- **CTA primário**: `VER O REEL` · secundário: `VAMOS PÓS-PRODUZIR?`
- **Ticker**: `COLOR GRADING — MONTAGEM — VFX — MOTION DESIGN — FINALIZAÇÃO — TVC — OOH —`
- **Reel label**: `O REEL` · **H2**: `Nosso reel não pede licença. Pede replay.`
  Reveal: `ARRASTE A LINHA` / `LOG — o plano cru` ↔ `FINAL — o plano que vira filme`.
  Copy lateral: `Cor é argumento. A mesma cena, dos dois lados da nossa mesa.`
- **Acervo H2**: `O ACERVO, NA ÍNTEGRA.` (frase real do site deles)
  Sub: `Passe o mouse — ou toque — para ver cada peça rodar.`
  Cards (títulos reais da vitrine): CVC · TIM · MERCEDES VANS · TENA · TIM ULTRAFIBRA · AMSTEL — CASE CONMEBOL · MANIFESTO ANA MARIA.
  Olho de cada card = "look" procedural com nome: `TEAL & ORANGE`, `BLEACH BYPASS`, `NOITE AMERICANA`, `KODAK QUENTE`, `HIGH-KEY`, `NEON NOIR`.
- **Serviços H2**: `TRÊS OFÍCIOS. UMA MESA.`
  1. `CORTE` — `Editamos até sobrar intenção. Do bruto ao master, nenhum frame a mais — e o frame que falta não entra.`
  2. `COR` — `Ajustamos até a imagem concordar com o roteiro. Qualidade de cinema, entrega fechada para qualquer tela: do streaming ao outdoor que para o trânsito.`
  3. `MOTION & VFX` — `O impossível entra em conformidade. GC, animação, chroma, rotoscopia e SFX em todos os formatos — energia e personalidade, sem firula.`
- **Processo H2**: `COMO PASSA NA CAVEIRA` — estações: `INGESTÃO · alinhamento e Conform`, `MONTAGEM · corte, estrutura, ritmo`, `GRADE · cor e look aprovados`, `FINALIZAÇÃO · master, inserts, entregáveis por tela`.
- **Estúdio H2**: `TODA PÓS BOA É INVISÍVEL.`
  Manifesto: `Ninguém aplaude o corte certo. Aplaudem o filme. A gente trabalha exatamente aí: no frame a menos que muda tudo, na cor que segura a cena, no motion que não deixa a atenção cair. Mais de 15 anos, uma equipe diversa, uma regra: nada sai daqui "quase pronto".`
  Big word: `SEM FIRULA.`
- **Clientes label**: `PASSARAM PELA MESA` — marquee: `CVC · TIM · MERCEDES VANS · TENA · AMSTEL · CONMEBOL · ANA MARIA ·`
- **Contato H2**: `VAMOS PÓS-PRODUZIR?`
  Sub: `Manda o bruto. A gente devolve argumento.`
  Canais: `posproducao@seucaveira.com` · `atendimento@seucaveira.com` · `WhatsApp +55 11 94599-1717` · nota: `Link do Vimeo serve. HD a gente combina depois.`
- **Footer**: `SEU CAVEIRA © 2026 — PÓS-PRODUÇÃO · SÃO PAULO` · `VOLTAR AO TOPO ↑` · `O ACERVO COMPLETO EM SEUCAVEIRA.COM/VITRINE`
- 404 (`404.tsx`): `FORA DO AR. O corte ficou bom.` — piada de sala técnica (K95 prova que 404 é peça).

Títulos/SEO: `Seu Caveira — Pós-produção nível caveira | Edição, Cor e Motion`
desc: `Estúdio de pós-produção em São Paulo. Montagem, color grading e motion/VFX para TVC, OOH e digital. O padrão Seu Caveira, sem firula.`

## 4. Motion inventory (GSAP ScrollTrigger + Lenis; tudo `@gsap/react`)

| elemento | trigger | transform | duração | easing | observação |
|---|---|---|---|---|---|
| boot leader | load | contagem 3→2→1 + som de tick NÃO (sem áudio) | 1.9s | none (linear, frame-accurate) | split-wipe de saída |
| split-wipe saída | boot-end | duas metades y ±100% | 0.9s | expo.inOut | revela hero já animado |
| H1 linhas | boot-end | yPercent 110 → 0 clip | 1.15s | power4.out | stagger 0.12 |
| kicker/sub/CTA | boot-end | y 44 + fade | 0.85s | power3.out | stagger 0.08 |
| ticker | sempre | x linear infinito | loop | none | 90px/s desktop |
| scroll cue | idle | y 0→8→0 | 1.6s | sine.inOut | fade-out ao rolar |
| reels frame | pin | reveal-x por scrub | 0.5–1 | none | playhead segue o ponteiro |
| labels LOG/FINAL | scrub | trocam em threshold 0.5 | 0.15s | — | com micro-glitch 80ms |
| acervo cards | enter 85% | y 56 + fade + scale .96 | 0.8s | power3.out | stagger 0.09 |
| card hover | hover | scrub do look 0→1 em 1.6s linear + glitch RGB 2–4px em rajadas de 120ms | — | none | reverso suave 0.3s |
| serviços | pin horizontal | x por painel | scrub 1 | none | entradas internas one-shot `play none none none` |
| processo playhead | scrub | x 0→100% por track | scrub .7 | none | estações acendem em 0.25/0.5/0.75 |
| manifesto | enter | palavra a palavra opacity .18→1 | por scroll | — | sem split-text de biblioteca, reveal por spans |
| marquee | sempre | x linear | loop | none | hover: timeScale→0 em 0.4s power2 |
| contato H2 | enter | clip-path inset 0 100%→0 | 1.1s | expo.out | |
| nav | scroll y>80vh | fundo solid, altura 64→52 | 0.35s | power2 | wipe vertical ao clicar âncora (LaCrapule): overlay 0.45s expo.inOut |
| cursor | mouse | posição lerp .22; rótulo por state | — | — | só `@media (pointer:fine)` |

`prefers-reduced-motion`: boot instantâneo, tudo sem scrub (pins viram seções
empilhadas estáticas, reveal do grade vira botão toggle), marquees parados, cursor nativo.
Conteúdo legível e completo sem animação e sem WebGL.

## 5. Shaders GLSL (100% procedurais — nada remoto)

**A. `grainField` (hero, plano fullscreen R3F)** — fragment: grão de filme (hash
value-noise 3-oitava, tempo em passos de 1/24s para "cadência de projector"),
scanlines 1px por linha de varredura CRT, vinheta, ripple radial na posição do
ponteiro (damping maath), leve aberração cromática senoidal no eixo y, grade de
scope sutil. Vertex: deslocamento de 1–2px por ruído para "respiração" do filme.
uTime congela em reduced-motion (grão estático).

**B. `gradeLook` (reel, plano no frame)** — "footage" procedural por cena: horizonte
de montanhas senoidais + disco de sol + nuvens fbm + prédios/parábola (varia por
seed); modo LOG = curvas flat/low-contrast; modo FINAL = teal & orange lift/gamma/
gain + highlight roll-off + saturação seletiva + glow. UVA de reveal: linha de
split vertical com RGB-shift 3px e borda branca dura. Uniform: `uReveal` (scrub),
`uTime` (sol/nuvens lentos, desliga em reduced-motion).

**C. `cardLook` (acervo, canvas 2D compartilhado, um único shader via mini-renderer
ou canvas2D matemático)** — mesmo gerador do B com 6 presets de look; scrub por
`uProgress` do hover: muda a seed do "take" a cada 0.33s (cortes), glitch de rajada.
Implementação: canvas 2D procedural (rápido, 6 instâncias, só roda em hover) — o
peso WebGL fica em A e B.

**D. Pós-processamento (nos canvases WebGL)** — @react-three/postprocessing:
Bloom(intensity 0.35, luminanceThreshold 0.75) + Noise(opacity 0.06, premultiply) +
Vignette(0.32, 0.55) + ChromaticAberration(offset ±0.0009, só com boost no hover).
R3F: `dpr={[1,1.5]}`, `frameloop="demand"` quando offscreen via IntersectionObserver.

## 6. Stack & arquitetura

Vite + React 19 + TS · @react-three/fiber + drei (Shaders) + @react-three/postprocessing ·
gsap + @gsap/react + ScrollTrigger · lenis (ticker do gsap) · maath · vite-plugin-glsl
(importa `.glsl`). Fontes: @fontsource-variable self-hosted (archivo, space-grotesk).
Sem imagens raster no build (procedural); logo = SVG inline (wordmark SC + caveira
minimal de 6 traços). SEO: index.html com meta/OG/JSON-LD (LocalBusiness real: e-mail
posproducao@, tel +55 11 94599-1717, makesOffer dos 3 serviços reais).
SPA fallback: `404` via rota interna simples (state), sem react-router — âncoras.

Componentes: `Boot, Cursor, Nav, Hero(HeroGrainCanvas), Reel(GradeCanvas+RevealSlider),
Acervo(Card+ScrubCanvas), Services(HorizontalPanels), Process(NleTrack), Manifesto,
Marquee, Contact, Footer, GlitchText, Reveal* hooks (useRevealLines, useStaggerUp)`.

## 7. Critérios de verificação (portões)

1. `verify_build` (awwwards-mcp, Chromium local) build vs `research/reference-replica.html`
   → Dice band-score ≥ 80 por banda construída, perf `fps ≥ 50`, `dropped ≤ 8%`, `longTasks` sem surtos,
   `anti-patterns: 0`.
2. `analyze_page_structure` desktop + `compare:"mobile"`: 9–10 bandas, ordem exata do §2,
   `heightDelta` de banda ≤ ±35%, nenhum `reordered`.
3. `capture_live_site` desktop+mobile: nenhuma banda em branco, preloader limpo no frame.
4. `analyze_scroll_map` (censo de motion): triggers presentes — pin ≥2, scrub ≥3, stagger
   ≥2, easings ⊆ {power3/power4/expo/none/sine} — e `build_motion_manifest` mecezinhado.
5. Console Playwright: ZERO erro — incluindo `THREE.WebGLProgram` (compilação GLSL) e
   `requestfailed`/404. Teste em `file://` do build + URL do preview.
6. Anti-slop audit (subagente adversarial, contexto limpo): checar §1 regras, legibilidade
   do PT-BR (sem os erros do site antigo — "geniáis" não se repete aqui), alt/aria,
   contraste AA (bone/bg ≥ 12:1; dim/bg ≥ 4.6:1), foco visível, reduced-motion real,
   mobile sem overflow horizontal.
7. Performance orçamentária: JS gz ≤ 350KB inicial (R3F em chunk lazy), TTI < 2.5s local,
   fontes subset latin-ext (PT-BR diacríticos).

## 8. Riscos & mitigações

- VM sem WebGL no Chromium headless (documentado) → capturas de verificação exibem o
  fallback CSS dos canvases (canvas vazio + backdrop), DOM/motion/pinning intactos para
  censo; WebGL validado por (a) compilação offline do GLSL via testes de shader no dev,
  (b) zero `WebGLProgram` errors quando WebGL está disponível, (c) preview ao vivo do
  usuário num browser real.
- Fontes Google sem rede → @fontsource no pacote npm (registry liberado).
- ffmpeg: shim `ffmpeg-static` global instalado (path resolvido ✓).
