// Standard romaji-to-hiragana conversion table
export const ROMAJI_TABLE: Record<string, string> = {
  // vowels
  a: 'あ', i: 'い', u: 'う', e: 'え', o: 'お',
  // ka row
  ka: 'か', ki: 'き', ku: 'く', ke: 'け', ko: 'こ',
  // sa row
  sa: 'さ', si: 'し', shi: 'し', su: 'す', se: 'せ', so: 'そ',
  // ta row
  ta: 'た', ti: 'ち', tu: 'つ', tsu: 'つ', te: 'て', to: 'と',
  // na row
  na: 'な', ni: 'に', nu: 'ぬ', ne: 'ね', no: 'の',
  // ha row
  ha: 'は', hi: 'ひ', hu: 'ふ', he: 'へ', ho: 'ほ',
  // ma row
  ma: 'ま', mi: 'み', mu: 'む', me: 'め', mo: 'も',
  // ya row
  ya: 'や', yu: 'ゆ', yo: 'よ',
  // ra row
  ra: 'ら', ri: 'り', ru: 'る', re: 'れ', ro: 'ろ',
  // wa row
  wa: 'わ', wo: 'を',
  // n
  nn: 'ん', "n'": 'ん',
  // ga row
  ga: 'が', gi: 'ぎ', gu: 'ぐ', ge: 'げ', go: 'ご',
  // za row
  za: 'ざ', zi: 'じ', ji: 'じ', zu: 'ず', ze: 'ぜ', zo: 'ぞ',
  // da row
  da: 'だ', di: 'ぢ', du: 'づ', de: 'で', do: 'ど',
  // ba row
  ba: 'ば', bi: 'び', bu: 'ぶ', be: 'べ', bo: 'ぼ',
  // pa row
  pa: 'ぱ', pi: 'ぴ', pu: 'ぷ', pe: 'ぺ', po: 'ぽ',
  // combined kya row
  kya: 'きゃ', kyi: 'きぃ', kyu: 'きゅ', kye: 'きぇ', kyo: 'きょ',
  // combined sha row
  sha: 'しゃ', shu: 'しゅ', she: 'しぇ', sho: 'しょ',
  sya: 'しゃ', syi: 'しぃ', syu: 'しゅ', sye: 'しぇ', syo: 'しょ',
  // combined cha row
  chi: 'ち', cha: 'ちゃ', chu: 'ちゅ', che: 'ちぇ', cho: 'ちょ',
  tya: 'ちゃ', tyi: 'ちぃ', tyu: 'ちゅ', tye: 'ちぇ', tyo: 'ちょ',
  // combined nya row
  nya: 'にゃ', nyi: 'にぃ', nyu: 'にゅ', nye: 'にぇ', nyo: 'にょ',
  // combined hya row
  hya: 'ひゃ', hyi: 'ひぃ', hyu: 'ひゅ', hye: 'ひぇ', hyo: 'ひょ',
  // combined mya row
  mya: 'みゃ', myi: 'みぃ', myu: 'みゅ', mye: 'みぇ', myo: 'みょ',
  // combined rya row
  rya: 'りゃ', ryi: 'りぃ', ryu: 'りゅ', rye: 'りぇ', ryo: 'りょ',
  // combined gya row
  gya: 'ぎゃ', gyi: 'ぎぃ', gyu: 'ぎゅ', gye: 'ぎぇ', gyo: 'ぎょ',
  // combined ja row
  ja: 'じゃ', ju: 'じゅ', je: 'じぇ', jo: 'じょ',
  jya: 'じゃ', jyi: 'じぃ', jyu: 'じゅ', jye: 'じぇ', jyo: 'じょ',
  zya: 'じゃ', zyi: 'じぃ', zyu: 'じゅ', zye: 'じぇ', zyo: 'じょ',
  // combined bya row
  bya: 'びゃ', byi: 'びぃ', byu: 'びゅ', bye: 'びぇ', byo: 'びょ',
  // combined pya row
  pya: 'ぴゃ', pyi: 'ぴぃ', pyu: 'ぴゅ', pye: 'ぴぇ', pyo: 'ぴょ',
  // small kana via x prefix
  xa: 'ぁ', xi: 'ぃ', xu: 'ぅ', xe: 'ぇ', xo: 'ぉ',
  xya: 'ゃ', xyu: 'ゅ', xyo: 'ょ',
  xtu: 'っ', xtsu: 'っ', xwa: 'ゎ',
  // fa/fi/fe/fo
  fa: 'ふぁ', fi: 'ふぃ', fu: 'ふ', fe: 'ふぇ', fo: 'ふぉ',
  // va/vi/vu/ve/vo
  va: 'ヴぁ', vi: 'ヴぃ', vu: 'ヴ', ve: 'ヴぇ', vo: 'ヴぉ',
  // wi/we (modern reading)
  wi: 'うぃ', we: 'うぇ',
  // di/du
  dya: 'ぢゃ', dyu: 'ぢゅ', dyo: 'ぢょ',
  // special
  'n': 'ん', // handled separately when followed by non-vowel/non-n
}

