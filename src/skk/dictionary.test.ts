import { describe, it, expect } from 'vitest'
import { MockDictionaryProvider, MapDictionaryProvider } from './dictionary'

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
