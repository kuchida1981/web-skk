## Context

現在のアプリは `useSkkEngine` フックが SKK エンジンを管理し、`SkkInputArea` がキー入力を受け取って `committed` を積み上げる単一モデル。Enter キーはエンジン内で `\n` をコミットする。

タイピングゲームでは Enter を「提出」として扱い、`committed` を問題文と比較して正誤判定する。既存の SKK エンジン自体は変更しない。

## Goals / Non-Goals

**Goals:**
- 既存のフリー入力機能を壊さずにゲームモードを追加する
- SKK エンジンを変更せずに Enter キーの動作をゲームモードで上書きする
- 問題文データをコード内で管理し、開発者が容易に追加できる構造を用意する
- 成績を localStorage に保存し、結果画面で過去履歴を表示する

**Non-Goals:**
- サーバーサイドの成績管理・ランキング機能
- 問題文の自動生成・外部ファイル読み込み
- ゲーム中の入力精度 (ミスタイプ数) の計測

## Decisions

### Enter キーのゲームモード上書き

**決定**: ゲームモード専用の `TypingGame` コンポーネント内で Enter キーをインターセプトし、エンジンの `handleKeyDown` には渡さない。

**理由**: `engine.ts` を変更するとフリー入力モードへの影響リスクがある。エンジンに「ゲームモードフラグ」を持たせるよりも、呼び出し側でハンドリングする方が責務が明確。

**代替案**: engine.ts に `gameMode` フラグを追加 → エンジンの責務が増えるため却下。

### committed のリセット方法

**決定**: `useSkkEngine` フックに `reset()` 関数を追加し、呼び出すと `INITIAL_STATE` (ただし `mode` は現在値を引き継ぐ) に戻す。

**理由**: 問題正解 / 全消し時に前の入力状態をすべてクリアする必要がある。mode まで消すと変換モードが突然変わり UX が悪い。

### 問題文データの構造

**決定**: `src/data/questions.ts` に TypeScript 配列として静的定義。ビルド時にバンドルされる。

```ts
type SkkFeature = 'hiragana-only' | 'katakana' | 'conversion' | 'okurigana'

interface Question {
  id: string
  text: string
  difficulty: 'easy' | 'normal' | 'hard'
  skkFeatures: SkkFeature[]
}
```

**理由**: 外部ファイル (JSON) にすると fetch やバンドル設定が必要。静的 TypeScript 配列なら型安全で追加も容易。

**代替案**: `public/questions.json` を fetch → 非同期ロードが必要になり複雑化するため却下。

### ゲーム状態管理

**決定**: `useTypingGame` カスタムフックに全ゲーム状態を集約。コンポーネントはフックが返す値とコールバックのみを使う。

```ts
type GamePhase = 'idle' | 'playing' | 'result'

interface GameState {
  phase: GamePhase
  difficulty: Difficulty | null
  questions: Question[]
  currentIndex: number
  startTime: number | null
  mismatchPositions: number[] | null  // 不一致のインデックス、null = 判定前
}
```

### 判定ロジック

**決定**: `committed` が問題文に**完全一致**したとき正解。文字列を Unicode コードポイント単位 (`[...str]`) で比較し、絵文字・結合文字の誤判定を防ぐ。

**不一致ハイライト**: `[...committed]` と `[...target]` を zip して異なる位置のインデックス配列を生成し、CSS クラスで赤ハイライトを付ける。

### 成績の localStorage スキーマ

```ts
interface GameRecord {
  date: string        // ISO 8601
  difficulty: 'easy' | 'normal' | 'hard'
  timeMs: number      // ミリ秒
  questions: 10
}

// キー: "skk-game-records"
// 値: JSON.stringify(GameRecord[])  最大 50 件保持 (古いものを削除)
```

## Risks / Trade-offs

- **Enter の二重処理リスク** → `TypingGame` 内の keydown ハンドラで `e.preventDefault()` + `e.stopPropagation()` を確実に呼ぶ。`capture: true` オプション (現在の `SkkInputArea` と同様) で先にインターセプト。
- **committed のリセットタイミング** → 全消し後も SKK エンジンは同じインスタンスを使い続ける。`reset()` 後にフォーカスを再設定する必要がある。
- **phase=conversion 中の Enter** → 「変換を確定してください」とステータスバーに表示し Enter を飲み込む。エンジンには渡さない。
- **localStorage の容量** → 1 件あたり ~100 バイト、50 件で ~5KB。制限に達することは実用上ない。
