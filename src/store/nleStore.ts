import { useSyncExternalStore } from 'react'

export type AspectGuide = '2.39:1' | '16:9' | '9:16'

export interface NleState {
  /** v37_final_FINAL.mov — Modo RAW/Corte: framing guides + tracking markers + dry contrast */
  rawCutMode: boolean
  /** Aspect ratio guide when rawCutMode is active */
  aspectGuide: AspectGuide
  /** cor_aprovada_cliente2.grade — true = Padrão Seu Caveira (#040404 + 35mm grain + anamorphic CA), false = Sem Pós / Câmera Bruta Log-C */
  finalGradeMode: boolean
  /** motion_AGORA_VAI.aep — Modo VFX/Rotoscopia: optical distortion + kinetic vector mesh reacting to cursor */
  vfxMode: boolean
  /** Active craft specialty index (0 = Corte & Montagem, 1 = Color Grading, 2 = Motion 3D VFX) */
  craftIndex: number
  /** Colorist temperature offset (-1 cool night to +1 warm golden sun) */
  colorTempOffset: number
  /** Active client hover in social proof */
  hoveredClient: string | null
}

/**
 * High-frequency mutable values shared directly with the WebGL useFrame loop
 * and canvas overlays to avoid React re-renders at 60fps.
 */
export const liveUniforms = {
  scrollProgress: 0,
  scrollVelocity: 0,
  targetScrollVelocity: 0,
  mouseX: 0,
  mouseY: 0,
  targetMouseX: 0,
  targetMouseY: 0,
  mouseVelocity: 0,
  sectionState: 0, // 0=hero, 1=manifesto, 2=showreel, 3=craft, 4=proof, 5=footer
  craftState: 0, // 0=cut, 1=color, 2=vfx
  rawCutTarget: 0,
  finalGradeTarget: 1,
  vfxTarget: 0,
  colorTempTarget: 0,
  timecodeFrames: 14 * 24 + 22, // Starts at 00:00:14:22
}

let state: NleState = {
  rawCutMode: false,
  aspectGuide: '2.39:1',
  finalGradeMode: true,
  vfxMode: false,
  craftIndex: 0,
  colorTempOffset: 0,
  hoveredClient: null,
}

const listeners = new Set<() => void>()

function emit() {
  liveUniforms.rawCutTarget = state.rawCutMode ? 1 : 0
  liveUniforms.finalGradeTarget = state.finalGradeMode ? 1 : 0
  liveUniforms.vfxTarget = state.vfxMode ? 1 : 0
  liveUniforms.craftState = state.craftIndex
  liveUniforms.colorTempTarget = state.colorTempOffset
  listeners.forEach((l) => l())
}

export const nleActions = {
  toggleRawCut() {
    state = { ...state, rawCutMode: !state.rawCutMode }
    emit()
  },
  setRawCut(val: boolean) {
    state = { ...state, rawCutMode: val }
    emit()
  },
  setAspectGuide(aspectGuide: AspectGuide) {
    state = { ...state, aspectGuide, rawCutMode: true }
    emit()
  },
  toggleFinalGrade() {
    state = { ...state, finalGradeMode: !state.finalGradeMode }
    emit()
  },
  setFinalGrade(val: boolean) {
    state = { ...state, finalGradeMode: val }
    emit()
  },
  toggleVfxMode() {
    state = { ...state, vfxMode: !state.vfxMode }
    emit()
  },
  setVfxMode(val: boolean) {
    state = { ...state, vfxMode: val }
    emit()
  },
  setCraftIndex(craftIndex: number) {
    if (state.craftIndex === craftIndex) return
    state = { ...state, craftIndex }
    emit()
  },
  setColorTempOffset(colorTempOffset: number) {
    state = { ...state, colorTempOffset }
    emit()
  },
  setHoveredClient(hoveredClient: string | null) {
    if (state.hoveredClient === hoveredClient) return
    state = { ...state, hoveredClient }
    emit()
  },
  getState(): NleState {
    return state
  },
}

export function useNleState(): NleState {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => state
  )
}

export function formatTimecode24(totalFrames: number): string {
  const safeFrames = Math.max(0, Math.floor(totalFrames))
  const ff = safeFrames % 24
  const totalSeconds = Math.floor(safeFrames / 24)
  const ss = totalSeconds % 60
  const totalMinutes = Math.floor(totalSeconds / 60)
  const mm = totalMinutes % 60
  const hh = Math.floor(totalMinutes / 60) % 24
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(hh)}:${pad(mm)}:${pad(ss)}:${pad(ff)}`
}
