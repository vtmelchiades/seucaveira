import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useRef } from 'react'
import { liveUniforms, nleActions, useNleState } from '../store/nleStore'

gsap.registerPlugin(ScrollTrigger)

const CLIENTS = [
  {
    name: 'HEINEKEN',
    spec: '4K DCI MASTER // ACEScct // BROADCAST + CINEMA',
    deliveries: '42 COPIAS FINALIZADAS',
  },
  {
    name: 'AMSTEL',
    spec: 'PRORES 4444 XQ // HIGH-SPEED CONFORM // TV ABERTA',
    deliveries: '36 COPIAS FINALIZADAS',
  },
  {
    name: 'SAMSUNG',
    spec: '3D CG COMPOSITE // CLEANUP // GLOBAL CAMPAIGN',
    deliveries: '58 COPIAS FINALIZADAS',
  },
  {
    name: 'GILLETTE VENUS',
    spec: 'BEAUTY GRADE // FLUID VFX // 16:9 + 9:16',
    deliveries: '29 COPIAS FINALIZADAS',
  },
  {
    name: 'TIM',
    spec: 'OPTICAL FLOW // ROTOSCOPIA // NACIONAL',
    deliveries: '64 COPIAS FINALIZADAS',
  },
  {
    name: 'NISSIN',
    spec: 'CORTE SECO 2 FRAMES // VFX STEAM // MULTI-TELA',
    deliveries: '31 COPIAS FINALIZADAS',
  },
  {
    name: 'CVC',
    spec: 'SKY REPLACEMENT // SOL DE DIÁRIA // BROADCAST',
    deliveries: '47 COPIAS FINALIZADAS',
  },
]

