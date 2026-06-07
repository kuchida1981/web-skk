import { useEffect, useRef } from 'react'
import { SkkState, getPreEdit } from '../skk/types'
import { CandidatePopup } from './CandidatePopup'

interface Props {
  skkState: SkkState
  disabled: boolean
  onKeyDown: (e: KeyboardEvent) => void
}

export function SkkInputArea({ skkState, disabled, onKeyDown }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  // Auto-focus on mount
  useEffect(() => {
    if (!disabled) ref.current?.focus()
  }, [disabled])

  // Re-focus when disabled becomes false
  useEffect(() => {
    if (!disabled) ref.current?.focus()
  }, [disabled])

  // Attach keydown listener
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.addEventListener('keydown', onKeyDown)
    return () => el.removeEventListener('keydown', onKeyDown)
  }, [onKeyDown])

  const preEdit = getPreEdit(skkState)
  const showCandidates = skkState.phase === 'conversion'

  return (
    <div className="skk-input-wrapper">
      <div
        ref={ref}
        className={`skk-input-area ${disabled ? 'skk-input-area--disabled' : ''}`}
        tabIndex={disabled ? -1 : 0}
        role="textbox"
        aria-multiline="true"
        aria-label="SKK入力欄"
        aria-disabled={disabled}
      >
        <span className="skk-committed">{skkState.committed}</span>
        {preEdit && (
          <span className="skk-preedit">{preEdit}</span>
        )}
        <span className="skk-cursor" aria-hidden="true" />
      </div>
      {showCandidates && (
        <CandidatePopup
          candidates={skkState.candidates}
          currentIndex={skkState.candidateIndex}
          okurigana={skkState.okurigana}
        />
      )}
    </div>
  )
}
