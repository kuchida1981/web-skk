## Why

確定済みテキストの編集手段が Backspace による末尾からの消去のみであり、途中の誤りを修正するには正しい位置まで何度も Backspace を押し直す必要がある。カーソル移動と基本的なテキスト編集操作を追加することで、SKK 練習中の編集体験を改善する。

## What Changes

- `SkkState` に `cursorPos: number` フィールドを追加する（コードポイント単位のインデックス）
- `direct` フェーズで以下のキー操作を有効にする:
  - `ArrowLeft` / `ArrowRight`: 1文字前後移動
  - `Home` / `End`: 行頭・行末へ移動
  - `Ctrl+B` / `Ctrl+F`: 1文字前後移動（readline 風）
  - `Ctrl+A` / `Ctrl+E`: 行頭・行末へ移動（readline 風）
  - `Ctrl+D`: カーソル位置の文字を削除（前方削除）
  - `Ctrl+K`: カーソル位置から行末までを削除
  - `Ctrl+U`: 行頭からカーソル位置までを削除
  - `Ctrl+W`: カーソル直前の単語を削除
- `Backspace` / `Ctrl+H` はカーソル位置の直前の文字を削除する（現在は常に末尾）
- テキスト確定（`withCommit`）はカーソル位置に挿入し、カーソルを前進させる
- `SkkInputArea` の表示をカーソル位置で分割し、カーソルを正しい位置に描画する
- `pre-conversion`・`conversion` フェーズ中は上記キーをすべて無視する（既存 SKK バインドと競合しないため）

## Capabilities

### New Capabilities

- `skk-cursor-movement`: 確定済みテキスト内でのカーソル移動と readline 風テキスト編集操作

### Modified Capabilities

- `skk-engine`: `cursorPos` の導入により Backspace・テキスト確定の挙動が変わる（カーソル位置基準）
- `skk-input-ui`: カーソルをテキスト中途に描画する表示ロジックの変更

## Impact

- **変更ファイル**: `src/skk/types.ts`, `src/skk/engine.ts`, `src/components/SkkInputArea.tsx`
- **テスト**: `src/skk/engine.test.ts` に cursorPos 関連のテストケースを追加
- **既存 SKK バインド**: `Ctrl+G`（キャンセル）/ `Ctrl+H`（Backspace）/ `Ctrl+J`（確定）は変更なし
- **クリック位置指定**: スコープ外
