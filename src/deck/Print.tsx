import { SLIDES } from './slides'

/** /deck/print: every slide stacked at exactly 1920×1080, one per PDF page. §10.5. */
export default function Print() {
  return (
    <div>
      <style>{`
        @page { size: 1920px 1080px; margin: 0; }
        @media print {
          .deck-print-slide { break-after: page; }
          .deck-print-slide:last-child { break-after: auto; }
        }
      `}</style>
      {SLIDES.map((slide) => {
        const Slide = slide.Component
        return (
          <div key={slide.number} className="deck-print-slide" data-slide={slide.number}>
            <Slide />
          </div>
        )
      })}
    </div>
  )
}
