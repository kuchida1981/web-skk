## Why

変換モード（▼）で `Space` / `Tab` で次の候補へ進めるが、前の候補に戻る手段がなかった。本家 SKK では `x` キーで前候補へ戻れるため、同等の操作性を提供する。

## What Changes

- 変換モードで `x` キーを押すと `candidateIndex` を 1 つ減らし、前の候補を表示する
- 変換モードで `Shift+Tab` を押しても同じく前の候補へ戻る
- 先頭候補（index 0）のときは何もしない（no-op）
- 対応するユニットテストを追加する

## Capabilities

### New Capabilities

なし（既存の `skk-engine` ケイパビリティの挙動拡張）

### Modified Capabilities

- `skk-engine`: 変換モードのキーバインドに「前の候補へ戻る」操作を追加

## Impact

- `src/skk/engine.ts` の `processConversion` 関数に条件分岐を追加
- `src/skk/engine.test.ts` にテストケースを追加
- UI・辞書・フック層への変更なし
