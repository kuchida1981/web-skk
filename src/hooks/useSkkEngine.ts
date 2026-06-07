import { useState, useCallback } from 'react'
import { SkkState, INITIAL_STATE, getPreEdit } from '../skk/types'
import { processKey, injectCandidates } from '../skk/engine'
import { DictionaryProvider, PersonalDictionaryProvider } from '../skk/dictionary'

export interface SkkEngineState {
  skkState: SkkState
  displayText: string
}

export function useSkkEngine(provider: DictionaryProvider | null, personalProvider?: PersonalDictionaryProvider) {
  const [skkState, setSkkState] = useState<SkkState>(INITIAL_STATE)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Let browser handle copy/paste/refresh shortcuts
      if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'a' || e.key === 'r')) return
      if (e.key === 'Tab' || e.key === 'F5') return

      e.preventDefault()
      e.stopPropagation()

      setSkkState((prev) => {
        const { nextState, dictionaryRequest, registrationResult } = processKey(prev, { key: e.key, ctrlKey: e.ctrlKey, shiftKey: e.shiftKey, code: e.code })

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

  const displayText = skkState.committed + getPreEdit(skkState)

  return { skkState, displayText, handleKeyDown }
}
