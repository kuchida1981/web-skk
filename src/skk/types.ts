export type SkkMode = 'hiragana' | 'katakana' | 'ascii' | 'zenkaku-ascii'
export type SkkPhase = 'direct' | 'pre-conversion' | 'conversion'

export interface SkkState {
  mode: SkkMode
  phase: SkkPhase
  committed: string
  romajiBuffer: string
  // pre-conversion / conversion phase fields
  midashi: string         // accumulated kana for dictionary lookup
  okuriganaBuffer: string // okurigana consonant(s) collected so far
  okurigana: string       // confirmed okurigana kana
  candidates: string[]
  candidateIndex: number
}

export interface DictionaryRequest {
  midashi: string
  okurigana: string
}

export interface ProcessKeyResult {
  nextState: SkkState
  dictionaryRequest?: DictionaryRequest
}

export const INITIAL_STATE: SkkState = {
  mode: 'hiragana',
  phase: 'direct',
  committed: '',
  romajiBuffer: '',
  midashi: '',
  okuriganaBuffer: '',
  okurigana: '',
  candidates: [],
  candidateIndex: 0,
}

export function getPreEdit(state: SkkState): string {
  if (state.phase === 'direct') return state.romajiBuffer
  if (state.phase === 'pre-conversion') {
    return '▽' + state.midashi + state.okurigana + state.romajiBuffer
  }
  // conversion
  const candidate = state.candidates[state.candidateIndex] ?? ''
  return '▼' + candidate + state.okurigana
}
