import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useRef } from 'react'
import { liveUniforms } from '../store/nleStore'

gsap.registerPlugin(ScrollTrigger)

export function ManifestoSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const progressLineRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const section = sectionRef.current
      if (!section) return

      const blocks = section.querySelectorAll('[data-manifesto-block]')
      const razorLine = progressLineRef.current

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 15%',
          end: '+=35%',
          pin: true,
          scrub: 1,
          onUpdate: (self) => {
            liveUniforms.sectionState = 1.0 + self.progress * 0.8
          },
        },
      })

      if (razorLine) {
        tl.fromTo(
          razorLine,
          { scaleX: 0.25 },
          { scaleX: 1, ease: 'expo.out', duration: 1 },
          0
        )
      }

      blocks.forEach((block, i) => {
        tl.fromTo(
          block,
          { opacity: 0.82, y: 18 },
          {
            opacity: 1,
            y: 0,
            ease: 'power3.out',
            duration: 0.45,
          },
          i * 0.25
        )
      })
    },
    { scope: sectionRef }
  )

  return (
    <section
      ref={sectionRef}
      id="manifesto"
      aria-label="manifesto"
      className="relative py-20 px-4 sm:px-8 flex items-center z-10 border-b border-[#18181E] bg-[#060608]/68"
    >
      <div className="max-w-[1680px] w-full mx-auto">
        {/* Top Architectural Header Bar */}
        <div className="mb-8 flex items-center justify-between gap-4 border-b border-[#1F1F27] pb-4">
          <span className="text-xs font-extrabold tracking-[0.22em] uppercase text-[#E11D48]">
            MANIFESTO DE CORTE SECO // ILHA PRINCIPAL
          </span>
          <span className="text-xs font-semibold tracking-[0.18em] uppercase text-[#8A8A94] tabular-nums hidden sm:inline">
            PRECISÃO DE DOIS QUADROS (83.3 MS @ 24FPS)
          </span>
        </div>

        {/* Asymmetric 12-Col Layout: 5 Cols Monumental Headline + 7 Cols Choreographed Statements */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          <div className="lg:col-span-5">
            <h2 className="font-display uppercase text-[#F4F4F5] text-[clamp(2.2rem,4.8vw,5.2rem)] leading-[0.96] tracking-[0.01em] font-normal">
              Bruto é só matéria-prima pedindo socorro.
            </h2>

            {/* Razor Timeline Progress Rule */}
            <div className="mt-8 h-1 w-full bg-[#181820] overflow-hidden">
              <div
                ref={progressLineRef}
                className="h-full w-full bg-[#E5A93C] origin-left"
              />
            </div>

            <div className="mt-4 flex items-center justify-between text-[11px] font-bold tracking-[0.18em] uppercase text-[#8A8A94] tabular-nums">
              <span>IN: 00:00:00:00</span>
              <span className="text-[#E5A93C]">CORTE SECO // 2 FRAMES</span>
              <span>OUT: 00:00:30:00</span>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-5">
            {/* Statement 1 */}
            <article
              data-manifesto-block
              className="p-6 sm:p-7 bg-[#07070A] border-l-4 border-[#E11D48] border-t border-r border-b border-t-[#1C1C24] border-r-[#1C1C24] border-b-[#1C1C24]"
            >
              <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#E11D48] mb-2">
                SENTENÇA DE TIMELINE
              </div>
              <p className="text-lg sm:text-2xl lg:text-[1.7rem] font-bold leading-[1.28] text-[#F4F4F5]">
                No set de filmagem, tudo é promessa. Na nossa timeline, é sentença.
              </p>
            </article>

            {/* Statement 2 */}
            <article
              data-manifesto-block
              className="p-6 sm:p-7 bg-[#07070A] border-l-4 border-[#E5A93C] border-t border-r border-b border-t-[#1C1C24] border-r-[#1C1C24] border-b-[#1C1C24] lg:ml-8"
            >
              <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#E5A93C] mb-2">
                RETENÇÃO NO BRAÇO // DOIS QUADROS
              </div>
              <p className="text-base sm:text-xl lg:text-2xl font-medium leading-[1.38] text-[#E4E4E7]">
                No feed, uma imagem vive dois segundos. Na TV, trinta. A diferença entre o polegar que pula e o olho que trava mora num corte seco de dois quadros.
              </p>
            </article>

            {/* Statement 3 */}
            <article
              data-manifesto-block
              className="p-6 sm:p-7 bg-[#07070A] border-l-4 border-[#EAEAEA] border-t border-r border-b border-t-[#1C1C24] border-r-[#1C1C24] border-b-[#1C1C24] lg:ml-16"
            >
              <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#A1A1AA] mb-2">
                FILOSOFIA DA SALA ESCURA
              </div>
              <p className="text-base sm:text-xl lg:text-2xl font-medium leading-[1.38] text-[#E4E4E7]">
                A caveira no nome não fala de morte. Fala do que sobra depois que a gente corta tudo o que não presta. Irreverência na porta, relojoaria suíça lá dentro.
              </p>
            </article>
          </div>
        </div>
      </div>
    </section>
  )
}
