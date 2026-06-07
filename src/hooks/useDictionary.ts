import { useState, useEffect, useCallback, useMemo } from 'react'
import { DictionaryProvider, DictionaryState, PersonalDictionaryProvider, CompoundDictionaryProvider, loadDictionary } from '../skk/dictionary'

const DICTIONARY_URL = '/skk-jisyo.utf8'
const DICTIONARY_VERSION = '1.0.0'

export interface UseDictionaryResult {
  state: DictionaryState
  provider: DictionaryProvider | null
  retry: () => void
  personalProvider: PersonalDictionaryProvider
}

export function useDictionary(): UseDictionaryResult {
  const personalProvider = useMemo(() => new PersonalDictionaryProvider(), [])
  const [state, setState] = useState<DictionaryState>({ status: 'idle' })
  const [provider, setProvider] = useState<DictionaryProvider | null>(null)

  const load = useCallback(async () => {
    setState({ status: 'loading' })
    try {
      const base = await loadDictionary({
        url: DICTIONARY_URL,
        version: DICTIONARY_VERSION,
        encoding: 'utf-8',
      })
      const compound = new CompoundDictionaryProvider(personalProvider, base)
      setProvider(compound)
      setState({ status: 'ready', provider: compound })
    } catch (err) {
      const message = err instanceof Error ? err.message : '辞書の読み込みに失敗しました'
      setState({ status: 'error', message })
    }
  }, [personalProvider])

  useEffect(() => {
    void load()
  }, [load])

  return { state, provider, retry: load, personalProvider }
}
