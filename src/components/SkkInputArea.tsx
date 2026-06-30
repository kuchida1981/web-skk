import { useEffect, useRef } from 'react'
import { SkkState, getPreEdit, getActiveConversionState } from '../skk/types'
import { CandidatePopup } from './CandidatePopup'

interface Props {
  skkState: SkkState
  disabled: boolean
  onKeyDown: (e: KeyboardEvent) => void
}

export function SkkInputArea({ skkState, disabled, onKeyDown }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const isFocusedRef = useRef(false)

  // Auto-focus on mount and when disabled changes.
  // Also sync isFocusedRef here: the focus event fires synchronously inside focus(),
  // before the focus-listener effect (below) has a chance to attach its handler on
  // initial mount when disabled=false from the start (e.g. game mode).
  useEffect(() => {
    if (!disabled) {
      ref.current?.focus()
      isFocusedRef.current = (document.activeElement === ref.current)
    }
  }, [disabled])

  // Re-focus when mode changes (recovers focus if browser opened Downloads via Ctrl+J)
  useEffect(() => {
    if (!disabled) {
      ref.current?.focus()
      isFocusedRef.current = (document.activeElement === ref.current)
    }
  }, [disabled, skkState.mode])

  // Track whether our input area has focus
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onFocus = () => { isFocusedRef.current = true }
    const onBlur = () => { isFocusedRef.current = false }
    el.addEventListener('focus', onFocus)
    el.addEventListener('blur', onBlur)
    return () => {
      el.removeEventListener('focus', onFocus)
      el.removeEventListener('blur', onBlur)
    }
  }, [])

  // Listen on window in capture phase so Ctrl+J is intercepted before the browser
  // handles it as a Downloads shortcut (Chrome/Firefox both bind Ctrl+J to Downloads)
  useEffect(() => {
    if (disabled) return
    const captureHandler = (e: KeyboardEvent) => {
      if (!isFocusedRef.current) return
      onKeyDown(e)
    }
    window.addEventListener('keydown', captureHandler, { capture: true })
    return () => window.removeEventListener('keydown', captureHandler, { capture: true })
  }, [onKeyDown, disabled])

  const preEdit = getPreEdit(skkState)
  const activeConversion = getActiveConversionState(skkState)

  const chars = [...skkState.committed]
  const committedBefore = chars.slice(0, skkState.cursorPos).join('')
  const committedAfter = chars.slice(skkState.cursorPos).join('')

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
        <span className="skk-committed">{committedBefore}</span>
        {preEdit && (
          <span className="skk-preedit">{preEdit}</span>
        )}
        <span className="skk-cursor" aria-hidden="true" />
        {committedAfter && <span className="skk-committed">{committedAfter}</span>}
      </div>
      {activeConversion && (
        <CandidatePopup
          candidates={activeConversion.candidates}
          currentIndex={activeConversion.candidateIndex}
          okurigana={activeConversion.okurigana}
        />
      )}
    </div>
  )
}
