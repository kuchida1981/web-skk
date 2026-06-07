## Why

SKK の重要な特徴のひとつである辞書登録が未実装であり、候補が存在しない語を変換しようとすると読みがそのままコミットされてしまう。辞書登録なしでは実用的な SKK 体験として不完全であり、よく使う専門用語や固有名詞を扱えない。

## What Changes

- 候補が尽きたとき（または候補ゼロのとき）に辞書登録モードへ入る
- 辞書登録モード中に内側で SKK 変換を使える再帰登録をサポートする
- 登録した語をブラウザの localStorage に個人辞書として永続化する
- 個人辞書を共通辞書より優先して検索する（`CompoundDictionaryProvider`）
- `getPreEdit` が `[登録: みだし]` プレフィックスを再帰的にレンダリングする

## Capabilities

### New Capabilities

- `word-registration`: 辞書登録モードの状態管理・キー処理・表示・完了シグナル（`ProcessKeyResult.registrationResult`）
- `personal-dictionary`: localStorage を使った個人辞書の読み書きと `CompoundDictionaryProvider` による優先検索

### Modified Capabilities

- `skk-engine`: `SkkState` への `wordRegistration` フィールド追加、`ProcessKeyResult` への `registrationResult` フィールド追加、`getPreEdit` の再帰レンダリング対応
- `skk-dictionary`: `DictionaryProvider` インターフェース拡張（個人辞書への登録メソッド追加）

## Impact

- `src/skk/types.ts`: `SkkState`、`ProcessKeyResult` の型変更
- `src/skk/engine.ts`: `processKey`、`injectCandidates`、`getPreEdit` のロジック変更
- `src/skk/dictionary.ts`: `PersonalDictionaryProvider`、`CompoundDictionaryProvider` の追加
- `src/hooks/useSkkEngine.ts`: `registrationResult` の副作用処理（localStorage 保存と provider 更新）
- 既存のエンジンテストへの影響あり（新しい挙動をカバーするテスト追加が必要）
