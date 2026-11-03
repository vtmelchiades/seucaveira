import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { useEffect } from 'react'
import { CraftSection } from './components/CraftSection'
import { FooterSection } from './components/FooterSection'
import { HeroSection } from './components/HeroSection'
import { HudHeader } from './components/HudHeader'
import { ManifestoSection } from './components/ManifestoSection'
import { NleMasteringBar } from './components/NleMasteringBar'
import { ProofSection } from './components/ProofSection'
import { ShowreelSection } from './components/ShowreelSection'
import { ViewportOverlays } from './components/ViewportOverlays'
import { WebGLStage } from './components/WebGLStage'
import { liveUniforms, useNleState } from './store/nleStore'

gsap.registerPlugin(ScrollTrigger)

export function App() {
  const { finalGradeMode, rawCutMode } = useNleState()

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
    })

    lenis.on('scroll', (e: { progress: number; velocity: number }) => {
      ScrollTrigger.update()
      liveUniforms.scrollProgress = e.progress
      liveUniforms.targetScrollVelocity = e.velocity
    })

    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000)
    }

    gsap.ticker.add(tickerCallback)
    gsap.ticker.lagSmoothing(0)

    const onNativeScroll = () => {
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      )
      liveUniforms.scrollProgress = Math.min(
        1,
        Math.max(0, window.scrollY / maxScroll)
      )
    }
    window.addEventListener('scroll', onNativeScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onNativeScroll)
      gsap.ticker.remove(tickerCallback)
      lenis.destroy()
    }
  }, [])

  return (
    <div
      id="app-shell"
      data-grade-mode={finalGradeMode ? 'final' : 'logc'}
      data-cut-mode={rawCutMode ? 'raw' : 'normal'}
      className={`min-h-screen relative selection:bg-[#E11D48] selection:text-[#F4F4F5] ${
        finalGradeMode
          ? 'bg-[#040404] text-[#F4F4F5]'
          : 'bg-[#252726] text-[#D8DCDC] grayscale-[65%] contrast-[82%]'
      }`}
    >
      {/* Full-Viewport Fixed WebGL Raymarched SDF Shader Stage */}
      <WebGLStage />

      {/* Interactive NLE Viewport Overlays (Aspect Crop Guides, Log-C Scopes, VFX Vector Mesh) */}
      <ViewportOverlays />

      {/* Fixed Top HUD Header */}
      <HudHeader />

      {/* Choreographed Main Content Bands */}
      <main id="main-timeline" className="relative z-10">
        <HeroSection />
        <ManifestoSection />
        <ShowreelSection />
        <CraftSection />
        <ProofSection />
      </main>

      {/* Direct Dispatch Contact Footer */}
      <FooterSection />

      {/* Fixed Bottom Interactive NLE Mastering Bar */}
      <NleMasteringBar />
    </div>
  )
}

export default App
