## Why

ゲームモードの経過時間表示が実際の更新精度（0.1秒）と乖離した2桁小数表示になっており、冗長で読みづらい。また、不正解時に入力フォームがクリアされるため、何を間違えたかがわからず修正しにくい。

## What Changes

- 経過時間の表示を `1.23 秒` から `1.2 秒`（小数点以下第1位）に変更する
- submit して不正解だったとき、フォームの入力文字列をクリアしないようにする（ユーザーが修正して再送信できるようにする）

## Capabilities

### New Capabilities

なし

### Modified Capabilities

- `typing-game`: タイマー表示精度とフォームリセット挙動の要件変更

## Impact

- `src/components/game/GameQuestion.tsx`：`formatTime` 関数の変更
- `src/components/game/TypingGame.tsx`：`handleEnterPress` の `resetSkkEngine()` 呼び出しを正解時のみに変更
