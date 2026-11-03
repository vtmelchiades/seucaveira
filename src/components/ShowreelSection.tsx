import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useCallback, useEffect, useRef, useState } from 'react'
import { formatTimecode24, liveUniforms, useNleState } from '../store/nleStore'

gsap.registerPlugin(ScrollTrigger)

const TOTAL_REEL_FRAMES = 83 * 24 // 01min23s @ 24fps = 1992 frames

interface ReelShot {
  client: string
  title: string
  deliverable: string
  startFrame: number
  endFrame: number
  primaryHex: string
  secondaryHex: string
  lutName: string
}

const REEL_SHOTS: ReelShot[] = [
  {
    client: 'HEINEKEN',
    title: 'CONDENSAÇÃO ÓPTICA & FLARE ANAMÓRFICO',
    deliverable: 'TV 60s + CINEMA 4K DCI',
    startFrame: 0,
    endFrame: 288,
    primaryHex: '#10B981',
    secondaryHex: '#E5A93C',
    lutName: 'SC_EMERALD_KODAK2383.cube',
  },
  {
    client: 'AMSTEL',
    title: 'OURO LÍQUIDO // HIGH-SPEED PHANTOM 1000FPS',
    deliverable: 'BROADCAST + OOH',
    startFrame: 288,
    endFrame: 576,
    primaryHex: '#E5A93C',
    secondaryHex: '#E11D48',
    lutName: 'SC_AMBER_MALT_35MM.cube',
  },
  {
    client: 'SAMSUNG',
    title: 'SIMULAÇÃO DE VIDRO DOBRÁVEL & RIG CLEANUP',
    deliverable: 'GLOBAL LAUNCH 4K',
    startFrame: 576,
    endFrame: 864,
    primaryHex: '#38BDF8',
    secondaryHex: '#E11D48',
    lutName: 'SC_OBSIDIAN_TECH.cube',
  },
  {
    client: 'GILLETTE VENUS',
    title: 'CROMO HIDRODINÂMICO & CÁUSTICAS DE ÁGUA',
    deliverable: 'TV ABERTA 30s + VERTICAL 9:16',
    startFrame: 864,
    endFrame: 1152,
    primaryHex: '#F43F5E',
    secondaryHex: '#38BDF8',
    lutName: 'SC_HYDRO_CHROME.cube',
  },
  {
    client: 'TIM',
    title: 'VETORES DE LUZ 5G & ROTOSCOPIA CIRÚRGICA',
    deliverable: 'CAMPANHA NACIONAL',
    startFrame: 1152,
    endFrame: 1440,
    primaryHex: '#E11D48',
    secondaryHex: '#38BDF8',
    lutName: 'SC_NIGHT_ANAMORPHIC.cube',
  },
  {
    client: 'NISSIN',
    title: 'PARTÍCULAS DE VAPOR & CORTE WHIP-PAN 2 FRAMES',
    deliverable: 'TV + REELS / TIKTOK',
    startFrame: 1440,
    endFrame: 1728,
    primaryHex: '#F59E0B',
    secondaryHex: '#E11D48',
    lutName: 'SC_PUNCH_COMMERCIAL.cube',
  },
  {
    client: 'CVC',
    title: 'SOL DE DIÁRIA CRIADO NO GRADING // SKY REPLACE',
    deliverable: 'BROADCAST + DIGITAL',
    startFrame: 1728,
    endFrame: TOTAL_REEL_FRAMES,
    primaryHex: '#FBBF24',
    secondaryHex: '#F43F5E',
    lutName: 'SC_SOL_DE_SAO_PEDRO.cube',
  },
]

