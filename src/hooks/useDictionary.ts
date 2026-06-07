import { useState, useEffect, useCallback } from 'react'
import { DictionaryProvider, DictionaryState, loadDictionary } from '../skk/dictionary'

const DICTIONARY_URL = import.meta.env.BASE_URL + 'skk-jisyo.utf8'
const DICTIONARY_VERSION = '1.0.0'

export interface UseDictionaryResult {
  state: DictionaryState
  provider: DictionaryProvider | null
  retry: () => void
}

export function useDictionary(): UseDictionaryResult {
  const [state, setState] = useState<DictionaryState>({ status: 'idle' })
  const [provider, setProvider] = useState<DictionaryProvider | null>(null)

  const load = useCallback(async () => {
    setState({ status: 'loading' })
    try {
      const p = await loadDictionary({
        url: DICTIONARY_URL,
        version: DICTIONARY_VERSION,
        encoding: 'utf-8',
      })
      setProvider(p)
      setState({ status: 'ready', provider: p })
    } catch (err) {
      const message = err instanceof Error ? err.message : '辞書の読み込みに失敗しました'
      setState({ status: 'error', message })
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return { state, provider, retry: load }
}
