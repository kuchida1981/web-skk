## 1. 型定義・問題文データ

- [ ] 1.1 `src/data/questions.ts` を作成し `Question` 型・`SkkFeature` 型を定義する
- [ ] 1.2 easy 問題を10問以上追加する (hiragana-only / katakana)
- [ ] 1.3 normal 問題を10問以上追加する (conversion、送り仮名なし)
- [ ] 1.4 hard 問題を10問以上追加する (okurigana、送り仮名あり)
- [ ] 1.5 ファイル先頭に開発者向け追加ガイド (タグの説明・文字数目安・サンプル) をコメントとして記載する

## 2. useSkkEngine の拡張

- [ ] 2.1 `useSkkEngine` フックに `reset()` 関数を追加する (mode を保持したまま INITIAL_STATE に戻す)

## 3. ゲームロジックフック

- [ ] 3.1 `src/hooks/useTypingGame.ts` を作成し `GamePhase` 型・`GameState` 型を定義する
- [ ] 3.2 `startGame(difficulty)` を実装する (問題ランダム選択・タイマー開始)
- [ ] 3.3 `submitAnswer(committed, skkState)` を実装する (Enter 提出・正誤判定・不一致インデックス生成)
- [ ] 3.4 `resetCurrentQuestion()` を実装する (不一致時の committed リセット)
- [ ] 3.5 `quitGame()` を実装する (途中終了・成績保存なし)

## 4. 成績管理フック

- [ ] 4.1 `src/hooks/useGameScore.ts` を作成する
- [ ] 4.2 `saveRecord(record: GameRecord)` を実装する (localStorage 書き込み・50件上限)
- [ ] 4.3 `loadRecords()` を実装する (localStorage 読み込み・JSON パース)

## 5. ゲームUIコンポーネント

- [ ] 5.1 `src/components/game/GameStart.tsx` を作成する (難易度選択・開始ボタン)
- [ ] 5.2 `src/components/game/GameQuestion.tsx` を作成する (問題文表示・不一致ハイライト・進捗・タイマー・途中終了ボタン)
- [ ] 5.3 `src/components/game/GameResult.tsx` を作成する (合計タイム・過去成績一覧・「もう一度」・「フリー入力へ」ボタン)
- [ ] 5.4 `src/components/game/TypingGame.tsx` を作成する (phase に応じて上記3コンポーネントを切り替える親コンポーネント)
- [ ] 5.5 `TypingGame` 内に Enter キーインターセプト処理を実装する (capture:true、phase チェック・警告メッセージ)

## 6. アプリモード切替

- [ ] 6.1 `src/App.tsx` にアプリモード状態 (`'free' | 'game'`) を追加する
- [ ] 6.2 ヘッダーにモード切替タブ (フリー入力 / ゲーム) を追加する
- [ ] 6.3 ゲーム進行中 (phase=playing) はモード切替タブを無効化する
- [ ] 6.4 モード切替時に SKK エンジンの状態をリセットする

## 7. スタイリング

- [ ] 7.1 モード切替タブのスタイルを追加する
- [ ] 7.2 `GameStart` のスタイル (難易度ボタン等) を追加する
- [ ] 7.3 `GameQuestion` のスタイル (問題文・ハイライト・進捗バー・タイマー) を追加する
- [ ] 7.4 `GameResult` のスタイル (タイム表示・成績テーブル) を追加する

## 8. テスト・検証

- [ ] 8.1 `useTypingGame` の判定ロジックのユニットテストを書く (正解・不一致・エッジケース)
- [ ] 8.2 `useGameScore` の localStorage 読み書きのユニットテストを書く
- [ ] 8.3 easy / normal / hard 各難易度で10問プレイし、ゲームフロー全体を手動確認する
- [ ] 8.4 途中終了後に成績が保存されていないことを確認する
