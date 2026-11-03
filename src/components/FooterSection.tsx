import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useRef } from 'react'
import { liveUniforms } from '../store/nleStore'

gsap.registerPlugin(ScrollTrigger)

export function FooterSection() {
  const footerRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const footer = footerRef.current
      if (!footer) return

      ScrollTrigger.create({
        trigger: footer,
        start: 'top 80%',
        end: 'bottom bottom',
        onUpdate: (self) => {
          liveUniforms.sectionState = 4.8 + self.progress * 0.4
        },
      })
    },
    { scope: footerRef }
  )

  return (
    <footer
      ref={footerRef}
      id="contact-footer"
      aria-label="contact-footer"
      className="relative pt-28 pb-36 px-4 sm:px-8 z-10 bg-[#040404]/88"
    >
      <div className="max-w-[1680px] w-full mx-auto">
        {/* Top Dispatch Bar */}
        <div className="mb-12 flex flex-wrap items-center justify-between gap-4 border-b border-[#1E1E28] pb-4 text-xs font-extrabold tracking-[0.22em] uppercase text-[#E11D48]">
          <span>SALA DE MÁQUINAS // ATENDIMENTO DIRETO DE ILHA</span>
          <span className="text-[#8E8E98] tabular-nums">
            INGEST FTP / FRAME.IO / ASPERA PRONTOS
          </span>
        </div>

        {/* Asymmetric 12-Col Closing Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-end mb-16">
          <div className="lg:col-span-8">
            <h2 className="font-display uppercase text-[#F4F4F5] text-[clamp(2.4rem,5.4vw,6.2rem)] leading-[0.92] tracking-[-0.03em] font-extrabold">
              Manda o bruto, o prazo e a referência. O milagre a gente combina no WhatsApp.
            </h2>
          </div>

          <div className="lg:col-span-4 flex flex-col items-stretch lg:items-end justify-end">
            <a
              href="https://wa.me/5511945991717"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="whatsapp-cta"
              className="w-full text-center px-6 py-6 bg-[#E11D48] hover:bg-[#E5A93C] text-[#F4F4F5] hover:text-[#040404] border-2 border-[#E11D48] hover:border-[#E5A93C] text-sm sm:text-base font-extrabold tracking-[0.15em] uppercase transition-colors duration-200"
            >
              CHAMAR NA SALA DE MÁQUINAS · (11) 94599-1717 →
            </a>
          </div>
        </div>

        {/* Secondary Metadata Strip */}
        <div className="pt-8 border-t border-[#1E1E26] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-xs sm:text-sm font-bold tracking-[0.18em] uppercase text-[#A1A1AA] tabular-nums">
          <div className="flex flex-wrap items-center gap-4 sm:gap-8">
            <a
              href="mailto:posproducao@seucaveira.com"
              className="text-[#F4F4F5] hover:text-[#E5A93C] transition-colors duration-150"
            >
              posproducao@seucaveira.com
            </a>
            <span className="text-[#2D2D38]">·</span>
            <a
              href="https://instagram.com/seu.caveira"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#F4F4F5] hover:text-[#E5A93C] transition-colors duration-150"
            >
              @seu.caveira
            </a>
          </div>

          <div className="text-[#8E8E98]">SEU CAVEIRA © 2026</div>
        </div>
      </div>
    </footer>
  )
}
