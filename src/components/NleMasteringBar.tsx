import { useEffect, useState } from 'react'
import { formatTimecode24, liveUniforms, nleActions, useNleState } from '../store/nleStore'

export function NleMasteringBar() {
  const { rawCutMode, aspectGuide, finalGradeMode, vfxMode } = useNleState()
  const [timecode, setTimecode] = useState('00:00:14:22')
  const [scrollPct, setScrollPct] = useState(0)

  useEffect(() => {
    // 24fps real-time timecode clock (1000ms / 24 = 41.666ms)
    const interval = window.setInterval(() => {
      liveUniforms.timecodeFrames += 1
      setTimecode(formatTimecode24(liveUniforms.timecodeFrames))
      setScrollPct(Math.round(liveUniforms.scrollProgress * 100))
    }, 1000 / 24)

    return () => window.clearInterval(interval)
  }, [])

  return (
    <aside
      id="nle-mastering-bar"
      aria-label="NLE Mastering Timeline Control Bar"
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#060608] border-t border-[#22222A] select-none"
    >
      {/* Top Playhead Scrub Ruler across the full viewport width */}
      <div className="relative h-1.5 w-full bg-[#0E0E12] overflow-hidden">
        <div
          className="h-full bg-[#E11D48]"
          style={{
            width: `${Math.max(2, scrollPct)}%`,
            transition: 'width 80ms linear',
          }}
        />
      </div>

      <div className="max-w-[1680px] mx-auto px-3 sm:px-6 py-2 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2">
        {/* Left: Real 24fps Master Timecode + NLE Transport Status */}
        <div className="flex items-center justify-between lg:justify-start gap-4 border-b lg:border-b-0 border-[#1A1A20] pb-1.5 lg:pb-0">
          <div className="flex items-center gap-2.5 bg-[#0A0A0D] border border-[#24242C] px-3 py-1.5">
            <span
              className="w-2 h-2 bg-[#E11D48] inline-block"
              aria-hidden="true"
            />
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#8E8E98] font-semibold">
              TC 24FPS
            </span>
            <output
              id="nle-timecode"
              data-testid="nle-timecode"
              className="text-sm sm:text-base font-bold tracking-[0.12em] text-[#EAEAEA] tabular-nums"
            >
              {timecode}
            </output>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-[10px] tracking-[0.18em] uppercase text-[#7A7A85] font-semibold tabular-nums">
            <span>MASTER BUS // 4K DCI</span>
            <span className="text-[#2E2E38]">|</span>
            <span> TIMELINE {String(scrollPct).padStart(3, '0')}%</span>
          </div>
        </div>

        {/* Center/Right: 3 Interactive NLE Shader State Switches */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 flex-1 lg:max-w-4xl">
          {/* Switch 1: v37_final_FINAL.mov (Modo RAW/Corte) */}
          <button
            type="button"
            id="btn-raw-cut"
            data-testid="btn-raw-cut"
            aria-pressed={rawCutMode}
            onClick={() => nleActions.toggleRawCut()}
            className={`group text-left px-3 py-1.5 border cursor-pointer flex items-center justify-between gap-2 ${
              rawCutMode
                ? 'bg-[#17130A] border-[#E5A93C] text-[#EAEAEA]'
                : 'bg-[#0B0B0E] border-[#22222A] text-[#A1A1AA] hover:border-[#3F3F4A] hover:text-[#EAEAEA]'
            }`}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={`w-1.5 h-1.5 inline-block ${
                    rawCutMode ? 'bg-[#E5A93C]' : 'bg-[#3F3F46]'
                  }`}
                />
                <span className="text-xs font-bold tracking-wider text-[#EAEAEA] truncate">
                  v37_final_FINAL.mov
                </span>
              </div>
              <div className="text-[10px] tracking-[0.14em] uppercase text-[#8A8A94] truncate mt-0.5">
                {rawCutMode
                  ? `MODO RAW/CORTE · ${aspectGuide} + TRACK`
                  : 'MODO RAW/CORTE · GUIAS OFF'}
              </div>
            </div>
            <span
              className={`px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest border ${
                rawCutMode
                  ? 'bg-[#E5A93C] text-[#040404] border-[#E5A93C]'
                  : 'bg-[#121216] text-[#71717A] border-[#27272A]'
              }`}
            >
              {rawCutMode ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Switch 2: cor_aprovada_cliente2.grade (Toggle Log C vs. Final Grade) */}
          <button
            type="button"
            id="btn-color-grade"
            data-testid="btn-color-grade"
            aria-pressed={finalGradeMode}
            onClick={() => nleActions.toggleFinalGrade()}
            className={`group text-left px-3 py-1.5 border cursor-pointer flex items-center justify-between gap-2 ${
              finalGradeMode
                ? 'bg-[#16090D] border-[#E11D48] text-[#EAEAEA]'
                : 'bg-[#1E201F] border-[#9CA3AF] text-[#EAEAEA]'
            }`}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={`w-1.5 h-1.5 inline-block ${
                    finalGradeMode ? 'bg-[#E11D48]' : 'bg-[#9CA3AF]'
                  }`}
                />
                <span className="text-xs font-bold tracking-wider text-[#EAEAEA] truncate">
                  cor_aprovada_cliente2.grade
                </span>
              </div>
              <div className="text-[10px] tracking-[0.14em] uppercase text-[#A1A1AA] truncate mt-0.5">
                {finalGradeMode
                  ? 'PADRÃO SEU CAVEIRA · 35MM'
                  : 'SEM PÓS / CÂMERA BRUTA LOG-C'}
              </div>
            </div>
            <span
              className={`px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest border ${
                finalGradeMode
                  ? 'bg-[#E11D48] text-[#EAEAEA] border-[#E11D48]'
                  : 'bg-[#9CA3AF] text-[#040404] border-[#9CA3AF]'
              }`}
            >
              {finalGradeMode ? 'GRADE' : 'LOG-C'}
            </span>
          </button>

          {/* Switch 3: motion_AGORA_VAI.aep (Modo VFX/Rotoscopia) */}
          <button
            type="button"
            id="btn-vfx-mode"
            data-testid="btn-vfx-mode"
            aria-pressed={vfxMode}
            onClick={() => nleActions.toggleVfxMode()}
            className={`group text-left px-3 py-1.5 border cursor-pointer flex items-center justify-between gap-2 ${
              vfxMode
                ? 'bg-[#190D12] border-[#E11D48] text-[#EAEAEA]'
                : 'bg-[#0B0B0E] border-[#22222A] text-[#A1A1AA] hover:border-[#3F3F4A] hover:text-[#EAEAEA]'
            }`}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={`w-1.5 h-1.5 inline-block ${
                    vfxMode ? 'bg-[#E11D48]' : 'bg-[#3F3F46]'
                  }`}
                />
                <span className="text-xs font-bold tracking-wider text-[#EAEAEA] truncate">
                  motion_AGORA_VAI.aep
                </span>
              </div>
              <div className="text-[10px] tracking-[0.14em] uppercase text-[#8A8A94] truncate mt-0.5">
                {vfxMode
                  ? 'VFX/ROTOSCOPIA · VETORES ATIVOS'
                  : 'MODO VFX/ROTOSCOPIA · BYPASS'}
              </div>
            </div>
            <span
              className={`px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest border ${
                vfxMode
                  ? 'bg-[#E11D48] text-[#EAEAEA] border-[#E11D48]'
                  : 'bg-[#121216] text-[#71717A] border-[#27272A]'
              }`}
            >
              {vfxMode ? 'VFX' : 'OFF'}
            </span>
          </button>
        </div>
      </div>
    </aside>
  )
}
