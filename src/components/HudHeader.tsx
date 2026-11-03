import { useNleState } from '../store/nleStore'

export function HudHeader() {
  const { finalGradeMode } = useNleState()

  return (
    <header
      id="hud-header"
      aria-label="hud-header"
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-colors duration-300 ${
        finalGradeMode
          ? 'bg-[#040404]/95 border-[#1C1C22]'
          : 'bg-[#222423]/95 border-[#464A48]'
      }`}
    >
      <div className="max-w-[1680px] mx-auto h-16 px-4 sm:px-8 flex items-center justify-between gap-4">
        {/* Brand Identity */}
        <a
          href="#hero"
          className="flex items-center gap-3 text-[#EAEAEA] hover:text-[#E5A93C] transition-colors duration-200"
        >
          {/* Architectural Cranial Monolith Mark (Pure SVG, zero circle wrapper) */}
          <svg
            width="20"
            height="22"
            viewBox="0 0 20 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="shrink-0"
          >
            <path
              d="M2 5L6 1H14L18 5V13L14 16V21H6V16L2 13V5Z"
              stroke="currentColor"
              strokeWidth="1.75"
            />
            <rect x="5" y="7" width="3.5" height="3.5" fill="#E11D48" />
            <rect x="11.5" y="7" width="3.5" height="3.5" fill="#E11D48" />
            <path d="M8.5 17V21M11.5 17V21" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <span className="text-xs sm:text-sm font-extrabold tracking-[0.18em] uppercase">
            SEU CAVEIRA — POST PRODUCTION
          </span>
        </a>

        {/* Center Technical Metadata */}
        <div className="hidden md:flex items-center gap-6 text-xs font-semibold tracking-[0.2em] uppercase text-[#9CA3AF] tabular-nums">
          <span>SÃO PAULO · BR</span>
          <span className="text-[#2D2D36]">/</span>
          <span className="flex items-center gap-2 text-[#EAEAEA]">
            <span className="w-2 h-2 bg-[#E5A93C] inline-block" />
            24 FPS LOCK
          </span>
        </div>

        {/* Dry Action CTA */}
        <a
          href="https://wa.me/5511945991717"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-[#EAEAEA] text-[#040404] hover:bg-[#E5A93C] hover:text-[#040404] text-xs font-extrabold tracking-[0.16em] uppercase border border-[#EAEAEA] hover:border-[#E5A93C] transition-colors duration-200"
        >
          MANDAR O BRUTO →
        </a>
      </div>
    </header>
  )
}
