import { describe, it, expect } from 'vitest'
import { processKey, injectCandidates } from './engine'
import { INITIAL_STATE, SkkState, getPreEdit } from './types'

function key(k: string, ctrl = false): Pick<KeyboardEvent, 'key' | 'ctrlKey' | 'shiftKey'> {
  return { key: k, ctrlKey: ctrl, shiftKey: k === k.toUpperCase() && k.length === 1 }
}

function typeKeys(state: SkkState, keys: string[]): SkkState {
  let s = state
  for (const k of keys) {
    if (k.startsWith('C-')) {
      s = processKey(s, key(k.slice(2), true)).nextState
    } else {
      s = processKey(s, key(k)).nextState
    }
  }
  return s
}

describe('direct phase - romaji to hiragana', () => {
  it('converts ka to か', () => {
    const s = typeKeys(INITIAL_STATE, ['k', 'a'])
    expect(s.committed).toBe('か')
  })

  it('converts shi to し', () => {
    const s = typeKeys(INITIAL_STATE, ['s', 'h', 'i'])
    expect(s.committed).toBe('し')
  })

  it('converts tsu to つ', () => {
    const s = typeKeys(INITIAL_STATE, ['t', 's', 'u'])
    expect(s.committed).toBe('つ')
  })

  it('buffers k without committing', () => {
    const s = typeKeys(INITIAL_STATE, ['k'])
    expect(s.committed).toBe('')
    expect(s.romajiBuffer).toBe('k')
  })

  it('converts doubled consonant to sokuon', () => {
    const s = typeKeys(INITIAL_STATE, ['k', 'k', 'a'])
    expect(s.committed).toBe('っか')
  })

  it('handles nn as ん', () => {
    const s = typeKeys(INITIAL_STATE, ['n', 'n'])
    expect(s.committed).toBe('ん')
  })

  it('n before consonant becomes ん', () => {
    const s = typeKeys(INITIAL_STATE, ['n', 'k', 'a'])
    expect(s.committed).toBe('んか')
  })
})

describe('Enter inserts newline', () => {
  it('inserts newline in direct phase with empty buffer', () => {
    const s = typeKeys(INITIAL_STATE, ['k', 'a', 'Enter'])
    expect(s.committed).toBe('か\n')
  })

  it('flushes romaji buffer then inserts newline', () => {
    const s = typeKeys(INITIAL_STATE, ['k', 'Enter'])
    expect(s.committed).toBe('k\n')
    expect(s.romajiBuffer).toBe('')
  })
})

describe('Japanese punctuation in kana mode', () => {
  it('. → 。', () => {
    const s = typeKeys(INITIAL_STATE, ['.'])
    expect(s.committed).toBe('。')
  })

  it(', → 、', () => {
    const s = typeKeys(INITIAL_STATE, [','])
    expect(s.committed).toBe('、')
  })

  it('- → ー', () => {
    const s = typeKeys(INITIAL_STATE, ['-'])
    expect(s.committed).toBe('ー')
  })

  it('[ → 「', () => {
    const s = typeKeys(INITIAL_STATE, ['['])
    expect(s.committed).toBe('「')
  })

  it('] → 」', () => {
    const s = typeKeys(INITIAL_STATE, [']'])
    expect(s.committed).toBe('」')
  })

  it('/ → ・', () => {
    const s = typeKeys(INITIAL_STATE, ['/'])
    expect(s.committed).toBe('・')
  })

  it('punctuation also works in katakana mode', () => {
    const s = typeKeys({ ...INITIAL_STATE, mode: 'katakana' }, ['.'])
    expect(s.committed).toBe('。')
  })
})

