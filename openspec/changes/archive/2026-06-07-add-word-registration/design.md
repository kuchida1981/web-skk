## Context

現在の `engine.ts` は候補が尽きたとき（または候補ゼロのとき）にみだしをそのままコミットするため、辞書登録が行われない。エンジンは純粋関数として設計されており、`processKey` は副作用を持たず `ProcessKeyResult` を返す。副作用（辞書 lookup）は `useSkkEngine` フックが担う。この設計原則を維持しながら辞書登録を追加する。

## Goals / Non-Goals

**Goals:**
- 候補なし・候補尽きた時に辞書登録モードへ入る
- 登録モード中に再帰的に SKK 変換が使える（任意の深さ）
- 登録語を localStorage に永続化し、次回から優先候補として使う
- エンジンの純粋関数設計を維持する

**Non-Goals:**
- 登録済み語の削除・編集 UI
- 辞書ファイルへの書き出しや外部サーバーへの同期
- 登録数の上限管理（localStorage の容量制限に委ねる）

## Decisions

### 1. 登録状態を `SkkState` の入れ子フィールドで表現する

`wordRegistration` フィールドを `SkkState` に追加する。新しい phase 値を追加しない。

```typescript
wordRegistration?: {
  midashi: string      // 表示用（人間に読みやすい形。"うごく" など）
  midashiKey: string   // 辞書キー（"うごk" など、送り仮名子音付き）
  okurigana: string    // 送り仮名（あれば）
  inputState: SkkState // 登録語入力用の内側 SKK 状態（再帰可）
}
```

**理由**: `inputState` が再帰的に `wordRegistration` を持てるため、任意の深さの再帰登録を自然に表現できる。phase を増やすより型で「モード」を表現する方が各関数の分岐が明確になる。

**代替案**: `phase: 'word-registration'` を追加し、別フィールドで inner state を保持する案も検討したが、再帰構造を表現しにくくなる。

---

### 2. `processKey` が `wordRegistration` を先に検査する

```
processKey(state, event):
  ↓
  state.wordRegistration が存在する？
  ├── YES → innerResult = processKey(state.wordRegistration.inputState, event)
  │          ├── Enter/Ctrl+J かつ inner.committed が空でない
  │          │     → registrationResult を返す + wordRegistration をクリア
  │          ├── Ctrl+G
  │          │     → wordRegistration をクリア + phase を pre-conversion に戻す
  │          └── その他
  │                → wordRegistration.inputState を innerResult.nextState で更新
  └── NO  → 既存の direct / pre-conversion / conversion ロジック
```

**理由**: 最上位での分岐により、既存の3フェーズのロジックを変更せずに登録モードのハンドリングを追加できる。

---

### 3. `registrationResult` を `ProcessKeyResult` に追加して副作用をフックに委ねる

```typescript
interface ProcessKeyResult {
  nextState: SkkState
  dictionaryRequest?: DictionaryRequest
  registrationResult?: {    // 新規追加
    midashiKey: string
    word: string
  }
}
```

`dictionaryRequest` と同じパターン。エンジンは副作用を持たず、フックが localStorage への保存と provider の更新を行う。

**理由**: エンジンの純粋関数設計を維持できる。テストでも `registrationResult` を検証するだけでよく、localStorage のモックが不要。

---

### 4. `getPreEdit` を再帰レンダリングに対応させる

```typescript
function getPreEdit(state: SkkState): string {
  if (state.wordRegistration) {
    const { midashi, okurigana, inputState } = state.wordRegistration
    return '[登録: ' + midashi + okurigana + ']' + getPreEdit(inputState)
  }
  // 既存ロジック
}
```

**理由**: 新しい UI コンポーネント不要。登録モードの表示をテキストの一部として扱うことで SKK の雰囲気を壊さない。

---

### 5. 個人辞書は `PersonalDictionaryProvider` + `CompoundDictionaryProvider` で実装する

`DictionaryProvider` インターフェースは変更しない。

```
CompoundDictionaryProvider implements DictionaryProvider
  ├── PersonalDictionaryProvider（localStorage + register() メソッド持つ）
  └── base: DictionaryProvider（MapDictionaryProvider）
```

`PersonalDictionaryProvider.register(midashiKey, word)` は localStorage を更新し、メモリ上の Map も即座に更新する（次のキー入力から反映される）。

**理由**: 既存の `DictionaryProvider` インターフェースを変えないため、テスト用の `MockDictionaryProvider` や `MapDictionaryProvider` に影響なし。フックは `CompoundDictionaryProvider` を生成して `useSkkEngine` に渡すだけ。

---

### 6. `injectCandidates` のトリガー変更と登録状態生成

`injectCandidates` は現在エンジン外（フック側）で呼ばれる。空配列を渡されたとき、現在は midashi をコミットするが、今後は登録モードに入るよう変更する。

`processConversion` の Space で候補が尽きた場合も同様に登録モードへ入る。

登録モードへ入る際、`SkkState.wordRegistration` の `midashi`（表示用）と `midashiKey`（辞書キー）の導出：

```
送り仮名なし: midashi = state.midashi,  midashiKey = state.midashi
送り仮名あり: midashi = state.midashi + state.okurigana（読み全体）
             midashiKey = state.midashi + state.okuriganaBuffer（辞書キー形式）
```

## Risks / Trade-offs

- **再帰の深さ**: 理論上は無限再帰可能だが、実用上は2段程度。スタックオーバーフローの心配はない。
- **localStorage の同期**: `PersonalDictionaryProvider` は同期的に localStorage を読み書きする。辞書データは JSON の小さなオブジェクトなので性能上の問題は生じにくい。
- **`useSkkEngine` の `setSkkState` コールバック内での副作用**: `registrationResult` を受け取ったとき、React の `setState` コールバック内から `PersonalDictionaryProvider.register()` を呼ぶのは副作用なので `useEffect` または `useCallback` の外で処理する必要がある。`setSkkState` から `registrationResult` を外部へ「漏らす」ために `useRef` か二段階 setState を使う。

## Open Questions

（なし：探索フェーズで方針は確定済み）
