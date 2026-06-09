## Why

`convertRomaji` の `n` 早期変換ロジックが `y` を見た時点で即座に `ん` を確定してしまうため、`nyu/nya/nyi/nye/nyo`（にゅ・にゃ・にぃ・にぇ・にょ）が入力できない。ひらがな直接入力・変換モード（▽）いずれでも再現し、日本語入力として致命的な欠落となっている。

## What Changes

- `convertRomaji` の `n` ハンドラーに「`n` + 次文字がテーブル内エントリのプレフィックスになっている場合はスキップする」チェックを追加する
- `romaji-table.test.ts` に `ny` pending・`nyu/nya/nyo` 変換のテストケースを追加する
- `engine.test.ts` に `n,y,u` → `にゅ` および `N,y,u` → midashi `にゅ` の統合テストを追加する

## Capabilities

### New Capabilities

（なし）

### Modified Capabilities

- `skk-engine`: `ny*` シーケンス（にゃ・にぃ・にゅ・にぇ・にょ）のローマ字変換が正しく機能するよう要件を追記する

## Impact

- `src/skk/romaji-table.ts`：`convertRomaji` 関数の `n` ハンドラー（1行修正）
- `src/skk/romaji-table.test.ts`：テストケース追加
- `src/skk/engine.test.ts`：統合テストケース追加
- 実行時依存・API・外部インターフェースへの影響なし