describe('mode switching', () => {
  it('Q switches hiragana to katakana', () => {
    const s = typeKeys(INITIAL_STATE, ['Q'])
    expect(s.mode).toBe('katakana')
  })

  it('Q switches katakana back to hiragana', () => {
    const s = typeKeys({ ...INITIAL_STATE, mode: 'katakana' }, ['Q'])
    expect(s.mode).toBe('hiragana')
  })

  it('l switches to ASCII mode', () => {
    const s = typeKeys(INITIAL_STATE, ['l'])
    expect(s.mode).toBe('ascii')
  })

  it('L switches to zenkaku-ascii mode', () => {
    const s = typeKeys(INITIAL_STATE, ['L'])
    expect(s.mode).toBe('zenkaku-ascii')
  })

  it('Ctrl+J returns to hiragana from ascii', () => {
    const s = typeKeys({ ...INITIAL_STATE, mode: 'ascii' }, ['C-j'])
    expect(s.mode).toBe('hiragana')
  })

  it('Ctrl+J via e.code fallback (some Linux browsers report e.key !== j)', () => {
    // Simulate browser reporting e.key === 'Enter' for Ctrl+J (terminal LF convention)
    const s = processKey(
      { ...INITIAL_STATE, mode: 'ascii' },
      { key: 'Enter', ctrlKey: true, shiftKey: false, code: 'KeyJ' }
    ).nextState
    expect(s.mode).toBe('hiragana')
  })
})

describe('katakana mode', () => {
  it('converts ka to カ in katakana mode', () => {
    const s = typeKeys({ ...INITIAL_STATE, mode: 'katakana' }, ['k', 'a'])
    expect(s.committed).toBe('カ')
  })
})

describe('zenkaku-ascii mode', () => {
  it('converts a to ａ', () => {
    const s = typeKeys({ ...INITIAL_STATE, mode: 'zenkaku-ascii' }, ['a'])
    expect(s.committed).toBe('ａ')
  })
})

describe('pre-conversion phase (▽ mode)', () => {
  it('uppercase K enters pre-conversion', () => {
    const s = typeKeys(INITIAL_STATE, ['K'])
    expect(s.phase).toBe('pre-conversion')
  })

  it('accumulates kana in midashi', () => {
    const s = typeKeys(INITIAL_STATE, ['K', 'a', 'n', 'j', 'i'])
    expect(s.phase).toBe('pre-conversion')
    expect(s.midashi).toBe('かんじ')
    expect(getPreEdit(s)).toBe('▽かんじ')
  })

  it('Space emits dictionaryRequest', () => {
    let s = typeKeys(INITIAL_STATE, ['K', 'a', 'n', 'j', 'i'])
    const { nextState, dictionaryRequest } = processKey(s, key(' '))
    expect(dictionaryRequest).toEqual({ midashi: 'かんじ', okurigana: '' })
    expect(nextState.phase).toBe('conversion')
  })

  it('Enter commits midashi as-is', () => {
    const s = typeKeys(INITIAL_STATE, ['K', 'a', 'n', 'j', 'i', 'Enter'])
    expect(s.committed).toBe('かんじ')
    expect(s.phase).toBe('direct')
  })

  it('Ctrl+G cancels pre-conversion', () => {
    const s = typeKeys(INITIAL_STATE, ['K', 'a', 'n', 'C-g'])
    expect(s.phase).toBe('direct')
    expect(s.midashi).toBe('')
  })

  it('Ctrl+J commits midashi and switches to hiragana', () => {
    const s = typeKeys(INITIAL_STATE, ['K', 'a', 'n', 'j', 'i', 'C-j'])
    expect(s.committed).toBe('かんじ')
    expect(s.phase).toBe('direct')
    expect(s.mode).toBe('hiragana')
  })

  it('vowel-start: Ai produces ▽あい not ▽あi', () => {
    const s = typeKeys(INITIAL_STATE, ['A', 'i'])
    expect(s.midashi).toBe('あい')
    expect(getPreEdit(s)).toBe('▽あい')
  })

  it('Backspace removes last kana in midashi', () => {
    const s = typeKeys(INITIAL_STATE, ['K', 'a', 'n', 'j', 'i', 'Backspace'])
    expect(s.midashi).toBe('かん')
  })
})

