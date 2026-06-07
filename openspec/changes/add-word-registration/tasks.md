## 1. 型定義の更新 (types.ts)

- [x] 1.1 `SkkState` に `wordRegistration?: { midashi, midashiKey, okurigana, inputState }` フィールドを追加する
- [x] 1.2 `ProcessKeyResult` に `registrationResult?: { midashiKey, word }` フィールドを追加する

## 2. getPreEdit の再帰レンダリング対応 (types.ts)

- [x] 2.1 `getPreEdit` が `state.wordRegistration` を検査し `[登録: みだし]` + 再帰呼び出しを返すよう修正する

## 3. エンジンの辞書登録モード対応 (engine.ts)

- [x] 3.1 `enterWordRegistration(state)` ヘルパー関数を追加する（`wordRegistration` を設定した新 state を返す）
- [x] 3.2 `injectCandidates` が空配列を受け取ったとき `enterWordRegistration` を呼ぶよう変更する（現在のコミット動作を置き換える）
- [x] 3.3 `processConversion` の Space で `nextIndex >= candidates.length` のとき `enterWordRegistration` を呼ぶよう変更する
- [x] 3.4 `processKey` の先頭に `state.wordRegistration` の分岐を追加する
- [x] 3.5 登録モードの Enter/Ctrl+J ハンドラー実装：inner.committed が空でない場合に `registrationResult` を返す
- [x] 3.6 登録モードの Ctrl+G ハンドラー実装：`wordRegistration` をクリアし `pre-conversion` に戻す
- [x] 3.7 登録モードのその他キーハンドラー実装：inner state に対して `processKey` を再帰呼び出しし `wordRegistration.inputState` を更新する
- [x] 3.8 登録確定後の inner の `dictionaryRequest` を外側でも伝播させる（再帰登録中の変換に対応）

## 4. 個人辞書の実装 (dictionary.ts)

- [x] 4.1 `PersonalDictionaryProvider` クラスを実装する（`DictionaryProvider` を実装し、`register(midashiKey, word)` メソッドを追加）
- [x] 4.2 `PersonalDictionaryProvider` のコンストラクタで localStorage からデータを読み込む
- [x] 4.3 `register` メソッドで候補の先頭追加・重複除去・localStorage 保存を実装する
- [x] 4.4 `CompoundDictionaryProvider` クラスを実装する（`PersonalDictionaryProvider` + base `DictionaryProvider` を合成し、個人辞書優先・重複除去で返す）

## 5. フックの更新 (useSkkEngine.ts)

- [x] 5.1 `useDictionary` または `App` の provider 生成を `CompoundDictionaryProvider` に変更する
- [x] 5.2 `processKey` の結果から `registrationResult` を検出し、`PersonalDictionaryProvider.register()` を呼ぶ処理を追加する（`setSkkState` コールバック外で副作用を処理する）

## 6. テストの追加・更新

- [x] 6.1 `getPreEdit` の登録モード表示テストを追加する（単純・送り仮名あり・再帰の3ケース）
- [x] 6.2 `injectCandidates` に空配列を渡すと登録モードへ入るテストを追加する
- [x] 6.3 候補を使い切ると登録モードへ入るテストを追加する（`processConversion` + Space）
- [x] 6.4 登録モードでの Enter/Ctrl+J 確定テストを追加する（inner が空の場合の非確定も含む）
- [x] 6.5 登録モードでの Ctrl+G キャンセルテスト（pre-conversion 戻り・midashi 保持を検証）
- [x] 6.6 再帰登録テストを追加する（2段ネスト・表示・確定の流れ）
- [x] 6.7 `PersonalDictionaryProvider` の単体テスト（register・lookup・重複除去）
- [x] 6.8 `CompoundDictionaryProvider` の単体テスト（優先順序・重複除去）
- [x] 6.9 既存テストが変更した挙動（候補なし→登録モード）に対応するよう修正する
