## Context

`src/skk/engine.ts` の `processConversion` 関数が▼モードのキー入力を処理している。現状 `Space` / `Tab` で次候補へ進む分岐はあるが、前候補へ戻る分岐が存在しない。本家 SKK では `x` が前候補キーとして定義されており、`Shift+Tab` も直感的な代替として広く使われている。

## Goals / Non-Goals

**Goals:**
- ▼モードで `x` または `Shift+Tab` により `candidateIndex` を 1 つ減らす
- 先頭候補（index 0）では何もしない（no-op）

**Non-Goals:**
- UI レイヤーの変更（`useSkkEngine.ts` や表示コンポーネント）
- 辞書・個人辞書への影響
- ワード登録モード中の前候補操作

## Decisions

### `x` と `Shift+Tab` を同一分岐で処理する

`processConversion` 内の既存の `if (key === ' ' || key === 'Tab')` パターンに倣い、`if (key === 'x' || (key === 'Tab' && shiftKey))` として1つの分岐にまとめる。

**代替案**: 別々の分岐にする → コードが冗長になるためまとめる。

### 先頭候補での `x` は no-op

`candidateIndex` が 0 のとき、`state` をそのまま返す。pre-conversion に戻る選択肢もあるが、誤操作リスクを下げるために no-op が安全。

## Risks / Trade-offs

- `x` は通常英字入力として使われるキーだが、▼モード限定の処理なので衝突しない
- `Shift+Tab` は `key === 'Tab'` かつ `shiftKey === true` として届く。`useSkkEngine.ts` の `e.preventDefault()` が既にかかっているため、ブラウザのフォーカス移動を妨げない
