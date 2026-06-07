interface Props {
  candidates: string[]
  currentIndex: number
  okurigana: string
}

export function CandidatePopup({ candidates, currentIndex, okurigana }: Props) {
  if (candidates.length === 0) return null

  return (
    <div className="candidate-popup" role="listbox" aria-label="変換候補">
      {candidates.map((c, i) => (
        <div
          key={i}
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
