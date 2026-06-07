import { useEffect, useRef } from 'react'

interface Props {
  candidates: string[]
  currentIndex: number
  okurigana: string
}

export function CandidatePopup({ candidates, currentIndex, okurigana }: Props) {
  const activeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    activeRef.current?.scrollIntoView?.({ block: 'nearest' })
  }, [currentIndex])

  if (candidates.length === 0) return null

  return (
    <div className="candidate-popup" role="listbox" aria-label="変換候補">
      <div className="candidate-counter" aria-live="polite">
        {currentIndex + 1} / {candidates.length}
      </div>
      {candidates.map((c, i) => (
        <div
          key={i}
          ref={i === currentIndex ? activeRef : null}
          className={`candidate-item ${i === currentIndex ? 'candidate-item--active' : ''}`}
          role="option"
          aria-selected={i === currentIndex}
        >
          {c}{okurigana}
        </div>
      ))}
    </div>
  )
}
