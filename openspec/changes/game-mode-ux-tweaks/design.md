## Context

ゲームモードのタイマー表示と不正解時のフォームリセット挙動を修正する。
どちらも単一コンポーネントの小変更であり、アーキテクチャ上の新判断は不要。

## Goals / Non-Goals

**Goals:**
- タイマー表示を 0.1秒単位に統一する（setInterval の実際の精度と一致させる）
- 不正解時に入力内容を残し、ユーザーが修正して再送信できるようにする

**Non-Goals:**
- タイマーの更新頻度変更（setInterval 100ms はそのまま）
- 不正解時のハイライト表示の変更
- その他ゲームロジックへの変更

## Decisions

### タイマー表示を 0.1秒単位に変更する

`GameQuestion.tsx` の `formatTime` 関数で `Math.floor((ms % 1000) / 10)` を
`Math.floor((ms % 1000) / 100)` に変更する。

setInterval が 100ms なので実際に意味のある精度は 0.1秒。2桁表示は冗長だった。

### 不正解時は `resetSkkEngine()` を呼ばない

`TypingGame.tsx` の `handleEnterPress` で `submitAnswer` の返り値（`SubmitResult`）を受け取り、
`outcome === 'correct'` のときだけ `resetSkkEngine()` を呼ぶ。

不正解時に `committed` を残すことで：
- ユーザーが何を間違えたか視覚的に確認できる
- SKK のバックスペースで修正してから再送信できる

## Risks / Trade-offs

- [リスク] 不正解後に Enter を連打すると同じ答えが繰り返し submit される → `mismatchPositions` が更新されるだけで次の問題へは進まないため実害なし
