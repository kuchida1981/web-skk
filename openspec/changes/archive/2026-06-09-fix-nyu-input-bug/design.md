## Context

`convertRomaji`（`src/skk/romaji-table.ts`）は最長一致ルックアップの前に2つの早期変換ハンドラーを持つ。

```
1. n ハンドラー: buffer[0]==='n' && !isVowel(buffer[1]) && buffer[1]!=='n' → ん確定
2. 促音ハンドラー: buffer[0]===buffer[1] && buffer[0]!=='n' → っ確定
```

`n` ハンドラーは **「n の次が子音なら ん を確定してよい」** という前提で書かれているが、`y` は子音でありながら `nya/nyi/nyu/nye/nyo` の2文字目にもなる。テーブルに `nyu:'にゅ'` 等が正しく定義されているにも関わらず、`ny` の時点でハンドラーが割り込み最長一致に到達しない。

## Goals / Non-Goals

**Goals:**
- `ny*` シーケンス（にゃ・にぃ・にゅ・にぇ・にょ）が正しく変換される
- ひらがな直接入力・変換モード（▽）・カタカナモード全てで修正される
- 既存の `n` → ん変換（`nk`, `nb`, `ns` など）の挙動は変えない
- テストカバレッジを追加する

**Non-Goals:**
- ローマ字テーブル自体の変更（`nyu` エントリは既に正しい）
- 他の入力方式（ `tchi` → っち など）の対応（別の問題）
- 促音ハンドラーへの変更

## Decisions

### 決定: n ハンドラーに「2文字プレフィックスがテーブルに存在する場合はスキップ」条件を追加する

```typescript
// 変更前
if (buffer.length >= 2 && buffer[0] === 'n' && !isVowel(buffer[1]) && buffer[1] !== 'n') {
  return { type: 'converted', kana: 'ん', remaining: buffer.slice(1) }
}

// 変更後
if (buffer.length >= 2 && buffer[0] === 'n' && !isVowel(buffer[1]) && buffer[1] !== 'n') {
  const prefix = buffer.slice(0, 2)
  const couldExtend = Object.keys(ROMAJI_TABLE).some(k => k.length > 1 && k.startsWith(prefix))
  if (!couldExtend) {
    return { type: 'converted', kana: 'ん', remaining: buffer.slice(1) }
  }
}
```

**代替案として検討した方法**: `buffer[1] !== 'y'` を条件に追加するハードコードアプローチ。将来的な拡張（`ny` 以外に同様の問題が起きた場合）に対応できないため不採用。テーブル駆動のチェックが自己文書化的かつ堅牢。

**パフォーマンス**: `Object.keys(ROMAJI_TABLE)` は毎回呼ばれるが、テーブルは ~100エントリ程度でキーストロークごとの処理であり実用上無視できる。必要なら定数として事前計算可能だが現時点では不要。

### 決定: テストは unit（romaji-table.test.ts）と integration（engine.test.ts）の両方に追加する

`convertRomaji` 自体のユニットテストと、`appendRomaji` を経由したエンジン統合テストを両方追加することで、回帰を複数レイヤーで検出できるようにする。

## Risks / Trade-offs

- `Object.keys(ROMAJI_TABLE).some(...)` は参照透明だが、テーブルに新しい `n+consonant` 系エントリを追加した場合に自動的に正しく振る舞う → リスクより恩恵が大きい
- 促音ハンドラーに同様の問題がないか確認済み: 2文字連続子音で始まるテーブルエントリは存在しないため影響なし
