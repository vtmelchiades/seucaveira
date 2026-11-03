import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useRef, useState } from 'react'
import { liveUniforms, nleActions, useNleState } from '../store/nleStore'

gsap.registerPlugin(ScrollTrigger)

export function CraftSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const { craftIndex, colorTempOffset, vfxMode, rawCutMode } = useNleState()
  const [cutFormat, setCutFormat] = useState<'60s' | '30s' | '15s' | '9:16'>('30s')

  useGSAP(
    () => {
      const section = sectionRef.current
      if (!section) return

      ScrollTrigger.create({
        trigger: section,
        start: 'top 70%',
        end: 'bottom 30%',
        onUpdate: (self) => {
          liveUniforms.sectionState = 3.0 + self.progress * 1.2
        },
      })

      const panels = section.querySelectorAll('[data-craft-panel]')
      panels.forEach((panel, index) => {
        ScrollTrigger.create({
          trigger: panel,
          start: 'top 62%',
          end: 'bottom 38%',
          onEnter: () => nleActions.setCraftIndex(index),
          onEnterBack: () => nleActions.setCraftIndex(index),
        })

        gsap.fromTo(
          panel,
          { opacity: 0.25, y: 42 },
          {
            opacity: 1,
            y: 0,
            ease: 'expo.out',
            duration: 0.9,
            scrollTrigger: {
              trigger: panel,
              start: 'top 82%',
              end: 'top 42%',
              scrub: 1,
            },
          }
        )
      })
    },
    { scope: sectionRef }
  )

  return (
    <section
      ref={sectionRef}
      id="craft"
      aria-label="craft"
      className="relative py-28 px-4 sm:px-8 z-10 border-b border-[#18181E] bg-[#060609]/52"
    >
      <div className="max-w-[1680px] w-full mx-auto space-y-24">
        {/* Top Section Header with Active Shader State Indicator */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1F1F28] pb-5">
          <div className="text-xs font-extrabold tracking-[0.22em] uppercase text-[#E11D48]">
            ESPECIALIDADES DE PÓS-PRODUÇÃO // ARQUITETURA DE FINALIZAÇÃO
          </div>
          <div className="text-xs font-bold tracking-[0.18em] uppercase text-[#E5A93C]">
            SHADER STATE:{' '}
            {craftIndex === 0
              ? 'RAZOR SLICE FIELD [CORTE & MONTAGEM]'
              : craftIndex === 1
                ? 'SPECTRAL DISPERSION [COLOR GRADING]'
                : 'OPTICAL VECTOR MESH [MOTION, 3D & VFX]'}
          </div>
        </div>

        {/* Specialty 1: Corte & Montagem (Asymmetric 8 / 4 Split) */}
        <article
          data-craft-panel
          onMouseEnter={() => nleActions.setCraftIndex(0)}
          className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 p-8 sm:p-12 border transition-colors duration-300 ${
            craftIndex === 0
              ? 'bg-[#07070A]/90 border-[#E5A93C]'
              : 'bg-[#060608]/80 border-[#1D1D25]'
          }`}
        >
          <div className="lg:col-span-8 space-y-6">
            <div className="inline-block px-3 py-1 bg-[#14110A] border border-[#E5A93C] text-xs font-extrabold tracking-[0.2em] uppercase text-[#E5A93C]">
              Corte &amp; Montagem
            </div>

            <h3 className="font-display uppercase text-[#F4F4F5] text-[clamp(2rem,4.1vw,4.3rem)] leading-[0.95] tracking-[-0.025em] font-extrabold">
              A ilha de edição é o único tribunal onde cortar o ego melhora o filme.
            </h3>

            <p className="text-base sm:text-xl leading-[1.55] text-[#D4D4D8] max-w-3xl">
              Ritmo não se explica em call de alinhamento. Ou o corte respira na música, ou a peça morre antes do logo aparecer. Do filme de 60 segundos para TV aberta ao corte vertical que segura retenção no braço.
            </p>
          </div>

          {/* Interactive Razor Cut Console */}
          <div className="lg:col-span-4 flex flex-col justify-between bg-[#0A0A0E] border border-[#22222B] p-6">
            <div>
              <div className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#8E8E98] mb-3">
                SIMULADOR DE DECUPAGEM &amp; FORMATO
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { id: '60s', label: '60s TV ABERTA', frames: '1440 FR' },
                    { id: '30s', label: '30s MASTER', frames: '720 FR' },
                    { id: '15s', label: '15s RETENÇÃO', frames: '360 FR' },
                    { id: '9:16', label: 'CORTE VERTICAL', frames: '9:16 LOCK' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setCutFormat(item.id)
                      nleActions.setCraftIndex(0)
                      liveUniforms.targetScrollVelocity = 4.5
                      if (item.id === '9:16') {
                        nleActions.setAspectGuide('9:16')
                      }
                    }}
                    className={`p-3 text-left border cursor-pointer ${
                      cutFormat === item.id
                        ? 'bg-[#E5A93C] text-[#040404] border-[#E5A93C]'
                        : 'bg-[#0E0E14] text-[#D4D4D8] border-[#252530] hover:border-[#E5A93C]'
                    }`}
                  >
                    <div className="text-xs font-extrabold uppercase tracking-wider">
                      {item.label}
                    </div>
                    <div className="text-[10px] font-semibold uppercase tracking-widest opacity-80 tabular-nums mt-0.5">
                      {item.frames}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#1E1E28] flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#9CA3AF]">
                GUIAS DE CORTE NO VIEWPORT
              </span>
              <button
                type="button"
                onClick={() => nleActions.toggleRawCut()}
                className="px-3 py-1 bg-[#14141C] border border-[#2F2F3B] text-xs font-bold uppercase tracking-wider text-[#E5A93C] hover:bg-[#E5A93C] hover:text-[#040404] cursor-pointer"
              >
                {rawCutMode ? 'DESATIVAR GUIAS' : 'ATIVAR GUIAS +'}
              </button>
            </div>
          </div>
        </article>

        {/* Specialty 2: Color Grading & Finalização (Asymmetric 5 / 7 Offset) */}
        <article
          data-craft-panel
          onMouseEnter={() => nleActions.setCraftIndex(1)}
          className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 p-8 sm:p-12 border transition-colors duration-300 ${
            craftIndex === 1
              ? 'bg-[#07070A]/90 border-[#E11D48]'
              : 'bg-[#060608]/80 border-[#1D1D25]'
          }`}
        >
          {/* Left 5 Cols: Interactive Colorist Kelvin / Sol de São Pedro Wheel */}
          <div className="lg:col-span-5 order-2 lg:order-1 flex flex-col justify-between bg-[#0A0A0E] border border-[#22222B] p-6">
            <div>
              <div className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#8E8E98] mb-3">
                TEMPERATURA DE COR NO SHADER // CIÊNCIA ACEScct
              </div>
              <div className="space-y-2">
                {[
                  {
                    val: 1,
                    title: 'SOL QUE SÃO PEDRO NEGOU (+5600K GOLDEN)',
                    desc: 'Luz dramática dourada de fim de tarde injetada no shader',
                  },
                  {
                    val: 0,
                    title: 'PADRÃO SALA ESCURA (NEUTRO ANAMÓRFICO)',
                    desc: 'Preto #040404 absoluto + contraste de película 35mm',
                  },
                  {
                    val: -1,
                    title: 'TUNGSTÊNIO NOTURNO (-3200K TENSION)',
                    desc: 'Separação ciano-âmbar de cinema noturno',
                  },
                ].map((preset) => (
                  <button
                    key={preset.title}
                    type="button"
                    onClick={() => {
                      nleActions.setCraftIndex(1)
                      nleActions.setFinalGrade(true)
                      nleActions.setColorTempOffset(preset.val)
                    }}
                    className={`w-full p-3 text-left border cursor-pointer ${
                      colorTempOffset === preset.val
                        ? 'bg-[#190B10] border-[#E11D48] text-[#F4F4F5]'
                        : 'bg-[#0E0E14] border-[#252530] text-[#A1A1AA] hover:text-[#F4F4F5]'
                    }`}
                  >
                    <div className="text-xs font-extrabold tracking-wider uppercase text-[#EAEAEA]">
                      {preset.title}
                    </div>
                    <div className="text-[11px] text-[#8E8E98] mt-0.5">
                      {preset.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#1E1E28] flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.15em] text-[#E5A93C] tabular-nums">
              <span>DELIVERY: REC.709 / DCI-P3 / HDR10</span>
              <span>35MM GRAIN LOCK</span>
            </div>
          </div>

          <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
            <div className="inline-block px-3 py-1 bg-[#190A0E] border border-[#E11D48] text-xs font-extrabold tracking-[0.2em] uppercase text-[#E11D48]">
              Color Grading &amp; Finalização
            </div>

            <h3 className="font-display uppercase text-[#F4F4F5] text-[clamp(2rem,4.1vw,4.3rem)] leading-[0.95] tracking-[-0.025em] font-extrabold">
              Meio tom separa um filme de cinema de um vídeo de churrasco.
            </h3>

            <p className="text-base sm:text-xl leading-[1.55] text-[#D4D4D8] max-w-3xl">
              A cor decide a temperatura emocional da cena antes do ator abrir a boca. Grading com ciência de cor de cinema, conform impecável e entrega masterizada para broadcast, telão 4K ou web. A gente coloca o sol que São Pedro negou na diária.
            </p>
          </div>
        </article>

        {/* Specialty 3: Motion, 3D & VFX (Asymmetric 7 / 5 Split) */}
        <article
          data-craft-panel
          onMouseEnter={() => nleActions.setCraftIndex(2)}
          className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 p-8 sm:p-12 border transition-colors duration-300 ${
            craftIndex === 2
              ? 'bg-[#07070A]/90 border-[#EAEAEA]'
              : 'bg-[#060608]/80 border-[#1D1D25]'
          }`}
        >
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-block px-3 py-1 bg-[#121217] border border-[#EAEAEA] text-xs font-extrabold tracking-[0.2em] uppercase text-[#EAEAEA]">
              Motion, 3D &amp; VFX
            </div>

            <h3 className="font-display uppercase text-[#F4F4F5] text-[clamp(2rem,4.1vw,4.3rem)] leading-[0.95] tracking-[-0.025em] font-extrabold">
              O melhor efeito visual é aquele que o cliente jura que já estava lá no set.
            </h3>

            <p className="text-base sm:text-xl leading-[1.55] text-[#D4D4D8] max-w-3xl">
              Rotoscopia cirúrgica, limpeza de rig, chroma key sem borda verde, simulação e tipografia com peso físico. Se elogiarem a computação gráfica, a gente errou. Se acreditarem na cena, o trabalho está feito.
            </p>
          </div>

          {/* Interactive VFX Wireframe / Clean Plate Inspector */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-[#0A0A0E] border border-[#22222B] p-6">
            <div>
              <div className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#8E8E98] mb-3">
                PIPELINE NUKE / FLAME // COMPOSITING NODES
              </div>
              <div className="grid grid-cols-2 gap-2.5 text-xs font-bold uppercase tracking-wider">
                <div className="p-3 bg-[#0E0E14] border border-[#24242E]">
                  <div className="text-[#E11D48] text-[10px]">NODE_A</div>
                  <div className="text-[#EAEAEA] mt-1">ROTOSCOPIA SUB-PIXEL</div>
                </div>
                <div className="p-3 bg-[#0E0E14] border border-[#24242E]">
                  <div className="text-[#E5A93C] text-[10px]">NODE_B</div>
                  <div className="text-[#EAEAEA] mt-1">LIMPEZA DE RIG &amp; CABO</div>
                </div>
                <div className="p-3 bg-[#0E0E14] border border-[#24242E]">
                  <div className="text-[#E5A93C] text-[10px]">NODE_C</div>
                  <div className="text-[#EAEAEA] mt-1">DESPILL CHROMA KEY</div>
                </div>
                <div className="p-3 bg-[#0E0E14] border border-[#24242E]">
                  <div className="text-[#E11D48] text-[10px]">NODE_D</div>
                  <div className="text-[#EAEAEA] mt-1">3D MATCHMOVE CAMERA</div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#1E1E28] flex items-center justify-between gap-4">
              <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#9CA3AF]">
                MALHA DE VETORES CINÉTICOS
              </span>
              <button
                type="button"
                onClick={() => {
                  nleActions.setCraftIndex(2)
                  nleActions.toggleVfxMode()
                }}
                className={`px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider border cursor-pointer ${
                  vfxMode
                    ? 'bg-[#E11D48] text-[#EAEAEA] border-[#E11D48]'
                    : 'bg-[#14141C] text-[#EAEAEA] border-[#2F2F3B] hover:border-[#E11D48]'
                }`}
              >
                {vfxMode ? 'DESATIVAR MALHA VFX' : 'INSPECIONAR VETORES VFX'}
              </button>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}
