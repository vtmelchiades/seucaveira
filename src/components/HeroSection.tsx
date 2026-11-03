import { nleActions, useNleState } from '../store/nleStore'

export function HeroSection() {
  const { finalGradeMode, rawCutMode, vfxMode } = useNleState()

  return (
    <section
      id="hero"
      aria-label="hero"
      className="relative min-h-[calc(100vh-4rem)] pt-24 pb-24 px-4 sm:px-8 flex flex-col justify-between z-10 border-b border-[#18181E] bg-[#040404]/22"
    >
      <div className="max-w-[1680px] w-full mx-auto flex-1 flex flex-col justify-center">
        {/* Top Editorial Strip */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#1E1E26] pb-3">
          <div className="flex items-center gap-3 text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#A1A1AA] tabular-nums">
            <span className="w-2.5 h-2.5 bg-[#E11D48] inline-block" />
            <span>SALA ESCURA MASTERING SUITE // DI &amp; VFX</span>
          </div>
          <div className="text-[11px] sm:text-xs font-semibold tracking-[0.18em] uppercase text-[#8A8A94] tabular-nums hidden sm:block">
            {finalGradeMode
              ? 'COLOR PIPELINE: ACEScct 35MM FILM PRINT'
              : 'COLOR PIPELINE: BYPASSED (ARRI LOG-C RAW SENSOR)'}
          </div>
        </div>

        {/* Asymmetric 12-Column Grid (8 cols Condensed Brutalist Display + 4 cols Subcopy & Telemetry) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-end">
          <div className="lg:col-span-8">
            <h1
              data-gsap="hero-title"
              className="font-display uppercase text-[#F4F4F5] text-[clamp(2.45rem,5.8vw,6.4rem)] leading-[0.95] tracking-[0.01em] font-normal"
            >
              O diretor filma o que aconteceu. A gente decide o que o público vai lembrar.
            </h1>
          </div>

          <div className="lg:col-span-4 flex flex-col justify-between gap-6 border-l-2 border-[#E11D48] pl-5 py-2 bg-[#060608]/85">
            <p
              data-gsap="hero-sub"
              className="text-sm sm:text-base lg:text-lg leading-[1.52] text-[#D4D4D8] font-normal"
            >
              Pós-produção audiovisual para quem sabe que comercial morre ou vira clássico na sala escura. Quinze anos salvando diárias, limpando o impossível e entregando no prazo que juraram não existir.
            </p>

            {/* Live Pipeline Node Readout */}
            <div className="border-t border-[#1F1F27] pt-3 grid grid-cols-2 gap-4 text-[10px] sm:text-[11px] uppercase tracking-[0.15em] text-[#9CA3AF] tabular-nums">
              <div>
                <div className="text-[#6E6E77]">CONFORM / CORTE</div>
                <div className="text-[#EAEAEA] font-bold mt-0.5">
                  {rawCutMode ? 'RAW EDL + GUIDES' : 'LOCKED 24FPS'}
                </div>
              </div>
              <div>
                <div className="text-[#6E6E77]">VFX / ROTOSCOPIA</div>
                <div className="text-[#EAEAEA] font-bold mt-0.5">
                  {vfxMode ? 'OPTICAL MESH ON' : 'CLEAN PLATE'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Instruction Prompt */}
        <div className="mt-8 pt-6 border-t border-[#1A1A22] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => nleActions.toggleFinalGrade()}
            className={`text-left px-3.5 py-2.5 border text-[11px] sm:text-xs font-bold tracking-[0.14em] uppercase cursor-pointer transition-colors duration-200 ${
              finalGradeMode
                ? 'bg-[#0B0B0E] border-[#E5A93C] text-[#E5A93C] hover:bg-[#E5A93C] hover:text-[#040404]'
                : 'bg-[#E11D48] border-[#E11D48] text-[#EAEAEA] hover:bg-[#EAEAEA] hover:text-[#040404]'
            }`}
          >
            [ DESLIGUE O GRADING NA TIMELINE ABAIXO PARA VER COMO O SEU FILME CHEGA DO SET ]
          </button>

          <div className="flex items-center gap-3 text-[11px] tracking-[0.18em] uppercase text-[#8E8E98] font-semibold">
            <span>SCROLL PARA ENTRAR NA ILHA</span>
            <span className="text-[#E5A93C] font-bold">↓</span>
          </div>
        </div>
      </div>
    </section>
  )
}
