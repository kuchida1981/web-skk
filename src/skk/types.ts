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
  wordRegistration?: {
    midashi: string      // display form for registration prompt (includes okurigana)
    midashiKey: string   // dictionary key (e.g., "うごk")
    okurigana: string    // okurigana portion (absorbed into midashi; kept for reference)
    inputState: SkkState // inner SKK state for typing the registration word
  }
}

export interface DictionaryRequest {
  midashi: string
  okurigana: string
}

export interface ProcessKeyResult {
  nextState: SkkState
  dictionaryRequest?: DictionaryRequest
  registrationResult?: {
    midashiKey: string
    word: string
  }
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
  if (state.wordRegistration) {
    const { midashi, okurigana, inputState } = state.wordRegistration
    return '[登録: ' + midashi + okurigana + ']' + getPreEdit(inputState)
  }
  if (state.phase === 'direct') return state.romajiBuffer
  if (state.phase === 'pre-conversion') {
    return '▽' + state.midashi + state.okurigana + state.romajiBuffer
  }
  // conversion
  const candidate = state.candidates[state.candidateIndex] ?? ''
  return '▼' + candidate + state.okurigana
}
