import { useState, useCallback, useRef } from 'react'
import { SkkState, INITIAL_STATE, getPreEdit } from '../skk/types'
import { processKey, injectCandidates } from '../skk/engine'
import { DictionaryProvider, PersonalDictionaryProvider } from '../skk/dictionary'

export interface SkkEngineState {
  skkState: SkkState
  displayText: string
}

export function useSkkEngine(provider: DictionaryProvider | null, personalProvider?: PersonalDictionaryProvider) {
  const [skkState, setSkkState] = useState<SkkState>(INITIAL_STATE)
  // Track current phase via ref so handleKeyDown (memoized) can read it without
  // being recreated on every state change.
  const phaseRef = useRef(skkState.phase)
  phaseRef.current = skkState.phase

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Let browser handle copy/paste/refresh shortcuts
      if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'r')) return
      if (e.key === 'F5') return
      // Pass Tab to browser only in direct phase; in pre-conversion/conversion the
      // engine handles it (next candidate), so we must intercept it here.
      if (e.key === 'Tab' && phaseRef.current === 'direct') return

      e.preventDefault()
      e.stopPropagation()

      setSkkState((prev) => {
        const { nextState, dictionaryRequest, registrationResult } = processKey(prev, { key: e.key, ctrlKey: e.ctrlKey, shiftKey: e.shiftKey, altKey: e.altKey, code: e.code })

        if (registrationResult) {
          personalProvider?.register(registrationResult.midashiKey, registrationResult.word)
        }

        if (dictionaryRequest && provider) {
          const candidates = provider.lookup(dictionaryRequest.midashi, dictionaryRequest.okurigana)
          return injectCandidates(nextState, candidates)
        }

        return nextState
      })
    },
    [provider, personalProvider]
  )

  const reset = useCallback(() => {
    setSkkState((prev) => ({ ...INITIAL_STATE, mode: prev.mode }))
  }, [])

  const displayText = skkState.committed + getPreEdit(skkState)

  return { skkState, displayText, handleKeyDown, reset }
}