export function ProofSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const marqueeTrackRef = useRef<HTMLDivElement>(null)
  const { hoveredClient } = useNleState()

  useGSAP(
    () => {
      const section = sectionRef.current
      if (!section) return

      ScrollTrigger.create({
        trigger: section,
        start: 'top 75%',
        end: 'bottom 25%',
        onUpdate: (self) => {
          liveUniforms.sectionState = 4.0 + self.progress * 0.8
        },
      })
    },
    { scope: sectionRef }
  )

  // Cursor & scroll velocity reactive kinetic marquee driven via rAF
  useEffect(() => {
    const track = marqueeTrackRef.current
    if (!track) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let offset = 0
    let rafId = 0
    const tick = () => {
      const speed = 0.55 + Math.abs(liveUniforms.scrollVelocity) * 0.35 + liveUniforms.mouseVelocity * 0.25
      offset -= speed
      if (offset <= -50) {
        offset += 50
      }
      track.style.transform = `translate3d(${offset.toFixed(2)}%, 0, 0)`
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [])

  const activeClientObj =
    CLIENTS.find((c) => c.name === hoveredClient) || CLIENTS[0]

  return (
    <section
      ref={sectionRef}
      id="proof"
      aria-label="proof"
      className="relative py-28 px-4 sm:px-8 z-10 border-b border-[#18181E] overflow-hidden bg-[#050508]/58"
    >
      <div className="max-w-[1680px] w-full mx-auto">
        {/* Top Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-14">
          <div className="lg:col-span-8">
            <div className="text-xs font-extrabold tracking-[0.22em] uppercase text-[#E5A93C] mb-3">
              PROVA SOCIAL &amp; BASTIDOR // ARQUIVO DE MASTERS
            </div>
            <h2 className="font-display uppercase text-[#F4F4F5] text-[clamp(2.3rem,4.9vw,5.4rem)] leading-[0.93] tracking-[-0.03em] font-extrabold">
              Quem já deixou o bruto na nossa mão e dormiu em paz.
            </h2>
          </div>

          <div className="lg:col-span-4 bg-[#08080C] border border-[#22222B] p-4 tabular-nums">
            <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#E11D48]">
              TELEMETRIA DE ENTREGA // {activeClientObj.name}
            </div>
            <div className="text-xs font-bold text-[#F4F4F5] mt-1">
              {activeClientObj.spec}
            </div>
            <div className="text-[11px] text-[#E5A93C] font-semibold mt-0.5">
              {activeClientObj.deliveries}
            </div>
          </div>
        </div>

        {/* Kinetic Brutalist Marquee Strip */}
        <div className="border-y border-[#24242E] bg-[#060609] py-5 mb-12 overflow-hidden">
          <div
            ref={marqueeTrackRef}
            className="flex items-center whitespace-nowrap w-[200%]"
          >
            {[0, 1].map((dup) => (
              <div
                key={dup}
                className="flex items-center justify-around w-1/2 gap-8 px-4"
              >
                {CLIENTS.map((client) => (
                  <span
                    key={`${dup}-${client.name}`}
                    onMouseEnter={() => {
                      nleActions.setHoveredClient(client.name)
                      liveUniforms.mouseVelocity = 1.6
                    }}
                    className="inline-flex items-center gap-8 font-display text-2xl sm:text-4xl font-extrabold tracking-[-0.02em] uppercase text-[#EAEAEA] hover:text-[#E5A93C] cursor-crosshair transition-colors duration-150"
                  >
                    <span>{client.name}</span>
                    <span className="text-[#E11D48] text-xl">·</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Brutalist Client Matrix (Asymmetric 7-Brand Architectural Strip) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 border-t border-l border-[#22222C] mb-20">
          {CLIENTS.map((client) => {
            const isHovered = hoveredClient === client.name
            return (
              <button
                key={client.name}
                type="button"
                onMouseEnter={() => {
                  nleActions.setHoveredClient(client.name)
                  liveUniforms.mouseVelocity = 1.4
                }}
                onClick={() => {
                  nleActions.setHoveredClient(client.name)
                  liveUniforms.targetScrollVelocity = 3.0
                }}
                className={`p-5 text-left border-r border-b border-[#22222C] cursor-pointer transition-colors duration-150 ${
                  isHovered
                    ? 'bg-[#15110B] text-[#E5A93C]'
                    : 'bg-[#07070A]/85 text-[#EAEAEA] hover:bg-[#0D0D12]'
                }`}
              >
                <div className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#7A7A85] tabular-nums">
                  MASTER VERIFIED
                </div>
                <div className="font-display text-lg sm:text-xl font-extrabold uppercase tracking-tight mt-2">
                  {client.name}
                </div>
                <div className="text-[10px] font-semibold tracking-wider uppercase text-[#9CA3AF] mt-2 truncate">
                  {client.deliveries}
                </div>
              </button>
            )
          })}
        </div>

        {/* Three Pillars in an Asymmetric 12-Column Architectural Grid (5 / 4 / 3 spans with vertical offsets — never 3 equal columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Pillar 1: 5 Columns */}
          <article className="lg:col-span-5 p-8 sm:p-10 bg-[#07070A] border-t-4 border-t-[#E11D48] border-x border-b border-[#1E1E28]">
            <div className="text-[11px] font-extrabold tracking-[0.2em] uppercase text-[#E11D48] mb-3">
              COMPROMISSO DE ENTREGA
            </div>
            <h3 className="font-display text-2xl sm:text-3xl font-extrabold uppercase text-[#F4F4F5] tracking-tight mb-3">
              Prazo é cláusula pétrea:
            </h3>
            <p className="text-base sm:text-lg leading-[1.55] text-[#D4D4D8]">
              Sem desculpa criativa. O arquivo sobe na hora combinada.
            </p>
          </article>

          {/* Pillar 2: 4 Columns with Vertical Step */}
          <article className="lg:col-span-4 lg:mt-10 p-8 sm:p-10 bg-[#07070A] border-t-4 border-t-[#E5A93C] border-x border-b border-[#1E1E28]">
            <div className="text-[11px] font-extrabold tracking-[0.2em] uppercase text-[#E5A93C] mb-3">
              PROTOCOLO DE SEGURANÇA
            </div>
            <h3 className="font-display text-2xl sm:text-3xl font-extrabold uppercase text-[#F4F4F5] tracking-tight mb-3">
              Sigilo de cofre:
            </h3>
            <p className="text-base sm:text-lg leading-[1.55] text-[#D4D4D8]">
              Seu filme inédito não vaza antes da estreia.
            </p>
          </article>

          {/* Pillar 3: 3 Columns with Deep Vertical Step */}
          <article className="lg:col-span-3 lg:mt-20 p-8 sm:p-10 bg-[#07070A] border-t-4 border-t-[#EAEAEA] border-x border-b border-[#1E1E28]">
            <div className="text-[11px] font-extrabold tracking-[0.2em] uppercase text-[#A1A1AA] mb-3">
              LINHA DIRETA NA ILHA
            </div>
            <h3 className="font-display text-2xl sm:text-3xl font-extrabold uppercase text-[#F4F4F5] tracking-tight mb-3">
              Sem telefone sem fio:
            </h3>
            <p className="text-base sm:text-lg leading-[1.55] text-[#D4D4D8]">
              Você fala direto com quem está com a sua timeline aberta.
            </p>
          </article>
        </div>
      </div>
    </section>
  )
}
