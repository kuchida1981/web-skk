## 1. SkkState に cursorPos を追加する

- [ ] 1.1 `src/skk/types.ts`: `SkkState` に `cursorPos: number` フィールドを追加し、`INITIAL_STATE` の `cursorPos` を `0` に設定する

## 2. エンジンのコア関数を cursorPos 対応にする

- [ ] 2.1 `src/skk/engine.ts`: `withCommit` をカーソル位置への挿入に変更する（`committed[:cursorPos] + text + committed[cursorPos:]`、`cursorPos += [...text].length`）
- [ ] 2.2 `src/skk/engine.ts`: `deleteCommittedChar` をカーソル位置直前の削除に変更する（`cursorPos > 0` のときのみ削除し `cursorPos -= 1`）

## 3. direct フェーズにカーソル移動・削除操作を追加する

- [ ] 3.1 `src/skk/engine.ts`: `processDirect` に `ArrowLeft` / `Ctrl+B`（1文字後退）と `ArrowRight` / `Ctrl+F`（1文字前進）を追加する
- [ ] 3.2 `src/skk/engine.ts`: `processDirect` に `Home` / `Ctrl+A`（行頭）と `End` / `Ctrl+E`（行末）を追加する
- [ ] 3.3 `src/skk/engine.ts`: `processDirect` に `Ctrl+D`（前方削除: `committed[cursorPos]` を削除）を追加する
- [ ] 3.4 `src/skk/engine.ts`: `processDirect` に `Ctrl+K`（カーソル以降を削除: `committed = committed[:cursorPos]`）を追加する
- [ ] 3.5 `src/skk/engine.ts`: `processDirect` に `Ctrl+U`（カーソル以前を削除: `committed = committed[cursorPos:]`、`cursorPos = 0`）を追加する
- [ ] 3.6 `src/skk/engine.ts`: `processDirect` に `Ctrl+W`（直前の単語削除）を追加する。単語境界は「空白・句読点の連続」とし、`[...committed].slice(0, cursorPos)` を逆順に走査して削除範囲を決定する

## 4. SkkInputArea の表示をカーソル位置で分割する

- [ ] 4.1 `src/components/SkkInputArea.tsx`: `committed` を `[...skkState.committed].slice(0, cursorPos)` と `[...skkState.committed].slice(cursorPos)` に分割し、`before` + preEdit + カーソル + `after` の順で描画するよう変更する

## 5. テストを追加・修正する

- [ ] 5.1 `src/skk/engine.test.ts`: cursorPos の初期値・リセット後が末尾になっていることを確認するテストを追加する
- [ ] 5.2 `src/skk/engine.test.ts`: ArrowLeft / ArrowRight / Home / End によるカーソル移動のテストを追加する
- [ ] 5.3 `src/skk/engine.test.ts`: Ctrl+B/F/A/E によるカーソル移動のテストを追加する
- [ ] 5.4 `src/skk/engine.test.ts`: Ctrl+D / Ctrl+K / Ctrl+U / Ctrl+W によるテキスト削除のテストを追加する
- [ ] 5.5 `src/skk/engine.test.ts`: カーソルが途中にある状態での Backspace・テキスト確定のテストを追加する
- [ ] 5.6 `src/skk/engine.test.ts`: pre-conversion / conversion フェーズでカーソル移動キーが無視されることを確認するテストを追加する
- [ ] 5.7 `src/skk/engine.test.ts`: 既存テストが壊れている場合は `INITIAL_STATE` スプレッドを使うよう修正する