// Characters that can follow 'n' without being 'n' itself or a vowel
const VOWELS = new Set(['a', 'i', 'u', 'e', 'o'])
const CONSONANTS = 'bcdfghjklmnpqrstvwxyz'

// Returns true if this consonant starts a valid romaji sequence
export function isConsonant(ch: string): boolean {
  return CONSONANTS.includes(ch)
}

export function isVowel(ch: string): boolean {
  return VOWELS.has(ch)
}

export type RomajiConvertResult =
  | { type: 'converted'; kana: string; remaining: string }
  | { type: 'pending' }
  | { type: 'invalid'; remaining: string }

// Try to convert romaji buffer to kana using longest-match.
// Returns the kana character(s) and the remaining unconsumed romaji.
export function convertRomaji(buffer: string): RomajiConvertResult {
  if (buffer.length === 0) return { type: 'pending' }

  // Handle 'n' before non-vowel, non-n consonant → ん
  if (buffer.length >= 2 && buffer[0] === 'n' && !isVowel(buffer[1]) && buffer[1] !== 'n') {
    return { type: 'converted', kana: 'ん', remaining: buffer.slice(1) }
  }

  // Handle sokuon (っ): doubled consonant (not 'n')
  if (
    buffer.length >= 2 &&
    buffer[0] !== 'n' &&
    isConsonant(buffer[0]) &&
    buffer[0] === buffer[1]
  ) {
    return { type: 'converted', kana: 'っ', remaining: buffer.slice(1) }
  }

  // Try longest match first (up to 4 chars)
  for (let len = Math.min(buffer.length, 4); len >= 1; len--) {
    const candidate = buffer.slice(0, len)
    if (ROMAJI_TABLE[candidate] !== undefined) {
      // Only return if there's no longer possible match
      if (len === buffer.length) {
        // Could still be extended - return pending unless it's unambiguous
        const couldExtend = Object.keys(ROMAJI_TABLE).some(
          (k) => k.length > len && k.startsWith(candidate)
        )
        if (couldExtend) return { type: 'pending' }
      }
      return { type: 'converted', kana: ROMAJI_TABLE[candidate], remaining: buffer.slice(len) }
    }
  }

  // No match found - check if there's still hope (prefix exists)
  const hasPrefix = Object.keys(ROMAJI_TABLE).some((k) => k.startsWith(buffer))
  if (hasPrefix) return { type: 'pending' }

  // Truly invalid - consume first char and retry
  return { type: 'invalid', remaining: buffer.slice(1) }
}

// Full-width ASCII conversion table
const ZENKAKU_TABLE: Record<string, string> = {}
for (let i = 0x21; i <= 0x7e; i++) {
  const ascii = String.fromCharCode(i)
  const zen = String.fromCharCode(i + 0xfee0)
  ZENKAKU_TABLE[ascii] = zen
}
ZENKAKU_TABLE[' '] = '　'

export function toZenkaku(ch: string): string {
  return ZENKAKU_TABLE[ch] ?? ch
}

// Convert hiragana to katakana
export function toKatakana(kana: string): string {
  return kana
    .split('')
    .map((ch) => {
      const code = ch.charCodeAt(0)
      if (code >= 0x3041 && code <= 0x3096) {
        return String.fromCharCode(code + 0x60)
      }
      return ch
    })
    .join('')
}
