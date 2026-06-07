import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MockDictionaryProvider, MapDictionaryProvider, PersonalDictionaryProvider, CompoundDictionaryProvider } from './dictionary'

function makeLocalStorageMock() {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
    get length() { return Object.keys(store).length },
    key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
  }
}

// Minimal JISYO format for testing
const SAMPLE_JISYO = `;; okuri-ari entries.
かk /書/
;; okuri-nasi entries.
かんじ /漢字/感じ/幹事/
てんき /天気/点機/
`

// Parse the sample jisyo manually to build a Map
function buildMap(text: string): Map<string, string[]> {
  const map = new Map<string, string[]>()
  let inSection = false
  for (const line of text.split('\n')) {
    if (!inSection) {
      if (line.startsWith(';; okuri-ari entries')) inSection = true
      continue
    }
    if (line.startsWith(';')) continue
    if (!line.trim()) continue
    const spaceIdx = line.indexOf(' ')
    if (spaceIdx < 0) continue
    const midashi = line.slice(0, spaceIdx)
    const parts = line.slice(spaceIdx + 1).split('/').filter(Boolean)
    const candidates = parts.map((p) => p.split(';')[0].trim()).filter(Boolean)
    if (candidates.length) map.set(midashi, candidates)
  }
  return map
}

describe('MapDictionaryProvider', () => {
  const map = buildMap(SAMPLE_JISYO)
  const provider = new MapDictionaryProvider(map)

  it('looks up かんじ', () => {
    expect(provider.lookup('かんじ', '')).toEqual(['漢字', '感じ', '幹事'])
  })

  it('looks up okurigana entry かk', () => {
    expect(provider.lookup('かk', 'く')).toEqual(['書'])
  })

  it('returns empty array for unknown midashi', () => {
    expect(provider.lookup('xxxxxx', '')).toEqual([])
  })

  it('isReady returns true', () => {
    expect(provider.isReady()).toBe(true)
  })
})

describe('MockDictionaryProvider', () => {
  const provider = new MockDictionaryProvider({
    かんじ: ['漢字', '感じ'],
    かk: ['書'],
  })

  it('returns mock candidates', () => {
    expect(provider.lookup('かんじ', '')).toEqual(['漢字', '感じ'])
  })

  it('returns okurigana candidates', () => {
    expect(provider.lookup('かk', 'く')).toEqual(['書'])
  })

  it('returns empty for unknown', () => {
    expect(provider.lookup('missing', '')).toEqual([])
  })
})

describe('PersonalDictionaryProvider', () => {
  let localStorageMock: ReturnType<typeof makeLocalStorageMock>

  beforeEach(() => {
    localStorageMock = makeLocalStorageMock()
    vi.stubGlobal('localStorage', localStorageMock)
  })

  it('returns empty for unknown midashi on fresh instance', () => {
    const p = new PersonalDictionaryProvider()
    expect(p.lookup('かんじ', '')).toEqual([])
  })

  it('register adds new word', () => {
    const p = new PersonalDictionaryProvider()
    p.register('かんじ', '感字')
    expect(p.lookup('かんじ', '')).toEqual(['感字'])
  })

  it('register prepends new word to existing', () => {
    const p = new PersonalDictionaryProvider()
    p.register('かんじ', '感字')
    p.register('かんじ', '幹字')
    expect(p.lookup('かんじ', '')).toEqual(['幹字', '感字'])
  })

  it('register removes duplicate and moves to front', () => {
    const p = new PersonalDictionaryProvider()
    p.register('かんじ', '漢字')
    p.register('かんじ', '感字')
    p.register('かんじ', '漢字')
    expect(p.lookup('かんじ', '')).toEqual(['漢字', '感字'])
  })

  it('isReady returns true', () => {
    const p = new PersonalDictionaryProvider()
    expect(p.isReady()).toBe(true)
  })

  it('persists to and loads from localStorage', () => {
    const p1 = new PersonalDictionaryProvider()
    p1.register('かんじ', '感字')
    const p2 = new PersonalDictionaryProvider()
    expect(p2.lookup('かんじ', '')).toEqual(['感字'])
  })
})

describe('CompoundDictionaryProvider', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', makeLocalStorageMock())
  })

  it('returns base candidates when personal is empty', () => {
    const personal = new PersonalDictionaryProvider()
    const base = new MockDictionaryProvider({ かんじ: ['漢字', '感じ'] })
    const compound = new CompoundDictionaryProvider(personal, base)
    expect(compound.lookup('かんじ', '')).toEqual(['漢字', '感じ'])
  })

  it('personal candidates appear before base candidates', () => {
    const personal = new PersonalDictionaryProvider()
    personal.register('かんじ', '感字')
    const base = new MockDictionaryProvider({ かんじ: ['漢字', '感じ'] })
    const compound = new CompoundDictionaryProvider(personal, base)
    expect(compound.lookup('かんじ', '')).toEqual(['感字', '漢字', '感じ'])
  })

  it('duplicates are removed (personal takes priority)', () => {
    const personal = new PersonalDictionaryProvider()
    personal.register('かんじ', '漢字')
    const base = new MockDictionaryProvider({ かんじ: ['漢字', '感じ'] })
    const compound = new CompoundDictionaryProvider(personal, base)
    expect(compound.lookup('かんじ', '')).toEqual(['漢字', '感じ'])
  })

  it('returns only personal when base has no match', () => {
    const personal = new PersonalDictionaryProvider()
    personal.register('ほげ', 'ホゲ')
    const base = new MockDictionaryProvider({})
    const compound = new CompoundDictionaryProvider(personal, base)
    expect(compound.lookup('ほげ', '')).toEqual(['ホゲ'])
  })

  it('isReady reflects base provider', () => {
    const personal = new PersonalDictionaryProvider()
    const base = new MockDictionaryProvider({})
    const compound = new CompoundDictionaryProvider(personal, base)
    expect(compound.isReady()).toBe(true)
  })
})
