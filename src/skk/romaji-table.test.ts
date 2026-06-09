import { describe, it, expect } from 'vitest'
import { convertRomaji, toZenkaku, toKatakana } from './romaji-table'

describe('convertRomaji', () => {
  it('converts basic vowel', () => {
    expect(convertRomaji('a')).toEqual({ type: 'converted', kana: 'あ', remaining: '' })
  })

  it('converts ka', () => {
    expect(convertRomaji('ka')).toEqual({ type: 'converted', kana: 'か', remaining: '' })
  })

  it('converts shi', () => {
    expect(convertRomaji('shi')).toEqual({ type: 'converted', kana: 'し', remaining: '' })
  })

  it('converts tsu', () => {
    expect(convertRomaji('tsu')).toEqual({ type: 'converted', kana: 'つ', remaining: '' })
  })

  it('returns pending for single k', () => {
    expect(convertRomaji('k')).toEqual({ type: 'pending' })
  })

  it('returns pending for sh (could be shi/sha/etc)', () => {
    expect(convertRomaji('sh')).toEqual({ type: 'pending' })
  })

  it('converts nn to ん', () => {
    expect(convertRomaji('nn')).toEqual({ type: 'converted', kana: 'ん', remaining: '' })
  })

  it('converts n before consonant to ん', () => {
    const result = convertRomaji('nk')
    expect(result).toEqual({ type: 'converted', kana: 'ん', remaining: 'k' })
  })

  it('leaves n pending when next char starts a valid sequence (e.g. ny)', () => {
    expect(convertRomaji('ny')).toEqual({ type: 'pending' })
  })

  it('converts nyu to にゅ', () => {
    expect(convertRomaji('nyu')).toEqual({ type: 'converted', kana: 'にゅ', remaining: '' })
  })

  it('converts nya to にゃ', () => {
    expect(convertRomaji('nya')).toEqual({ type: 'converted', kana: 'にゃ', remaining: '' })
  })

  it('converts nyo to にょ', () => {
    expect(convertRomaji('nyo')).toEqual({ type: 'converted', kana: 'にょ', remaining: '' })
  })

  it('keeps converting nk to ん + k (regression test)', () => {
    expect(convertRomaji('nk')).toEqual({ type: 'converted', kana: 'ん', remaining: 'k' })
  })

  it('leaves n pending before vowel', () => {
    expect(convertRomaji('na')).toEqual({ type: 'converted', kana: 'な', remaining: '' })
  })

  it('converts doubled consonant to sokuon (っ)', () => {
    const result = convertRomaji('kk')
    expect(result).toEqual({ type: 'converted', kana: 'っ', remaining: 'k' })
  })

  it('converts tt to っ + remaining t', () => {
    const result = convertRomaji('tt')
    expect(result).toEqual({ type: 'converted', kana: 'っ', remaining: 't' })
  })

  it('returns invalid for unknown sequence', () => {
    const result = convertRomaji('xq')
    expect(result.type).toBe('invalid')
  })

  it('converts kana with remaining', () => {
    const result = convertRomaji('kaka')
    expect(result).toEqual({ type: 'converted', kana: 'か', remaining: 'ka' })
  })
})

describe('toZenkaku', () => {
  it('converts a to ａ', () => {
    expect(toZenkaku('a')).toBe('ａ')
  })

  it('converts space to ideographic space', () => {
    expect(toZenkaku(' ')).toBe('　')
  })

  it('converts ! to ！', () => {
    expect(toZenkaku('!')).toBe('！')
  })
})

describe('toKatakana', () => {
  it('converts hiragana か to カ', () => {
    expect(toKatakana('か')).toBe('カ')
  })

  it('converts hiragana string', () => {
    expect(toKatakana('かんじ')).toBe('カンジ')
  })

  it('leaves non-hiragana unchanged', () => {
    expect(toKatakana('A')).toBe('A')
  })
})
