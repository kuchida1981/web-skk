import {
  SkkState,
  ProcessKeyResult,
  INITIAL_STATE,
} from './types'
import { convertRomaji, toZenkaku, toKatakana, isVowel } from './romaji-table'

// Punctuation conversion in hiragana/katakana mode (standard SKK mapping)
const KANA_PUNCTUATION: Record<string, string> = {
  ',': '、',
  '.': '。',
  '-': 'ー',
  '[': '「',
  ']': '」',
  '/': '・',
  '@': '゛',
}

interface KeyInfo {
  key: string
  ctrlKey: boolean
  shiftKey: boolean
}

function parseKey(e: Pick<KeyboardEvent, 'key' | 'ctrlKey' | 'shiftKey'>): KeyInfo {
  return { key: e.key, ctrlKey: e.ctrlKey, shiftKey: e.shiftKey }
}

function withCommit(state: SkkState, text: string): SkkState {
  return { ...state, committed: state.committed + text }
}

function deleteCommittedChar(state: SkkState): SkkState {
  if (state.committed.length === 0) return state
  const chars = [...state.committed]
  chars.pop()
  return { ...state, committed: chars.join('') }
}

// -----------------------------------------------------------------------
// Direct phase (no active conversion)
// -----------------------------------------------------------------------
function processDirect(state: SkkState, k: KeyInfo): ProcessKeyResult {
  const { key, ctrlKey } = k

  if (ctrlKey) {
    if (key === 'j' || key === 'J') return { nextState: { ...state, mode: 'hiragana', phase: 'direct', romajiBuffer: '' } }
    if (key === 'h' || key === 'H') return { nextState: handleBackspace(state) }
    if (key === 'g' || key === 'G') return { nextState: { ...state, phase: 'direct', romajiBuffer: '' } }
    return { nextState: state }
  }

  if (key === 'Backspace') return { nextState: handleBackspace(state) }
  if (key === 'Enter') {
    // Flush romaji buffer as-is, then insert newline
    const flushed = state.romajiBuffer
    return { nextState: withCommit({ ...state, romajiBuffer: '' }, flushed + '\n') }
  }

  if (state.mode === 'ascii') {
    if (key === 'Backspace') return { nextState: deleteCommittedChar(state) }
    if (key.length === 1) return { nextState: withCommit(state, key) }
    return { nextState: state }
  }

  if (state.mode === 'zenkaku-ascii') {
    if (key.length === 1) return { nextState: withCommit(state, toZenkaku(key)) }
    return { nextState: state }
  }

  // hiragana / katakana mode
  if (key === 'l') return { nextState: { ...state, mode: 'ascii', romajiBuffer: '' } }
  if (key === 'L') return { nextState: { ...state, mode: 'zenkaku-ascii', romajiBuffer: '' } }
  if (key === 'q' || key === 'Q') {
    if (state.mode === 'hiragana') return { nextState: { ...state, mode: 'katakana', romajiBuffer: '' } }
    if (state.mode === 'katakana') return { nextState: { ...state, mode: 'hiragana', romajiBuffer: '' } }
  }

  // Japanese punctuation in kana modes
  const kanaPunct = KANA_PUNCTUATION[key]
  if (kanaPunct !== undefined) {
    return { nextState: withCommit({ ...state, romajiBuffer: '' }, kanaPunct) }
  }

  // Uppercase letter → start pre-conversion
  if (key.length === 1 && key >= 'A' && key <= 'Z') {
    const lower = key.toLowerCase()
    return { nextState: { ...state, phase: 'pre-conversion', midashi: '', okuriganaBuffer: '', okurigana: '', candidates: [], candidateIndex: 0, romajiBuffer: lower } }
  }

  if (key.length === 1 && key >= 'a' && key <= 'z') {
    return { nextState: appendRomaji(state, key) }
  }

  if (key === ' ') return { nextState: withCommit({ ...state, romajiBuffer: '' }, ' ') }

  return { nextState: state }
}