export function ShowreelSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const muteBtnRef = useRef<HTMLButtonElement>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const oscRef = useRef<OscillatorNode | null>(null)
  const gainRef = useRef<GainNode | null>(null)

  const { finalGradeMode, rawCutMode, vfxMode } = useNleState()

  const [currentFrame, setCurrentFrame] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(true)
  const frameRef = useRef(0)
  const playingRef = useRef(true)

  useEffect(() => {
    playingRef.current = isPlaying
  }, [isPlaying])

  useGSAP(
    () => {
      const section = sectionRef.current
      if (!section) return
      ScrollTrigger.create({
        trigger: section,
        start: 'top 75%',
        end: 'bottom 25%',
        onUpdate: (self) => {
          liveUniforms.sectionState = 2.0 + self.progress * 0.8
        },
      })
    },
    { scope: sectionRef }
  )

  const playFrameClickSound = useCallback(() => {
    if (isMuted || !audioCtxRef.current) return
    try {
      const ctx = audioCtxRef.current
      const clickOsc = ctx.createOscillator()
      const clickGain = ctx.createGain()
      clickOsc.type = 'triangle'
      clickOsc.frequency.setValueAtTime(180, ctx.currentTime)
      clickOsc.frequency.exponentialRampToValueAtTime(48, ctx.currentTime + 0.035)
      clickGain.gain.setValueAtTime(0.08, ctx.currentTime)
      clickGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.035)
      clickOsc.connect(clickGain)
      clickGain.connect(ctx.destination)
      clickOsc.start()
      clickOsc.stop(ctx.currentTime + 0.04)
    } catch {
      /* ignore audio context restrictions */
    }
  }, [isMuted])

  const stepFrame = useCallback(
    (deltaFrames: number) => {
      setIsPlaying(false)
      playingRef.current = false
      frameRef.current =
        (frameRef.current + deltaFrames + TOTAL_REEL_FRAMES) % TOTAL_REEL_FRAMES
      setCurrentFrame(frameRef.current)
      playFrameClickSound()
    },
    [playFrameClickSound]
  )

  // Keyboard < and > (plus , and .) frame-by-frame inspection
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === '<' || e.key === ',') {
        e.preventDefault()
        stepFrame(-1)
      } else if (e.key === '>' || e.key === '.') {
        e.preventDefault()
        stepFrame(1)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [stepFrame])

  // Toggle Web Audio API procedural sound design
  const toggleMute = () => {
    const nextMuted = !isMuted
    setIsMuted(nextMuted)
    try {
      if (!nextMuted) {
        if (!audioCtxRef.current) {
          const AudioCtx =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext })
              .webkitAudioContext
          const ctx = new AudioCtx()
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'sawtooth'
          osc.frequency.value = 54 // Low cinema room sub-drone
          gain.gain.value = 0.025
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start()
          audioCtxRef.current = ctx
          oscRef.current = osc
          gainRef.current = gain
        } else if (audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume()
        }
        if (gainRef.current && audioCtxRef.current) {
          gainRef.current.gain.setTargetAtTime(0.025, audioCtxRef.current.currentTime, 0.05)
        }
      } else if (gainRef.current && audioCtxRef.current) {
        gainRef.current.gain.setTargetAtTime(0.0, audioCtxRef.current.currentTime, 0.05)
      }
    } catch {
      /* ignore headless audio restrictions */
    }
  }

  // Magnetic button pull handler
  const handleMagneticMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = muteBtnRef.current
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    const dx = e.clientX - (rect.left + rect.width / 2)
    const dy = e.clientY - (rect.top + rect.height / 2)
    btn.style.transform = `translate3d(${(dx * 0.24).toFixed(1)}px, ${(dy * 0.24).toFixed(1)}px, 0)`
  }

  const handleMagneticLeave = () => {
    const btn = muteBtnRef.current
    if (!btn) return
    btn.style.transform = 'translate3d(0px, 0px, 0)'
  }

  // High-framerate procedural showreel renderer
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let rafId = 0
    let lastTick = performance.now()
    let lastDrawnFrame = -1

    const renderReel = (now: number) => {
      if (playingRef.current && now - lastTick >= 1000 / 24) {
        frameRef.current = (frameRef.current + 1) % TOTAL_REEL_FRAMES
        setCurrentFrame(frameRef.current)
        lastTick = now
      }

      const f = frameRef.current
      if (f === lastDrawnFrame) {
        rafId = requestAnimationFrame(renderReel)
        return
      }
      lastDrawnFrame = f
      const shotIndex = REEL_SHOTS.findIndex(
        (s) => f >= s.startFrame && f < s.endFrame
      )
      const shot = REEL_SHOTS[Math.max(0, shotIndex)]
      const shotProgress =
        (f - shot.startFrame) / Math.max(1, shot.endFrame - shot.startFrame)

      const w = canvas.width
      const h = canvas.height

      // Base background: deep #040404 in Final Grade vs flat gray in Log-C
      ctx.fillStyle = finalGradeMode ? '#040405' : '#262827'
      ctx.fillRect(0, 0, w, h)

      // Anamorphic radial light field
      const cx = w * (0.5 + liveUniforms.mouseX * 0.08 + Math.sin(f * 0.04) * 0.12)
      const cy = h * (0.5 - liveUniforms.mouseY * 0.06 + Math.cos(f * 0.03) * 0.08)
      const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, w * 0.62)
      if (finalGradeMode) {
        grad.addColorStop(0, `${shot.primaryHex}55`)
        grad.addColorStop(0.45, `${shot.secondaryHex}28`)
        grad.addColorStop(1, '#040405')
      } else {
        grad.addColorStop(0, '#5A5E5C')
        grad.addColorStop(0.55, '#383B3A')
        grad.addColorStop(1, '#262827')
      }
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)

      // Procedural commercial geometry per brand shot
      ctx.save()
      ctx.translate(w / 2, h / 2)

      const numRings = 9
      for (let i = 0; i < numRings; i++) {
        const ratio = i / numRings
        const radius =
          45 +
          i * 38 +
          Math.sin(f * 0.09 + i * 0.8 + shotIndex) * 18 * (1 + shotProgress * 0.5)
        ctx.strokeStyle = finalGradeMode
          ? i % 2 === 0
            ? shot.primaryHex
            : shot.secondaryHex
          : '#8A8F8C'
        ctx.globalAlpha = finalGradeMode ? 0.18 + (1 - ratio) * 0.55 : 0.22
        ctx.lineWidth = i === 2 ? 3 : 1.25

        // Anamorphic 2.39:1 elliptical lens elements & architectural blades
        ctx.beginPath()
        ctx.ellipse(
          Math.sin(f * 0.05 + i) * 28,
          Math.cos(f * 0.04 + i) * 10,
          radius * 1.45,
          radius * 0.68,
          (f * 0.012 + i * 0.35) * (i % 2 === 0 ? 1 : -1),
          0,
          Math.PI * 2
        )
        ctx.stroke()
      }

      // Horizontal Anamorphic Flare Streak
      ctx.globalAlpha = finalGradeMode ? 0.65 : 0.18
      const streakGrad = ctx.createLinearGradient(-w / 2, 0, w / 2, 0)
      streakGrad.addColorStop(0, 'transparent')
      streakGrad.addColorStop(0.5, finalGradeMode ? shot.primaryHex : '#9CA3AF')
      streakGrad.addColorStop(1, 'transparent')
      ctx.fillStyle = streakGrad
      ctx.fillRect(-w / 2, -2, w, 4)

      ctx.restore()

      // VFX / Motion Vector overlay inside the Showreel when vfxMode is active
      if (vfxMode) {
        ctx.strokeStyle = '#E11D48'
        ctx.lineWidth = 1
        ctx.strokeRect(w * 0.22, h * 0.18, w * 0.56, h * 0.64)
        ctx.fillStyle = '#E5A93C'
        ctx.font = '700 11px "Space Grotesk", sans-serif'
        ctx.fillText(
          `TRACK_NODE_0${shotIndex + 1} // ${shot.client} // RMS 0.02px`,
          w * 0.22 + 10,
          h * 0.18 + 18
        )
      }

      // Raw Cut Mode 2.39:1 crosshairs inside showreel
      if (rawCutMode) {
        ctx.strokeStyle = 'rgba(229, 169, 60, 0.45)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(0, h / 2)
        ctx.lineTo(w, h / 2)
        ctx.moveTo(w / 2, 0)
        ctx.lineTo(w / 2, h)
        ctx.stroke()
      }

      // Burned-in NLE Slate Watermark on Canvas
      ctx.fillStyle = finalGradeMode
        ? 'rgba(244, 244, 245, 0.92)'
        : 'rgba(212, 216, 214, 0.78)'
      ctx.font = '800 32px "Syne", sans-serif'
      ctx.fillText(shot.client, 36, h - 56)

      ctx.fillStyle = finalGradeMode ? '#E5A93C' : '#9CA3AF'
      ctx.font = '600 12px "Space Grotesk", sans-serif'
      ctx.fillText(
        `${shot.title}   ·   ${shot.deliverable}   ·   LUT: ${
          finalGradeMode ? shot.lutName : 'BYPASS (ARRI LogC3)'
        }`,
        36,
        h - 30
      )

      rafId = requestAnimationFrame(renderReel)
    }

    rafId = requestAnimationFrame(renderReel)
    return () => cancelAnimationFrame(rafId)
  }, [finalGradeMode, rawCutMode, vfxMode])

  const activeShot =
    REEL_SHOTS.find(
      (s) => currentFrame >= s.startFrame && currentFrame < s.endFrame
    ) || REEL_SHOTS[0]

  return (
    <section
      ref={sectionRef}
      id="showreel"
      aria-label="showreel"
      className="relative min-h-screen py-24 px-4 sm:px-8 flex flex-col justify-center z-10 border-b border-[#18181E] bg-[#050507]/45"
    >
      <div className="max-w-[1680px] w-full mx-auto">
        {/* Top Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-10">
          <div className="lg:col-span-7">
            <div className="text-xs font-extrabold tracking-[0.22em] uppercase text-[#E5A93C] mb-3">
              SHOWREEL OFICIAL 2026 // ANAMORPHIC 2.39:1 MASTER
            </div>
            <h2 className="font-display uppercase text-[#F4F4F5] text-[clamp(2.4rem,5.2vw,5.6rem)] leading-[0.92] tracking-[-0.03em] font-extrabold">
              01min23s de provas materiais.
            </h2>
          </div>

          <div className="lg:col-span-5 border-l-2 border-[#E5A93C] pl-6">
            <p className="text-base sm:text-lg leading-[1.55] text-[#D4D4D8]">
              Ideias que saíram do papel, passaram pelo nosso bisturi e foram parar nas telas da{' '}
              <strong className="text-[#F4F4F5] font-bold">
                Heineken, Amstel, Samsung, Gillette Venus, TIM, Nissin e CVC
              </strong>
              .
            </p>
          </div>
        </div>

        {/* Expanded Anamorphic 2.39:1 Showreel Viewport */}
        <div className="relative bg-[#050507] border border-[#24242E]">
          {/* Top NLE Slate Bar */}
          <div className="px-4 py-2.5 bg-[#09090C] border-b border-[#1E1E26] flex flex-wrap items-center justify-between gap-4 text-xs font-bold tracking-[0.16em] uppercase tabular-nums">
            <div className="flex items-center gap-3">
              <span
                className={`w-2 h-2 inline-block ${
                  isPlaying ? 'bg-[#E11D48]' : 'bg-[#E5A93C]'
                }`}
              />
              <span className="text-[#F4F4F5]">
                REEL_SEU_CAVEIRA_2026_MASTER.MOV
              </span>
              <span className="text-[#6E6E77] hidden sm:inline">|</span>
              <span className="text-[#E5A93C] hidden sm:inline">
                CLIENTE: {activeShot.client}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-[#9CA3AF]">
                FRAME {String(currentFrame).padStart(4, '0')} / {TOTAL_REEL_FRAMES}
              </span>
              <span
                data-testid="showreel-timecode"
                className="px-2.5 py-0.5 bg-[#121217] border border-[#2A2A34] text-[#F4F4F5]"
              >
                {formatTimecode24(currentFrame)} / 00:01:23:00
              </span>
            </div>
          </div>

          {/* High-Framerate Procedural Anamorphic Canvas */}
          <div className="relative w-full aspect-[21/9] min-h-[280px] sm:min-h-[420px] overflow-hidden bg-[#040404]">
            <canvas
              ref={canvasRef}
              width={1280}
              height={536}
              className="w-full h-full object-cover block"
            />
          </div>

          {/* Interactive Chapter Cut Scrubber (7 Commercial Cuts) */}
          <div className="grid grid-cols-2 sm:grid-cols-7 border-t border-[#1E1E26] bg-[#08080B]">
            {REEL_SHOTS.map((shot) => {
              const isActive = activeShot.client === shot.client
              return (
                <button
                  key={shot.client}
                  type="button"
                  onClick={() => {
                    frameRef.current = shot.startFrame
                    setCurrentFrame(shot.startFrame)
                    playFrameClickSound()
                  }}
                  className={`px-3 py-2.5 text-left border-r border-b sm:border-b-0 border-[#1A1A22] cursor-pointer transition-colors duration-150 ${
                    isActive
                      ? 'bg-[#14110B] text-[#E5A93C]'
                      : 'bg-[#08080B] text-[#8E8E98] hover:bg-[#0E0E14] hover:text-[#EAEAEA]'
                  }`}
                >
                  <div className="text-[10px] font-bold tracking-[0.18em] uppercase truncate">
                    {shot.client}
                  </div>
                  <div className="text-[10px] text-[#6E6E77] tabular-nums mt-0.5">
                    {formatTimecode24(shot.startFrame)}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Bottom Transport & Frame-by-Frame Inspection Deck */}
          <div className="px-4 py-3 bg-[#0A0A0E] border-t border-[#1E1E26] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                data-testid="reel-play-toggle"
                onClick={() => setIsPlaying((p) => !p)}
                className="px-4 py-2 bg-[#EAEAEA] text-[#040404] hover:bg-[#E5A93C] text-xs font-extrabold tracking-[0.16em] uppercase cursor-pointer"
              >
                {isPlaying ? 'PAUSAR REEL [SPACE]' : 'RODAR REEL ▶'}
              </button>

              <button
                type="button"
                data-testid="reel-step-prev"
                onClick={() => stepFrame(-1)}
                className="px-3 py-2 bg-[#121218] hover:bg-[#1E1E28] text-[#EAEAEA] border border-[#2C2C36] text-xs font-bold tracking-[0.14em] uppercase cursor-pointer tabular-nums"
                title="Inspecionar frame anterior (Tecla <)"
              >
                &lt; -1 FRAME
              </button>

              <button
                type="button"
                data-testid="reel-step-next"
                onClick={() => stepFrame(1)}
                className="px-3 py-2 bg-[#121218] hover:bg-[#1E1E28] text-[#EAEAEA] border border-[#2C2C36] text-xs font-bold tracking-[0.14em] uppercase cursor-pointer tabular-nums"
                title="Inspecionar próximo frame (Tecla >)"
              >
                +1 FRAME &gt;
              </button>
            </div>

            <div className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#8E8E98] hidden md:block">
              INSPEÇÃO FRAME A FRAME: USE AS TECLAS <strong className="text-[#EAEAEA]">&lt;</strong> E{' '}
              <strong className="text-[#EAEAEA]">&gt;</strong> NA ILHA
            </div>

            {/* Magnetic Mute / Unmute Control */}
            <button
              ref={muteBtnRef}
              type="button"
              data-testid="reel-mute-toggle"
              onClick={toggleMute}
              onMouseMove={handleMagneticMove}
              onMouseLeave={handleMagneticLeave}
              style={{
                transition: 'transform 180ms cubic-bezier(0.19, 1, 0.22, 1)',
              }}
              className={`px-4 py-2 border text-xs font-extrabold tracking-[0.16em] uppercase cursor-pointer ${
                !isMuted
                  ? 'bg-[#E11D48] border-[#E11D48] text-[#EAEAEA]'
                  : 'bg-[#101015] border-[#2E2E38] text-[#EAEAEA] hover:border-[#E5A93C]'
              }`}
            >
              {isMuted ? 'SOM: MUTE [ATIVAR MONITORIA]' : 'SOM: 24FPS MONITOR ATIVO'}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