describe('okurigana', () => {
  it('uppercase in pre-conversion starts okurigana', () => {
    let s = typeKeys(INITIAL_STATE, ['K', 'a'])
    const result = processKey(s, key('K'))
    expect(result.nextState.okuriganaBuffer).toBe('k')
  })

  it('okurigana completion emits dictionaryRequest (書く: KaKu)', () => {
    let s = typeKeys(INITIAL_STATE, ['K', 'a'])
    s = processKey(s, key('K')).nextState
    const result = processKey(s, key('u'))
    expect(result.dictionaryRequest).toEqual({ midashi: 'かk', okurigana: 'く' })
    expect(result.nextState.phase).toBe('conversion')
  })

  it('okurigana with sokuon stays in pre-conversion until complete (行った: ItTta)', () => {
    // I → pre-conv (romajiBuffer=i)
    // t → midashi=い, romajiBuffer=t
    // T → okurigana start, okuriganaBuffer=t
    // t → tt → っ + remaining t (still in pre-conv)
    // a → ta → た, okurigana complete = った
    let s = typeKeys(INITIAL_STATE, ['I', 't'])
    expect(s.midashi).toBe('い')

    s = processKey(s, key('T')).nextState
    expect(s.okuriganaBuffer).toBe('t')

    s = processKey(s, key('t')).nextState
    // っ accumulated, still pre-conversion
    expect(s.phase).toBe('pre-conversion')
    expect(s.okurigana).toBe('っ')
    expect(s.romajiBuffer).toBe('t')

    const result = processKey(s, key('a'))
    // った complete → fires dictionaryRequest
    expect(result.dictionaryRequest).toEqual({ midashi: 'いt', okurigana: 'った' })
    expect(result.nextState.phase).toBe('conversion')
    expect(result.nextState.okurigana).toBe('った')
  })

  it('okurigana with sokuon: confirmed candidate includes okurigana (行った)', () => {
    let s = typeKeys(INITIAL_STATE, ['I', 't', 'T', 't', 'a'])
    s = injectCandidates(s, ['行'])
    s = typeKeys(s, ['Enter'])
    expect(s.committed).toBe('行った')
    expect(s.phase).toBe('direct')
  })
})

describe('conversion phase (▼ mode)', () => {
  function inConversion(): SkkState {
    let s = typeKeys(INITIAL_STATE, ['K', 'a', 'n', 'j', 'i'])
    s = processKey(s, key(' ')).nextState
    return injectCandidates(s, ['漢字', '感じ', '幹事'])
  }

  it('shows first candidate', () => {
    const s = inConversion()
    expect(getPreEdit(s)).toBe('▼漢字')
  })

  it('Space moves to next candidate', () => {
    const s = typeKeys(inConversion(), [' '])
    expect(getPreEdit(s)).toBe('▼感じ')
  })

  it('Enter commits current candidate', () => {
    const s = typeKeys(inConversion(), ['Enter'])
    expect(s.committed).toBe('漢字')
    expect(s.phase).toBe('direct')
  })

  it('Ctrl+G cancels back to pre-conversion', () => {
    const s = typeKeys(inConversion(), ['C-g'])
    expect(s.phase).toBe('pre-conversion')
    expect(s.candidates).toEqual([])
  })

  it('Ctrl+J commits current candidate and switches to hiragana', () => {
    const s = typeKeys(inConversion(), ['C-j'])
    expect(s.committed).toBe('漢字')
    expect(s.phase).toBe('direct')
    expect(s.mode).toBe('hiragana')
  })

  it('no candidates commits midashi as-is', () => {
    let s = typeKeys(INITIAL_STATE, ['K', 'a', 'n', 'j', 'i'])
    s = processKey(s, key(' ')).nextState
    s = injectCandidates(s, [])
    expect(s.committed).toBe('かんじ')
    expect(s.phase).toBe('direct')
  })
})

describe('backspace in direct phase', () => {
  it('removes last committed char', () => {
    const s = typeKeys(INITIAL_STATE, ['k', 'a', 'Backspace'])
    expect(s.committed).toBe('')
  })

  it('removes from romaji buffer first', () => {
    const s = typeKeys(INITIAL_STATE, ['k', 'Backspace'])
    expect(s.romajiBuffer).toBe('')
    expect(s.committed).toBe('')
  })
})
