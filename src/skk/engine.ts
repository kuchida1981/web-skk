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
    let s = state
    if (s.romajiBuffer.length > 0) {
      const bufferToConvert = s.romajiBuffer === 'n' ? 'nn' : s.romajiBuffer
      const result = convertRomaji(bufferToConvert)
      if (result.type === 'converted') {
        const kana = s.mode === 'katakana' ? toKatakana(result.kana) : result.kana
        s = { ...s, committed: s.committed + kana, romajiBuffer: result.remaining }
      }
    }
    const initial: SkkState = { ...s, phase: 'pre-conversion', midashi: '', okuriganaBuffer: '', okurigana: '', candidates: [], candidateIndex: 0, romajiBuffer: '' }
    return { nextState: appendRomaji(initial, lower) }
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
  let buf = state.romajiBuffer + ch
  let s = state

  // Loop so that a conversion's remaining chars are also processed immediately.
  // e.g. romajiBuffer='a', ch='i' → buf='ai' → 'a'→'あ' remaining='i' → 'i'→'い'
  while (buf.length > 0) {
    const result = convertRomaji(buf)
    if (result.type === 'converted') {
      const kana = s.mode === 'katakana' ? toKatakana(result.kana) : result.kana
      if (s.phase === 'direct') {
        s = { ...s, committed: s.committed + kana }
      } else {
        s = { ...s, midashi: s.midashi + kana }
      }
      buf = result.remaining
    } else if (result.type === 'pending') {
      break
    } else {
      // invalid: discard first char and retry
      buf = result.remaining
    }
  }

  return { ...s, romajiBuffer: buf }
}

