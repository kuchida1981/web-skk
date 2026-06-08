/*
 * ─────────────────────────────────────────────────────────────────────────────
 * 問題バンク  /  Developer Guide
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * 新しい問題を追加するには QUESTIONS 配列に Question オブジェクトを追加してください。
 *
 * ■ SkkFeature タグの使い方
 *   'hiragana-only' ... ひらがなのみ (変換不要、Ctrl+J でひらがなモードに入り入力)
 *   'katakana'      ... カタカナ文字列 (q でカタカナモードに切り替えて入力)
 *   'conversion'    ... 漢字変換あり・送り仮名なしが主体
 *                       例: 東京 (Toukyou → ▽とうきょう → 東京)
 *   'okurigana'     ... 送り仮名あり変換
 *                       例: 書く (Ka → ▽かK → 書く)
 *                       例: 助かる (Tasuk → ▽たすk → 助かる)
 *
 * ■ 難易度別・文字数の目安
 *   easy    5〜10文字   hiragana-only または katakana のみ
 *   normal 10〜18文字  conversion が主体、送り仮名なし漢字混じり
 *   hard   15〜25文字  okurigana を含む動詞・形容詞の変換あり
 *
 * ■ 各難易度のプールは最低 10 問以上必要です。
 *
 * ■ サンプル追加例
 *   {
 *     id: 'e-h-013',
 *     text: 'ほしのひかり',
 *     difficulty: 'easy',
 *     skkFeatures: ['hiragana-only'],
 *   },
 *   {
 *     id: 'h-013',
 *     text: '毎日少しずつ練習することが大切です',
 *     difficulty: 'hard',
 *     skkFeatures: ['conversion', 'okurigana'],
 *   },
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type SkkFeature = 'hiragana-only' | 'katakana' | 'conversion' | 'okurigana'
export type Difficulty = 'easy' | 'normal' | 'hard'

export interface Question {
  id: string
  text: string
  difficulty: Difficulty
  skkFeatures: SkkFeature[]
}

export const QUESTIONS: Question[] = [
  // ── easy: hiragana-only ──────────────────────────────────────────────────
  { id: 'e-h-001', text: 'なつのかぜ',     difficulty: 'easy', skkFeatures: ['hiragana-only'] },
  { id: 'e-h-002', text: 'はるのはな',     difficulty: 'easy', skkFeatures: ['hiragana-only'] },
  { id: 'e-h-003', text: 'ふゆのよる',     difficulty: 'easy', skkFeatures: ['hiragana-only'] },
  { id: 'e-h-004', text: 'あきのそら',     difficulty: 'easy', skkFeatures: ['hiragana-only'] },
  { id: 'e-h-005', text: 'かわいいねこ',   difficulty: 'easy', skkFeatures: ['hiragana-only'] },
  { id: 'e-h-006', text: 'ひるのひかり',   difficulty: 'easy', skkFeatures: ['hiragana-only'] },
  { id: 'e-h-007', text: 'あさのにおい',   difficulty: 'easy', skkFeatures: ['hiragana-only'] },
  { id: 'e-h-008', text: 'こどものこえ',   difficulty: 'easy', skkFeatures: ['hiragana-only'] },
  { id: 'e-h-009', text: 'ゆうやけぞら',   difficulty: 'easy', skkFeatures: ['hiragana-only'] },
  { id: 'e-h-010', text: 'おいしいりんご', difficulty: 'easy', skkFeatures: ['hiragana-only'] },
  { id: 'e-h-011', text: 'やまのむこう',   difficulty: 'easy', skkFeatures: ['hiragana-only'] },
  { id: 'e-h-012', text: 'きれいなそら',   difficulty: 'easy', skkFeatures: ['hiragana-only'] },
  // ── easy: katakana ──────────────────────────────────────────────────────
  { id: 'e-k-001', text: 'アイスクリーム', difficulty: 'easy', skkFeatures: ['katakana'] },
  { id: 'e-k-002', text: 'スマートフォン', difficulty: 'easy', skkFeatures: ['katakana'] },
  { id: 'e-k-003', text: 'インターネット', difficulty: 'easy', skkFeatures: ['katakana'] },
  { id: 'e-k-004', text: 'チョコレート',   difficulty: 'easy', skkFeatures: ['katakana'] },
  { id: 'e-k-005', text: 'コンピューター', difficulty: 'easy', skkFeatures: ['katakana'] },
  { id: 'e-k-006', text: 'エレベーター',   difficulty: 'easy', skkFeatures: ['katakana'] },
  { id: 'e-k-007', text: 'アニメーション', difficulty: 'easy', skkFeatures: ['katakana'] },
  { id: 'e-k-008', text: 'ミュージック',   difficulty: 'easy', skkFeatures: ['katakana'] },
  { id: 'e-k-009', text: 'レストラン',     difficulty: 'easy', skkFeatures: ['katakana'] },
  { id: 'e-k-010', text: 'テレビゲーム',   difficulty: 'easy', skkFeatures: ['katakana'] },
  { id: 'e-k-011', text: 'コーヒーカップ', difficulty: 'easy', skkFeatures: ['katakana'] },
  { id: 'e-k-012', text: 'アイスコーヒー', difficulty: 'easy', skkFeatures: ['katakana'] },
  // ── normal ──────────────────────────────────────────────────────────────
  { id: 'n-001', text: '今日の天気は晴れです',         difficulty: 'normal', skkFeatures: ['conversion'] },
  { id: 'n-002', text: '東京は日本の首都です',         difficulty: 'normal', skkFeatures: ['conversion'] },
  { id: 'n-003', text: '毎日学校で勉強します',         difficulty: 'normal', skkFeatures: ['conversion'] },
  { id: 'n-004', text: '春になると桜が咲きます',       difficulty: 'normal', skkFeatures: ['conversion'] },
  { id: 'n-005', text: '日本語の勉強は楽しいです',     difficulty: 'normal', skkFeatures: ['conversion'] },
  { id: 'n-006', text: '今年の夏はとても暑かった',     difficulty: 'normal', skkFeatures: ['conversion'] },
  { id: 'n-007', text: 'コンビニで買い物をします',     difficulty: 'normal', skkFeatures: ['conversion'] },
  { id: 'n-008', text: '昨日は友達と映画を見ました',   difficulty: 'normal', skkFeatures: ['conversion'] },
  { id: 'n-009', text: '図書館には本が沢山あります',   difficulty: 'normal', skkFeatures: ['conversion'] },
  { id: 'n-010', text: '毎朝コーヒーを飲みます',       difficulty: 'normal', skkFeatures: ['conversion'] },
  { id: 'n-011', text: '東京駅は毎日とても混んでいる', difficulty: 'normal', skkFeatures: ['conversion'] },
  { id: 'n-012', text: '週末は家族と公園に行きます',   difficulty: 'normal', skkFeatures: ['conversion'] },
  // ── hard ────────────────────────────────────────────────────────────────
  { id: 'h-001', text: '毎朝早く起きて朝ごはんを食べます',           difficulty: 'hard', skkFeatures: ['conversion', 'okurigana'] },
  { id: 'h-002', text: '友達と一緒に映画を見に行きました',           difficulty: 'hard', skkFeatures: ['conversion', 'okurigana'] },
  { id: 'h-003', text: '図書館で借りた本を読み終わりました',         difficulty: 'hard', skkFeatures: ['conversion', 'okurigana'] },
  { id: 'h-004', text: '電車が遅れて学校に遅刻してしまいました',     difficulty: 'hard', skkFeatures: ['conversion', 'okurigana'] },
  { id: 'h-005', text: '夏休みに家族と海に行って泳ぎました',         difficulty: 'hard', skkFeatures: ['conversion', 'okurigana'] },
  { id: 'h-006', text: '毎日運動することが健康に良いと思います',     difficulty: 'hard', skkFeatures: ['conversion', 'okurigana'] },
  { id: 'h-007', text: '先生に教えてもらった方法で問題を解きました', difficulty: 'hard', skkFeatures: ['conversion', 'okurigana'] },
  { id: 'h-008', text: '春になると公園の桜がきれいに咲きます',       difficulty: 'hard', skkFeatures: ['conversion', 'okurigana'] },
  { id: 'h-009', text: '今日は疲れたので早めに寝ることにしました',   difficulty: 'hard', skkFeatures: ['conversion', 'okurigana'] },
  { id: 'h-010', text: '週末に友達と公園を散歩しながら話しました',   difficulty: 'hard', skkFeatures: ['conversion', 'okurigana'] },
  { id: 'h-011', text: 'お腹が空いたので近くのレストランで食事をした', difficulty: 'hard', skkFeatures: ['conversion', 'okurigana'] },
  { id: 'h-012', text: '日本語を上手に話せるように毎日練習しています', difficulty: 'hard', skkFeatures: ['conversion', 'okurigana'] },
]

export function getQuestionsByDifficulty(difficulty: Difficulty): Question[] {
  return QUESTIONS.filter((q) => q.difficulty === difficulty)
}

export function pickRandom(questions: Question[], count: number): Question[] {
  const shuffled = [...questions].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}