// -----------------------------------------------------------------------
// Romaji buffer handling (shared by direct and pre-conversion)
// -----------------------------------------------------------------------
function appendRomaji(state: SkkState, ch: string): SkkState {
  const buf = state.romajiBuffer + ch
  const result = convertRomaji(buf)

  if (result.type === 'converted') {
    const kana = state.mode === 'katakana' ? toKatakana(result.kana) : result.kana
    if (state.phase === 'direct') {
      return { ...state, committed: state.committed + kana, romajiBuffer: result.remaining }
    } else {
      // pre-conversion: accumulate into midashi
      return { ...state, midashi: state.midashi + kana, romajiBuffer: result.remaining }
    }
  }

  if (result.type === 'pending') {
    return { ...state, romajiBuffer: buf }
  }

  // invalid: discard the first char
  return { ...state, romajiBuffer: result.remaining }
}

// -----------------------------------------------------------------------
// Pre-conversion phase (▽ mode)
// -----------------------------------------------------------------------
function processPreConversion(state: SkkState, k: KeyInfo): ProcessKeyResult {
  const { key, ctrlKey } = k

  if (ctrlKey) {
    if (key === 'j' || key === 'J') return { nextState: { ...state, mode: 'hiragana', phase: 'direct', midashi: '', romajiBuffer: '' } }
    if (key === 'g' || key === 'G') return { nextState: { ...state, phase: 'direct', midashi: '', romajiBuffer: '', okuriganaBuffer: '', okurigana: '' } }
    if (key === 'h' || key === 'H') return { nextState: handleBackspacePreConversion(state) }
    return { nextState: state }
  }

  if (key === 'Backspace') return { nextState: handleBackspacePreConversion(state) }

  if (key === ' ') {
    // Flush pending romaji first (treat as-is)
    const midashi = state.midashi + state.romajiBuffer
    if (!midashi) return { nextState: { ...state, phase: 'direct' } }
    const req = { midashi, okurigana: '' }
    return {
      nextState: { ...state, midashi, romajiBuffer: '', phase: 'conversion', candidateIndex: 0 },
      dictionaryRequest: req,
    }
  }

  if (key === 'Enter') {
    // Commit the midashi as-is
    const text = state.midashi + state.romajiBuffer
    return { nextState: { ...withCommit(state, text), phase: 'direct', midashi: '', romajiBuffer: '', okuriganaBuffer: '', okurigana: '' } }
  }

  // Uppercase in pre-conversion → start okurigana
  if (key.length === 1 && key >= 'A' && key <= 'Z' && state.midashi.length > 0) {
    const lower = key.toLowerCase()
    return processOkuriganaStart({ ...state, romajiBuffer: '' }, lower)
  }

  if (key.length === 1 && key >= 'a' && key <= 'z') {
    return { nextState: appendRomaji(state, key) }
  }

  return { nextState: state }
}

// Start accumulating okurigana
function processOkuriganaStart(state: SkkState, consonant: string): ProcessKeyResult {
  // The consonant starts the okurigana buffer; try to convert immediately
  const buf = consonant
  const result = convertRomaji(buf)

  if (result.type === 'converted') {
    // e.g. pressing 'A' - vowel only okurigana
    const kana = state.mode === 'katakana' ? toKatakana(result.kana) : result.kana
    const midashiKey = state.midashi + consonant
    return {
      nextState: { ...state, okurigana: kana, okuriganaBuffer: '', romajiBuffer: result.remaining, phase: 'conversion', candidateIndex: 0 },
      dictionaryRequest: { midashi: midashiKey, okurigana: kana },
    }
  }

  // pending - wait for more chars
  return { nextState: { ...state, okuriganaBuffer: consonant, romajiBuffer: consonant } }
}

// Handle okurigana romaji completion
function processOkurigana(state: SkkState, ch: string): ProcessKeyResult {
  const buf = state.romajiBuffer + ch
  const result = convertRomaji(buf)

  if (result.type === 'converted') {
    const kana = state.mode === 'katakana' ? toKatakana(result.kana) : result.kana
    const midashiKey = state.midashi + state.okuriganaBuffer
    return {
      nextState: { ...state, okurigana: kana, okuriganaBuffer: '', romajiBuffer: result.remaining, phase: 'conversion', candidateIndex: 0 },
      dictionaryRequest: { midashi: midashiKey, okurigana: kana },
    }
  }

  if (result.type === 'pending') {
    return { nextState: { ...state, romajiBuffer: buf } }
  }

  return { nextState: { ...state, romajiBuffer: result.remaining } }
}