// -----------------------------------------------------------------------
// Pre-conversion phase (▽ mode)
// -----------------------------------------------------------------------
function processPreConversion(state: SkkState, k: KeyInfo): ProcessKeyResult {
  const { key, ctrlKey } = k

  if (ctrlKey) {
    if (key === 'j' || key === 'J') {
      // Commit midashi text as-is and switch to hiragana (SKK kakutei)
      let text = state.midashi
      if (state.romajiBuffer.length > 0) {
        const bufferToConvert = state.romajiBuffer === 'n' ? 'nn' : state.romajiBuffer
        const result = convertRomaji(bufferToConvert)
        if (result.type === 'converted') {
          const kana = state.mode === 'katakana' ? toKatakana(result.kana) : result.kana
          text += kana
        } else {
          text += state.romajiBuffer
        }
      }
      return {
        nextState: {
          ...withCommit(state, text),
          mode: 'hiragana',
          phase: 'direct',
          midashi: '',
          romajiBuffer: '',
          okuriganaBuffer: '',
          okurigana: '',
        },
      }
    }
    if (key === 'g' || key === 'G') return { nextState: { ...state, phase: 'direct', midashi: '', romajiBuffer: '', okuriganaBuffer: '', okurigana: '' } }
    if (key === 'h' || key === 'H') return { nextState: handleBackspacePreConversion(state) }
    return { nextState: state }
  }

  if (key === 'Backspace') return { nextState: handleBackspacePreConversion(state) }

  // q: convert midashi to katakana and commit (standard SKK ▽→カタカナ)
  if (key === 'q') {
    let text = state.midashi
    if (state.romajiBuffer === 'n') {
      text += 'ん'
    }
    const katakana = toKatakana(text)
    return {
      nextState: {
        ...withCommit(state, katakana),
        phase: 'direct',
        midashi: '',
        romajiBuffer: '',
        okuriganaBuffer: '',
        okurigana: '',
      },
    }
  }

  if (key === ' ' || key === 'Tab') {
    // Flush pending romaji first (treat as-is, but handle 'n' -> 'ん')
    let midashi = state.midashi
    if (state.romajiBuffer.length > 0) {
      const bufferToConvert = state.romajiBuffer === 'n' ? 'nn' : state.romajiBuffer
      const result = convertRomaji(bufferToConvert)
      if (result.type === 'converted') {
        const kana = state.mode === 'katakana' ? toKatakana(result.kana) : result.kana
        midashi += kana
      } else {
        midashi += state.romajiBuffer
      }
    }

    if (!midashi) return { nextState: { ...state, phase: 'direct' } }
    const req = { midashi, okurigana: '' }
    return {
      nextState: { ...state, midashi, romajiBuffer: '', phase: 'conversion', candidateIndex: 0 },
      dictionaryRequest: req,
    }
  }

  if (key === 'Enter') {
    // Commit the midashi as-is
    let text = state.midashi
    if (state.romajiBuffer.length > 0) {
      const bufferToConvert = state.romajiBuffer === 'n' ? 'nn' : state.romajiBuffer
      const result = convertRomaji(bufferToConvert)
      if (result.type === 'converted') {
        const kana = state.mode === 'katakana' ? toKatakana(result.kana) : result.kana
        text += kana
      } else {
        text += state.romajiBuffer
      }
    }
    return { nextState: { ...withCommit(state, text), phase: 'direct', midashi: '', romajiBuffer: '', okuriganaBuffer: '', okurigana: '' } }
  }

  // Uppercase in pre-conversion → start okurigana
  if (key.length === 1 && key >= 'A' && key <= 'Z') {
    const lower = key.toLowerCase()
    // Flush romajiBuffer to midashi when it converts immediately (e.g. vowel-start 'IKi' → 行き:
    // after 'I', romajiBuffer='i' but midashi=''; without this flush, 'K' would be silently dropped)
    let s = state
    if (s.romajiBuffer.length > 0) {
      const bufferToConvert = s.romajiBuffer === 'n' ? 'nn' : s.romajiBuffer
      const result = convertRomaji(bufferToConvert)
      if (result.type === 'converted') {
        const kana = s.mode === 'katakana' ? toKatakana(result.kana) : result.kana
        s = { ...s, midashi: s.midashi + kana, romajiBuffer: result.remaining }
      }
    }
    if (s.midashi.length > 0) {
      return processOkuriganaStart({ ...s, romajiBuffer: '' }, lower)
    }
  }

  if (key.length === 1 && key >= 'a' && key <= 'z') {
    return { nextState: appendRomaji(state, key) }
  }

  // Japanese punctuation (e.g. - → ー) appends to midashi in pre-conversion
  const kanaPunct = KANA_PUNCTUATION[key]
  if (kanaPunct !== undefined) {
    return { nextState: { ...state, midashi: state.midashi + kanaPunct, romajiBuffer: '' } }
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

    if (result.remaining) {
      // Sokuon (っ) case: kana produced but romaji still pending (e.g. "tt" → っ + remaining "t")
      // Accumulate into okurigana and stay in pre-conversion to collect the rest
      return {
        nextState: {
          ...state,
          okurigana: state.okurigana + kana,
          romajiBuffer: result.remaining,
        },
      }
    }

    // Okurigana complete
    const fullOkurigana = state.okurigana + kana
    const midashiKey = state.midashi + state.okuriganaBuffer
    return {
      nextState: {
        ...state,
        okurigana: fullOkurigana,
        okuriganaBuffer: '',
        romajiBuffer: '',
        phase: 'conversion',
        candidateIndex: 0,
      },
      dictionaryRequest: { midashi: midashiKey, okurigana: fullOkurigana },
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
      // Commit current candidate and switch to hiragana (SKK kakutei)
      return { nextState: { ...commitCandidate(state), mode: 'hiragana' } }
    }
    return { nextState: state }
  }

  if (key === 'Backspace') {
    // cancel → back to pre-conversion
    return { nextState: { ...state, phase: 'pre-conversion', candidates: [], candidateIndex: 0 } }
  }

  if (key === ' ' || key === 'Tab') {
    // next candidate
    const nextIndex = state.candidateIndex + 1
    if (nextIndex >= state.candidates.length) {
      return { nextState: enterWordRegistration(state) }
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
  event: Pick<KeyboardEvent, 'key' | 'ctrlKey' | 'shiftKey'> & { code?: string }
): ProcessKeyResult {
  const raw = parseKey(event)

  // Normalize: if Ctrl is held and the physical key is J (e.code==='KeyJ') but
  // e.key is not 'j'/'J', coerce to 'j'. Some Linux browsers report e.key='Enter'
  // for Ctrl+J because Ctrl+J = LF (0x0A) in terminal convention.
  const k: KeyInfo =
    raw.ctrlKey && event.code === 'KeyJ' && raw.key !== 'j' && raw.key !== 'J'
      ? { ...raw, key: 'j' }
      : raw

  if (state.wordRegistration) {
    return processWordRegistration(state, k)
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

// -----------------------------------------------------------------------
// Word registration mode
// -----------------------------------------------------------------------

function enterWordRegistration(state: SkkState): SkkState {
  // midashi: full display form (kana root + okurigana)
  // midashiKey: dictionary key (e.g., "うごk")
  const midashi = state.midashi + state.okurigana
  const midashiKey = state.okurigana
    ? state.midashi + state.okuriganaBuffer
    : state.midashi
  return {
    ...state,
    phase: 'pre-conversion',
    candidates: [],
    candidateIndex: 0,
    wordRegistration: {
      midashi,
      midashiKey,
      okurigana: '',
      inputState: { ...INITIAL_STATE, mode: state.mode },
    },
  }
}

function processWordRegistration(state: SkkState, k: KeyInfo): ProcessKeyResult {
  const wr = state.wordRegistration!

  // Ctrl+G: cancel inner composition first; only exit registration when inner is idle
  if (k.ctrlKey && (k.key === 'g' || k.key === 'G')) {
    const hasInnerComposition =
      wr.inputState.phase !== 'direct' ||
      wr.inputState.wordRegistration !== undefined
    if (!hasInnerComposition) {
      return { nextState: { ...state, wordRegistration: undefined } }
    }
    const innerResult = processKey(wr.inputState, k)
    return {
      nextState: { ...state, wordRegistration: { ...wr, inputState: innerResult.nextState } },
    }
  }

  // Enter / Ctrl+J:
  if (k.key === 'Enter' || (k.ctrlKey && (k.key === 'j' || k.key === 'J'))) {
    // If inner is in conversion phase, Enter should first commit that conversion
    if (wr.inputState.phase === 'conversion' || wr.inputState.phase === 'pre-conversion') {
      const innerResult = processKey(wr.inputState, k)
      return {
        nextState: {
          ...state,
          wordRegistration: { ...wr, inputState: innerResult.nextState },
        },
        dictionaryRequest: innerResult.dictionaryRequest,
        registrationResult: innerResult.registrationResult,
      }
    }

    // Otherwise, commit the whole registration
    // We want to commit BOTH already-committed text and any pending midashi in the inner state
    const word = wr.inputState.committed + wr.inputState.midashi + wr.inputState.romajiBuffer
    if (!word) return { nextState: state }
    return {
      nextState: {
        ...withCommit(state, word),
        phase: 'direct',
        midashi: '',
        okurigana: '',
        okuriganaBuffer: '',
        candidates: [],
        candidateIndex: 0,
        romajiBuffer: '',
        wordRegistration: undefined,
      },
      registrationResult: { midashiKey: wr.midashiKey, word },
    }
  }

  // Other keys: delegate to inner state
  const innerResult = processKey(wr.inputState, k)
  return {
    nextState: {
      ...state,
      wordRegistration: { ...wr, inputState: innerResult.nextState },
    },
    dictionaryRequest: innerResult.dictionaryRequest,
    registrationResult: innerResult.registrationResult,
  }
}

export function injectCandidates(state: SkkState, candidates: string[]): SkkState {
  if (state.wordRegistration) {
    return {
      ...state,
      wordRegistration: {
        ...state.wordRegistration,
        inputState: injectCandidates(state.wordRegistration.inputState, candidates),
      },
    }
  }
  if (candidates.length === 0) {
    return enterWordRegistration(state)
  }
  return { ...state, candidates, candidateIndex: 0 }
}

// Unused import fix
void isVowel
