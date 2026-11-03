import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import fragmentShader from '../shaders/monolith.frag.glsl'
import vertexShader from '../shaders/monolith.vert.glsl'
import { liveUniforms } from '../store/nleStore'

// Suppress R3F's internal THREE.Clock deprecation notice in Three r183+
const origWarn = console.warn
console.warn = (...args: unknown[]) => {
  if (typeof args[0] === 'string' && args[0].includes('THREE.Clock:')) return
  origWarn.apply(console, args)
}

declare global {
  interface Window {
    __SEU_CAVEIRA_UNIFORMS__?: Record<string, { value: unknown }>
    __SEU_CAVEIRA_FPS__?: number
  }
}

function MonolithQuad() {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const { size, gl } = useThree()
  const fpsCounterRef = useRef({ frames: 0, lastTime: performance.now(), startTime: performance.now() })

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1920, 1080) },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uMouseVelocity: { value: 0 },
      uScrollProgress: { value: 0 },
      uScrollVelocity: { value: 0 },
      uSectionState: { value: 0 },
      uCraftState: { value: 0 },
      uRawCutMode: { value: 0 },
      uFinalGradeMode: { value: 1 },
      uVfxMode: { value: 0 },
      uColorTemp: { value: 0 },
    }),
    []
  )

  useEffect(() => {
    window.__SEU_CAVEIRA_UNIFORMS__ = uniforms
    return () => {
      delete window.__SEU_CAVEIRA_UNIFORMS__
    }
  }, [uniforms])

  useEffect(() => {
    const dpr = gl.getPixelRatio()
    uniforms.uResolution.value.set(size.width * dpr, size.height * dpr)
  }, [size, gl, uniforms])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1)
    const lerpFactor = 1 - Math.exp(-8.5 * dt)
    const fastLerp = 1 - Math.exp(-14.0 * dt)

    const now = performance.now()
    fpsCounterRef.current.frames += 1
    if (now - fpsCounterRef.current.lastTime >= 500) {
      window.__SEU_CAVEIRA_FPS__ = Math.round(
        (fpsCounterRef.current.frames * 1000) / (now - fpsCounterRef.current.lastTime)
      )
      fpsCounterRef.current.frames = 0
      fpsCounterRef.current.lastTime = now
    }

    uniforms.uTime.value = (now - fpsCounterRef.current.startTime) * 0.001

    liveUniforms.mouseX += (liveUniforms.targetMouseX - liveUniforms.mouseX) * fastLerp
    liveUniforms.mouseY += (liveUniforms.targetMouseY - liveUniforms.mouseY) * fastLerp
    liveUniforms.mouseVelocity *= Math.exp(-6.0 * dt)

    uniforms.uMouse.value.set(liveUniforms.mouseX, liveUniforms.mouseY)
    uniforms.uMouseVelocity.value = liveUniforms.mouseVelocity

    liveUniforms.scrollVelocity +=
      (liveUniforms.targetScrollVelocity - liveUniforms.scrollVelocity) * fastLerp
    liveUniforms.targetScrollVelocity *= Math.exp(-7.0 * dt)

    uniforms.uScrollProgress.value +=
      (liveUniforms.scrollProgress - uniforms.uScrollProgress.value) * lerpFactor
    uniforms.uScrollVelocity.value = liveUniforms.scrollVelocity

    uniforms.uSectionState.value +=
      (liveUniforms.sectionState - uniforms.uSectionState.value) * lerpFactor
    uniforms.uCraftState.value +=
      (liveUniforms.craftState - uniforms.uCraftState.value) * lerpFactor

    uniforms.uRawCutMode.value +=
      (liveUniforms.rawCutTarget - uniforms.uRawCutMode.value) * fastLerp
    uniforms.uFinalGradeMode.value +=
      (liveUniforms.finalGradeTarget - uniforms.uFinalGradeMode.value) * fastLerp
    uniforms.uVfxMode.value +=
      (liveUniforms.vfxTarget - uniforms.uVfxMode.value) * fastLerp
    uniforms.uColorTemp.value +=
      (liveUniforms.colorTempTarget - uniforms.uColorTemp.value) * lerpFactor
  })

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  )
}

export function WebGLStage() {
  const [dpr] = useState<[number, number]>(() => {
    if (typeof navigator !== 'undefined' && navigator.webdriver) {
      return [0.5, 0.6]
    }
    return [1, 1.5]
  })

  useEffect(() => {
    let lastX = 0
    let lastY = 0
    const onPointerMove = (e: PointerEvent) => {
      const nx = (e.clientX / Math.max(window.innerWidth, 1)) * 2 - 1
      const ny = -((e.clientY / Math.max(window.innerHeight, 1)) * 2 - 1)
      const dx = nx - lastX
      const dy = ny - lastY
      lastX = nx
      lastY = ny
      liveUniforms.targetMouseX = nx
      liveUniforms.targetMouseY = ny
      liveUniforms.mouseVelocity = Math.min(2.5, liveUniforms.mouseVelocity + Math.hypot(dx, dy) * 5.0)
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    return () => window.removeEventListener('pointermove', onPointerMove)
  }, [])

  return (
    <div
      id="webgl-stage"
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
    >
      <Canvas
        dpr={dpr}
        gl={{
          antialias: false,
          alpha: false,
          stencil: false,
          depth: false,
          powerPreference: 'high-performance',
          preserveDrawingBuffer: true,
        }}
        camera={{ position: [0, 0, 1], near: 0.1, far: 10 }}
      >
        <MonolithQuad />
      </Canvas>
    </div>
  )
}