// -----------------------------------------------------------------------
// Conversion phase (▼ mode)
// -----------------------------------------------------------------------
function processConversion(state: SkkState, k: KeyInfo): ProcessKeyResult {
  const { key, ctrlKey } = k

  if (ctrlKey) {
    if (key === 'g' || key === 'G') {
      // cancel → back to pre-conversion
      return { nextState: { ...state, phase: 'pre-conversion', candidates: [], candidateIndex: 0 } }
    }
    if (key === 'j' || key === 'J') {
      // commit current candidate
      return { nextState: commitCandidate(state) }
    }
    return { nextState: state }
  }

  if (key === 'Backspace') {
    // cancel → back to pre-conversion
    return { nextState: { ...state, phase: 'pre-conversion', candidates: [], candidateIndex: 0 } }
  }

  if (key === ' ') {
    // next candidate
    const nextIndex = state.candidateIndex + 1
    if (nextIndex >= state.candidates.length) {
      // No more candidates - commit midashi as-is
      const text = state.midashi + state.okurigana
      return { nextState: { ...withCommit(state, text), phase: 'direct', midashi: '', okurigana: '', candidates: [], candidateIndex: 0, romajiBuffer: '' } }
    }
    return { nextState: { ...state, candidateIndex: nextIndex } }
  }

  if (key === 'Enter') {
    return { nextState: commitCandidate(state) }
  }

  // Any other printable key → commit then process in direct
  return processDirect(commitCandidate(state), k)
}

function commitCandidate(state: SkkState): SkkState {
  const candidate = state.candidates[state.candidateIndex] ?? state.midashi
  const text = candidate + state.okurigana
  return {
    ...withCommit(state, text),
    phase: 'direct',
    midashi: '',
    okurigana: '',
    okuriganaBuffer: '',
    candidates: [],
    candidateIndex: 0,
    romajiBuffer: '',
  }
}

// -----------------------------------------------------------------------
// Backspace handling
// -----------------------------------------------------------------------
function handleBackspace(state: SkkState): SkkState {
  if (state.romajiBuffer.length > 0) {
    return { ...state, romajiBuffer: state.romajiBuffer.slice(0, -1) }
  }
  return deleteCommittedChar(state)
}

function handleBackspacePreConversion(state: SkkState): SkkState {
  if (state.romajiBuffer.length > 0) {
    return { ...state, romajiBuffer: state.romajiBuffer.slice(0, -1) }
  }
  if (state.midashi.length > 0) {
    const chars = [...state.midashi]
    chars.pop()
    return { ...state, midashi: chars.join('') }
  }
  // Nothing left in pre-conversion - cancel
  return { ...state, phase: 'direct' }
}

// -----------------------------------------------------------------------
// Main entry point
// -----------------------------------------------------------------------
export function processKey(
  state: SkkState,
  event: Pick<KeyboardEvent, 'key' | 'ctrlKey' | 'shiftKey'>
): ProcessKeyResult {
  const k = parseKey(event)

  // Global ctrl shortcuts
  if (k.ctrlKey && (k.key === 'j' || k.key === 'J')) {
    return { nextState: { ...INITIAL_STATE, committed: state.committed } }
  }

  switch (state.phase) {
    case 'direct':
      return processDirect(state, k)
    case 'pre-conversion':
      if (state.okuriganaBuffer) {
        if (k.key.length === 1 && k.key >= 'a' && k.key <= 'z') {
          return processOkurigana(state, k.key)
        }
      }
      return processPreConversion(state, k)
    case 'conversion':
      return processConversion(state, k)
  }
}

export function injectCandidates(state: SkkState, candidates: string[]): SkkState {
  if (candidates.length === 0) {
    // No candidates - commit midashi as-is
    const text = state.midashi + state.okurigana
    return { ...withCommit(state, text), phase: 'direct', midashi: '', okurigana: '', candidates: [], candidateIndex: 0, romajiBuffer: '' }
  }
  return { ...state, candidates, candidateIndex: 0 }
}

// Unused import fix
void isVowel
