import { useEffect, useRef } from 'react'
import { liveUniforms, nleActions, useNleState } from '../store/nleStore'

export function ViewportOverlays() {
  const { rawCutMode, aspectGuide, finalGradeMode, vfxMode } = useNleState()
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null)
  const vfxCanvasRef = useRef<HTMLCanvasElement>(null)

  // Live ARRI Log-C vs ACES Final Grade Waveform/Histogram Scope
  useEffect(() => {
    const canvas = waveformCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let rafId = 0
    let t = 0
    const drawScope = () => {
      t += 0.04
      const w = canvas.width
      const h = canvas.height
      ctx.fillStyle = '#08080A'
      ctx.fillRect(0, 0, w, h)

      // IRE Graticule lines (0, 25, 50, 75, 100 IRE)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)'
      ctx.lineWidth = 1
      for (let i = 1; i < 5; i++) {
        const y = (h / 5) * i
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.stroke()
      }

      // Draw simulated Luma Waveform & RGB Parade
      const isGraded = finalGradeMode
      for (let x = 0; x < w; x += 2) {
        const nx = x / w
        const wave =
          Math.sin(nx * 8.0 + t + liveUniforms.scrollProgress * 5.0) * 0.35 +
          Math.cos(nx * 19.0 - t * 1.4) * 0.2

        if (!isGraded) {
          // Compressed Log-C band clustered in mid-IRE (35% - 68% IRE)
          const centerY = h * (0.52 - wave * 0.16)
          ctx.fillStyle = 'rgba(168, 178, 170, 0.55)'
          ctx.fillRect(x, centerY - 8, 1.5, 16)
          ctx.fillStyle = 'rgba(210, 220, 212, 0.85)'
          ctx.fillRect(x, centerY - 2, 1.5, 4)
        } else {
          // Full-dynamic-range S-curve spread (0% toe to 98% specular peak)
          const spreadY = h * (0.5 - Math.tanh(wave * 2.4) * 0.44)
          ctx.fillStyle = 'rgba(229, 169, 60, 0.45)'
          ctx.fillRect(x, spreadY - 14, 1.5, 28)
          ctx.fillStyle = 'rgba(225, 29, 72, 0.7)'
          ctx.fillRect(x, h * 0.88 - Math.abs(wave) * 18, 1.5, 6)
        }
      }

      // Transfer curve line
      ctx.beginPath()
      ctx.strokeStyle = isGraded ? '#E5A93C' : '#9CA3AF'
      ctx.lineWidth = 2
      for (let x = 0; x <= w; x += 4) {
        const u = x / w
        let v: number
        if (!isGraded) {
          // Flat logarithmic sensor curve
          v = 0.28 + Math.log(1 + u * 4.5) / Math.log(5.5) * 0.42
        } else {
          // High-contrast S-curve
          v = u * u * (3 - 2 * u)
        }
        const y = h - v * (h - 12) - 6
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()

      rafId = requestAnimationFrame(drawScope)
    }

    rafId = requestAnimationFrame(drawScope)
    return () => cancelAnimationFrame(rafId)
  }, [finalGradeMode])

  // Kinetic Vector Mesh + Rotoscoping Spline Overlay when motion_AGORA_VAI.aep is active
  useEffect(() => {
    if (!vfxMode) return
    const canvas = vfxCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize, { passive: true })

    let rafId = 0
    let phase = 0
    const renderVfx = () => {
      phase += 0.05
      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      const mx = (liveUniforms.mouseX * 0.5 + 0.5) * w
      const my = (-liveUniforms.mouseY * 0.5 + 0.5) * h
      const vel = liveUniforms.mouseVelocity

      // 1. Kinetic Velocity Vector Grid
      const step = 72
      ctx.lineWidth = 1
      for (let x = step / 2; x < w; x += step) {
        for (let y = step / 2; y < h; y += step) {
          const dx = mx - x
          const dy = my - y
          const dist = Math.hypot(dx, dy)
          const pull = Math.max(0, 1 - dist / 420)
          if (pull <= 0.02) continue

          const angle = Math.atan2(dy, dx) + Math.sin(phase + dist * 0.015) * 0.35
          const len = 8 + pull * (26 + vel * 24)
          const ex = x + Math.cos(angle) * len
          const ey = y + Math.sin(angle) * len

          ctx.strokeStyle =
            pull > 0.45
              ? `rgba(225, 29, 72, ${0.25 + pull * 0.65})`
              : `rgba(229, 169, 60, ${0.15 + pull * 0.45})`
          ctx.beginPath()
          ctx.moveTo(x, y)
          ctx.lineTo(ex, ey)
          ctx.stroke()

          // Vector vertex handle
          ctx.fillStyle = pull > 0.5 ? '#E11D48' : '#E5A93C'
          ctx.fillRect(ex - 1.5, ey - 1.5, 3, 3)
        }
      }

      // 2. Rotoscoping Bezier Spline Rig around Cursor
      const numPts = 8
      const baseRadius = 68 + vel * 28
      const pts: Array<{ x: number; y: number; tx: number; ty: number }> = []
      for (let i = 0; i < numPts; i++) {
        const a = (i / numPts) * Math.PI * 2 + phase * 0.4
        const r = baseRadius + Math.sin(a * 3 + phase * 2) * (12 + vel * 18)
        const px = mx + Math.cos(a) * r
        const py = my + Math.sin(a) * r
        const ta = a + Math.PI * 0.5
        pts.push({
          x: px,
          y: py,
          tx: Math.cos(ta) * 22,
          ty: Math.sin(ta) * 22,
        })
      }

      ctx.strokeStyle = 'rgba(225, 29, 72, 0.85)'
      ctx.lineWidth = 1.25
      ctx.beginPath()
      pts.forEach((pt, idx) => {
        if (idx === 0) ctx.moveTo(pt.x, pt.y)
        else ctx.lineTo(pt.x, pt.y)
      })
      ctx.closePath()
      ctx.stroke()

      // Draw Bezier control handles & vertex coordinates
      pts.forEach((pt, idx) => {
        ctx.strokeStyle = 'rgba(229, 169, 60, 0.7)'
        ctx.beginPath()
        ctx.moveTo(pt.x - pt.tx, pt.y - pt.ty)
        ctx.lineTo(pt.x + pt.tx, pt.y + pt.ty)
        ctx.stroke()

        ctx.fillStyle = '#040404'
        ctx.strokeStyle = '#E11D48'
        ctx.fillRect(pt.x - 3, pt.y - 3, 6, 6)
        ctx.strokeRect(pt.x - 3, pt.y - 3, 6, 6)

        if (idx % 2 === 0) {
          ctx.fillStyle = 'rgba(234, 234, 234, 0.75)'
          ctx.font = '600 9px "Space Grotesk", sans-serif'
          ctx.fillText(`V${idx}[${Math.round(pt.x)},${Math.round(pt.y)}]`, pt.x + 8, pt.y - 6)
        }
      })

      rafId = requestAnimationFrame(renderVfx)
    }

    rafId = requestAnimationFrame(renderVfx)
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
    }
  }, [vfxMode])

  return (
    <>
      {/* 1. RAW CUT MODE OVERLAY (v37_final_FINAL.mov): Aspect Ratio Guides + Tracking Markers (+) */}
      {rawCutMode && (
        <div
          id="raw-cut-overlay"
          data-testid="raw-cut-overlay"
          className="fixed inset-0 pointer-events-none z-40 overflow-hidden"
        >
          {/* Aspect Ratio Matte Bars */}
          {aspectGuide === '2.39:1' && (
            <>
              <div className="absolute top-0 left-0 right-0 h-[13vh] bg-[#040404]/85 border-b border-[#E5A93C]/50" />
              <div className="absolute bottom-0 left-0 right-0 h-[13vh] bg-[#040404]/85 border-t border-[#E5A93C]/50" />
            </>
          )}
          {aspectGuide === '16:9' && (
            <div className="absolute inset-6 border border-[#E5A93C]/45" />
          )}
          {aspectGuide === '9:16' && (
            <>
              <div className="absolute top-0 bottom-0 left-0 w-[32vw] bg-[#040404]/85 border-r border-[#E11D48]/50" />
              <div className="absolute top-0 bottom-0 right-0 w-[32vw] bg-[#040404]/85 border-l border-[#E11D48]/50" />
            </>
          )}

          {/* Safe Action & Safe Title Guides */}
          <div className="absolute inset-[5%] border border-dashed border-[#EAEAEA]/20" />
          <div className="absolute inset-[10%] border border-[#EAEAEA]/15" />

          {/* Corner & Center Optical Tracking Markers (+) */}
          <div className="absolute top-[14vh] left-[6vw] text-[#E5A93C] text-xl font-bold select-none">
            +
          </div>
          <div className="absolute top-[14vh] right-[6vw] text-[#E5A93C] text-xl font-bold select-none">
            +
          </div>
          <div className="absolute bottom-[15vh] left-[6vw] text-[#E5A93C] text-xl font-bold select-none">
            +
          </div>
          <div className="absolute bottom-[15vh] right-[6vw] text-[#E5A93C] text-xl font-bold select-none">
            +
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#E11D48]/70 text-2xl font-light select-none">
            +
          </div>

          {/* Aspect Ratio Selector Bar in Top-Left HUD */}
          <div className="pointer-events-auto absolute top-20 left-6 bg-[#070709] border border-[#2A2A32] p-2.5 flex items-center gap-3">
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#E5A93C] font-semibold">
              CROP GUIDE // v37_final_FINAL.mov
            </span>
            {(['2.39:1', '16:9', '9:16'] as const).map((ratio) => (
              <button
                key={ratio}
                type="button"
                onClick={() => nleActions.setAspectGuide(ratio)}
                className={`px-2 py-0.5 text-[11px] font-semibold tracking-wider uppercase border cursor-pointer ${
                  aspectGuide === ratio
                    ? 'bg-[#E5A93C] text-[#040404] border-[#E5A93C]'
                    : 'bg-[#0C0C10] text-[#A1A1AA] border-[#27272A] hover:text-[#EAEAEA]'
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. LOG-C RAW CAMERA WAVEFORM / HISTOGRAM INSPECTOR (Docked cleanly above NLE Mastering Bar on right) */}
      <div
        id="color-scope-hud"
        data-testid="color-scope-hud"
        data-grade-state={finalGradeMode ? 'FINAL_GRADE' : 'RAW_LOG_C'}
        className={`fixed bottom-[68px] right-6 z-40 bg-[#070709]/95 border transition-opacity duration-300 ${
          !finalGradeMode
            ? 'border-[#E11D48] opacity-100 shadow-2xl'
            : 'border-[#1E1E24] opacity-90 hover:opacity-100 hidden xl:block'
        }`}
      >
        <div className="px-3 py-1.5 border-b border-[#1E1E24] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 inline-block ${
                finalGradeMode ? 'bg-[#E5A93C]' : 'bg-[#E11D48]'
              }`}
            />
            <span className="text-[10px] tracking-[0.18em] uppercase font-semibold text-[#EAEAEA] tabular-nums">
              {finalGradeMode
                ? 'SCOPE // PADRÃO SEU CAVEIRA (35MM GRADE)'
                : 'BYPASS LUT // CÂMERA BRUTA ARRI LOG-C'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => nleActions.toggleFinalGrade()}
            className="text-[10px] tracking-[0.14em] uppercase px-2 py-0.5 bg-[#121216] border border-[#2D2D35] text-[#E5A93C] hover:bg-[#E5A93C] hover:text-[#040404] font-semibold cursor-pointer"
          >
            {finalGradeMode ? 'VER LOG-C BRUTO' : 'APLICAR GRADE'}
          </button>
        </div>
        <div className="p-2.5 flex items-center gap-3">
          <canvas
            ref={waveformCanvasRef}
            width={180}
            height={76}
            className="border border-[#1A1A20] block"
          />
          <div className="text-[10px] leading-relaxed tracking-wider uppercase text-[#9CA3AF] tabular-nums space-y-1">
            <div>
              CURVA:{' '}
              <strong className="text-[#EAEAEA]">
                {finalGradeMode ? 'ACEScct S-CURVE' : 'LOG-C3 FLAT'}
              </strong>
            </div>
            <div>
              PRETO:{' '}
              <strong className="text-[#EAEAEA]">
                {finalGradeMode ? '#040404 (0 IRE)' : '#2A2C2B (38 IRE)'}
              </strong>
            </div>
            <div>
              PELÍCULA:{' '}
              <strong className="text-[#EAEAEA]">
                {finalGradeMode ? '35MM KODAK 5219' : 'SENSOR SEM PÓS'}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* 3. VFX / ROTOSCOPIA KINETIC VECTOR OVERLAY (motion_AGORA_VAI.aep) */}
      {vfxMode && (
        <canvas
          ref={vfxCanvasRef}
          id="vfx-vector-overlay"
          data-testid="vfx-vector-overlay"
          className="fixed inset-0 pointer-events-none z-30"
        />
      )}
    </>
  )
}
