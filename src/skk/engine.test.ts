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

  it('vowel-start: A alone produces ▽あ not ▽a', () => {
    const s = typeKeys(INITIAL_STATE, ['A'])
    expect(s.midashi).toBe('あ')
    expect(getPreEdit(s)).toBe('▽あ')
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

  it('vowel-start okurigana: IKi fires dictionaryRequest (行き)', () => {
    // 'I' starts pre-conversion with romajiBuffer='i' (midashi still empty).
    // 'K' (uppercase) must flush 'i'→'い' into midashi before starting okurigana.
    let s = typeKeys(INITIAL_STATE, ['I'])
    const result = processKey(s, key('K'))
    expect(result.nextState.okuriganaBuffer).toBe('k')
    expect(result.nextState.midashi).toBe('い')

    const result2 = processKey(result.nextState, key('i'))
    expect(result2.dictionaryRequest).toEqual({ midashi: 'いk', okurigana: 'き' })
    expect(result2.nextState.phase).toBe('conversion')
  })

  it('okurigana with n: ShiNz flushes n→ん into midashi before okurigana start (信じる)', () => {
    // 'S','h','i' → midashi='し', 'n' → romajiBuffer='n' (pending).
    // 'Z' (uppercase) must treat 'n' as 'nn'→'ん' and flush to midashi before okurigana.
    let s = typeKeys(INITIAL_STATE, ['S', 'h', 'i', 'n'])
    expect(s.midashi).toBe('し')
    expect(s.romajiBuffer).toBe('n')

    const result = processKey(s, key('Z'))
    expect(result.nextState.midashi).toBe('しん')
    expect(result.nextState.okuriganaBuffer).toBe('z')
  })

  it('n followed by uppercase in direct phase commits ん before pre-conversion', () => {
    // 'n' in direct phase stays pending; uppercase must flush it as ん.
    let s = typeKeys(INITIAL_STATE, ['n'])
    expect(s.romajiBuffer).toBe('n')

    const result = processKey(s, key('K'))
    expect(result.nextState.committed).toBe('ん')
    expect(result.nextState.phase).toBe('pre-conversion')
    expect(result.nextState.midashi).toBe('')
    expect(result.nextState.romajiBuffer).toBe('k')
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

  it('no candidates enters word registration mode', () => {
    let s = typeKeys(INITIAL_STATE, ['K', 'a', 'n', 'j', 'i'])
    s = processKey(s, key(' ')).nextState
    s = injectCandidates(s, [])
    expect(s.wordRegistration).toBeDefined()
    expect(s.wordRegistration?.midashi).toBe('かんじ')
    expect(s.wordRegistration?.midashiKey).toBe('かんじ')
    expect(s.committed).toBe('')
  })
})

describe('getPreEdit - word registration display', () => {
  function inRegistration(midashi: string): SkkState {
    return {
      ...INITIAL_STATE,
      phase: 'pre-conversion',
      midashi,
      wordRegistration: {
        midashi,
        midashiKey: midashi,
        okurigana: '',
        inputState: INITIAL_STATE,
      },
    }
  }

  it('shows [登録: かんじ] for simple case', () => {
    const s = inRegistration('かんじ')
    expect(getPreEdit(s)).toBe('[登録: かんじ]')
  })

  it('shows [登録: うごく] for okurigana case', () => {
    const s: SkkState = {
      ...INITIAL_STATE,
      phase: 'pre-conversion',
      midashi: 'うご',
      wordRegistration: {
        midashi: 'うごく',
        midashiKey: 'うごk',
        okurigana: '',
        inputState: INITIAL_STATE,
      },
    }
    expect(getPreEdit(s)).toBe('[登録: うごく]')
  })

  it('shows [登録: かんじ]▽かん for inner pre-conversion', () => {
    const innerState: SkkState = {
      ...INITIAL_STATE,
      phase: 'pre-conversion',
      midashi: 'かん',
    }
    const s: SkkState = {
      ...INITIAL_STATE,
      phase: 'pre-conversion',
      wordRegistration: {
        midashi: 'かんじ',
        midashiKey: 'かんじ',
        okurigana: '',
        inputState: innerState,
      },
    }
    expect(getPreEdit(s)).toBe('[登録: かんじ]▽かん')
  })

  it('shows [登録: かんじ]漢▽じ for inner with committed text', () => {
    const innerState: SkkState = {
      ...INITIAL_STATE,
      phase: 'pre-conversion',
      midashi: 'じ',
      committed: '漢',
    }
    const s: SkkState = {
      ...INITIAL_STATE,
      phase: 'pre-conversion',
      wordRegistration: {
        midashi: 'かんじ',
        midashiKey: 'かんじ',
        okurigana: '',
        inputState: innerState,
      },
    }
    expect(getPreEdit(s)).toBe('[登録: かんじ]漢▽じ')
  })

  it('shows nested [登録: かんじ][登録: かん]▽か for recursive registration', () => {
    const innerInner: SkkState = { ...INITIAL_STATE, phase: 'pre-conversion', midashi: 'か' }
    const inner: SkkState = {
      ...INITIAL_STATE,
      phase: 'pre-conversion',
      wordRegistration: {
        midashi: 'かん',
        midashiKey: 'かん',
        okurigana: '',
        inputState: innerInner,
      },
    }
    const s: SkkState = {
      ...INITIAL_STATE,
      phase: 'pre-conversion',
      wordRegistration: {
        midashi: 'かんじ',
        midashiKey: 'かんじ',
        okurigana: '',
        inputState: inner,
      },
    }
    expect(getPreEdit(s)).toBe('[登録: かんじ][登録: かん]▽か')
  })
})

describe('word registration - entering mode', () => {
  it('injectCandidates with empty array enters word registration mode', () => {
    let s = typeKeys(INITIAL_STATE, ['K', 'a', 'n', 'j', 'i'])
    s = processKey(s, key(' ')).nextState
    s = injectCandidates(s, [])
    expect(s.wordRegistration).toBeDefined()
    expect(s.wordRegistration?.midashi).toBe('かんじ')
    expect(s.wordRegistration?.midashiKey).toBe('かんじ')
    expect(s.committed).toBe('')
  })

  it('injectCandidates with empty array for okurigana enters registration with correct midashiKey', () => {
    // うごく: midashi='うご', okuriganaBuffer='k', okurigana='く'
    let s: SkkState = {
      ...INITIAL_STATE,
      phase: 'conversion',
      midashi: 'うご',
      okuriganaBuffer: 'k',
      okurigana: 'く',
      candidates: [],
      candidateIndex: 0,
    }
    s = injectCandidates(s, [])
    expect(s.wordRegistration).toBeDefined()
    expect(s.wordRegistration?.midashi).toBe('うごく')
    expect(s.wordRegistration?.midashiKey).toBe('うごk')
  })

  it('running out of candidates in conversion enters registration mode', () => {
    let s = typeKeys(INITIAL_STATE, ['K', 'a', 'n', 'j', 'i'])
    s = processKey(s, key(' ')).nextState
    s = injectCandidates(s, ['漢字'])
    // now press Space again to exhaust candidates
    s = processKey(s, key(' ')).nextState
    expect(s.wordRegistration).toBeDefined()
    expect(s.wordRegistration?.midashi).toBe('かんじ')
  })
})

describe('word registration - Enter/Ctrl+J confirm', () => {
  function inRegistrationWithInner(midashi: string, innerCommitted: string): SkkState {
    return {
      ...INITIAL_STATE,
      phase: 'pre-conversion',
      midashi,
      wordRegistration: {
        midashi,
        midashiKey: midashi,
        okurigana: '',
        inputState: { ...INITIAL_STATE, committed: innerCommitted },
      },
    }
  }

  it('Enter confirms registration when inner has committed text', () => {
    const s = inRegistrationWithInner('かんじ', '漢字')
    const result = processKey(s, key('Enter'))
    expect(result.registrationResult).toEqual({ midashiKey: 'かんじ', word: '漢字' })
    expect(result.nextState.committed).toBe('漢字')
    expect(result.nextState.phase).toBe('direct')
    expect(result.nextState.wordRegistration).toBeUndefined()
  })

  it('Ctrl+J confirms registration when inner has committed text', () => {
    const s = inRegistrationWithInner('かんじ', '漢字')
    const result = processKey(s, key('j', true))
    expect(result.registrationResult).toEqual({ midashiKey: 'かんじ', word: '漢字' })
    expect(result.nextState.committed).toBe('漢字')
    expect(result.nextState.phase).toBe('direct')
  })

  it('Enter does not confirm when inner committed is empty', () => {
    const s = inRegistrationWithInner('かんじ', '')
    const result = processKey(s, key('Enter'))
    expect(result.registrationResult).toBeUndefined()
    expect(result.nextState.wordRegistration).toBeDefined()
  })
})

describe('word registration - Ctrl+G cancel', () => {
  it('Ctrl+G cancels registration and returns to pre-conversion', () => {
    let s = typeKeys(INITIAL_STATE, ['K', 'a', 'n', 'j', 'i'])
    s = processKey(s, key(' ')).nextState
    s = injectCandidates(s, [])
    expect(s.wordRegistration).toBeDefined()
    s = processKey(s, key('g', true)).nextState
    expect(s.wordRegistration).toBeUndefined()
    expect(s.phase).toBe('pre-conversion')
    expect(s.midashi).toBe('かんじ')
  })
})

describe('word registration - recursive registration', () => {
  it('can enter nested registration from inner state', () => {
    let s = typeKeys(INITIAL_STATE, ['K', 'a', 'n', 'j', 'i'])
    s = processKey(s, key(' ')).nextState
    s = injectCandidates(s, [])
    expect(s.wordRegistration).toBeDefined()

    // In inner state, start conversion for かんじ → no candidates → nested registration
    s = processKey(s, key('K')).nextState
    s = processKey(s, key('a')).nextState
    const innerSpaceResult = processKey(s, key(' '))
    s = innerSpaceResult.nextState
    // inner made a dictionaryRequest; inject empty candidates
    s = injectCandidates(s, [])
    // Now inner state also has wordRegistration → nested
    expect(s.wordRegistration?.inputState.wordRegistration).toBeDefined()
  })

  it('getPreEdit shows nested display', () => {
    let s = typeKeys(INITIAL_STATE, ['K', 'a', 'n', 'j', 'i'])
    s = processKey(s, key(' ')).nextState
    s = injectCandidates(s, [])
    // type かん in inner (K→pre-conv, a→か, n,n→ん, then Space)
    s = processKey(s, key('K')).nextState
    s = processKey(s, key('a')).nextState
    s = processKey(s, key('n')).nextState
    s = processKey(s, key('n')).nextState  // nn→ん
    const inner2Result = processKey(s, key(' '))
    s = inner2Result.nextState
    s = injectCandidates(s, [])
    // outer: [登録: かんじ], inner: [登録: かん], inner-inner: empty direct
    const preEdit = getPreEdit(s)
    expect(preEdit).toContain('[登録: かんじ]')
    expect(preEdit).toContain('[登録: かん]')
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
