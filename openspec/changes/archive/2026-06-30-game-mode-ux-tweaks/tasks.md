## 1. タイマー表示の修正

- [x] 1.1 `src/components/game/GameQuestion.tsx` の `formatTime` 関数を 0.1秒単位表示に変更する

## 2. 不正解時フォームリセットの修正

- [x] 2.1 `src/components/game/TypingGame.tsx` の `handleEnterPress` で `submitAnswer` の返り値を受け取り、`outcome === 'correct'` のときだけ `resetSkkEngine()` を呼ぶように変更する
