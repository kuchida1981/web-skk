## Why

現在のSKK体験アプリはフリー入力のみで、SKK操作を体系的に練習する手段がない。タイピングゲームを追加することで、ひらがな入力からカタカナ変換、送り仮名あり変換まで段階的に習熟できる実践的なトレーニング環境を提供する。

## What Changes

- アプリに「フリー入力」と「ゲーム」の2モードを追加し、ヘッダーでスイッチ可能にする
- 難易度 easy / normal / hard を選択してゲームを開始できる
- 10問出題し、Enter キーで提出・正誤判定を行う
- 不一致時は不一致箇所をハイライトし、全消しして再入力を求める
- 10問完了後に合計タイムを表示し、localStorage に成績を保存する
- 途中終了が可能 (成績は記録しない)
- 問題文はコード内 TypeScript 配列で管理し、開発者向け追加ガイドを用意する

## Capabilities

### New Capabilities

- `app-mode-switch`: フリー入力とゲームモードを切り替えるUI
- `typing-game`: タイピングゲームのゲームループ・判定・進行管理
- `question-bank`: 難易度タグ付き問題文データとその管理
- `game-score`: 成績の localStorage 保存と履歴表示

### Modified Capabilities

なし

## Impact

- `src/App.tsx`: モード切替状態の追加
- `src/components/`: TypingGame, GameStart, GameResult 等の新規コンポーネント
- `src/skk/engine.ts`: Enter キーの動作をゲームモードで上書きする必要あり (エンジン自体は変更不要、呼び出し側でハンドリング)
- 新規ファイル: `src/data/questions.ts`, `src/hooks/useTypingGame.ts`, `src/hooks/useGameScore.ts`
- 外部依存の追加なし (localStorage のみ使用)
