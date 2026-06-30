## Context

現在の `SkkState.committed` は単純な文字列で、カーソル位置の概念がない。`SkkInputArea` は committed テキストを末尾に追加・末尾から削除する操作しか持たず、ユーザーは途中の文字を修正するために Backspace で正しい位置まで戻る必要がある。

`SkkInputArea` はすべてのキーイベントを `window.addEventListener('keydown', { capture: true })` で捕捉しており、ブラウザのネイティブなテキスト編集（矢印キーによるカーソル移動など）は発生しない。

## Goals / Non-Goals

**Goals:**
- `direct` フェーズで矢印キー・readline 風キーによるカーソル移動を可能にする
- Backspace・テキスト確定がカーソル位置を基準に動作するようにする
- 既存の SKK キーバインド（Ctrl+G/H/J）を維持する

**Non-Goals:**
- クリックによるカーソル位置指定
- テキスト選択・コピー操作
- `pre-conversion` / `conversion` フェーズでのカーソル移動

## Decisions

### Decision 1: `cursorPos` を `SkkState` に持つ

`cursorPos` を `SkkState` の外（React state など）ではなく `SkkState` 内に持つ。

**理由**: カーソル位置はキー処理の結果として変化し、テキスト確定（`withCommit`）と不可分。エンジンが確定するテキスト量を cursorPos に反映するためにはエンジン内で管理するのが自然。React state に分けると `useSkkEngine` フックで2つの state を同期させる複雑さが生じる。

**単位**: コードポイント（`[...committed]` のインデックス）。日本語文字（BMP）と ASCII の範囲では UTF-16 コードユニットと一致するが、サロゲートペアへの一貫性のため `[...committed]` を使う。

**初期値・リセット**: `committed.length`（末尾）。リセット時も末尾に戻す。

### Decision 2: `pre-conversion` / `conversion` フェーズでは矢印・readline キーを無視

変換フェーズ中は候補選択（Space/x）など専用の操作が定義されており、矢印キーを追加すると操作体系が複雑になる。フェーズ間でカーソル移動の意味が異なることも混乱を招く。シンプルに無視する（既存の `return { nextState: state }` と同じ挙動）。

### Decision 3: `withCommit` でカーソル位置に挿入する

現在の `withCommit` は `committed + text` で末尾追加する。これをカーソル位置への挿入に変更する。

```
before: committed[:cursorPos] + text + committed[cursorPos:]
cursorPos: cursorPos + [...text].length
```

これにより、カーソルが途中にあっても新たに確定した文字がカーソル位置に挿入される。

### Decision 4: `Ctrl+W` の単語境界

`Ctrl+W` は readline の `backward-kill-word` に相当する。単語境界の定義を「連続する空白または句読点の直前」とする（日本語スペース・ASCII スペース・句読点を区切りとする）。単純な定義で実用的な範囲をカバーできる。

### Decision 5: `SkkInputArea` の表示分割

```tsx
const chars = [...skkState.committed]
const before = chars.slice(0, skkState.cursorPos).join('')
const after = chars.slice(skkState.cursorPos).join('')

<span class="skk-committed">{before}</span>
<span class="skk-preedit">{preEdit}</span>   {/* direct フェーズでは空文字 */}
<span class="skk-cursor" />
<span class="skk-committed">{after}</span>
```

pre-edit がない（direct フェーズ）場合、`<span class="skk-preedit">` は空になり、カーソルが committed テキストの中途に描画される。

## Risks / Trade-offs

- **既存テストへの影響**: `SkkState` に `cursorPos` が加わるため、`engine.test.ts` の初期状態生成やスナップショット比較が壊れる可能性がある。`INITIAL_STATE` を使っているテストは自動的に対応されるが、inline で `SkkState` オブジェクトを組み立てているテストは修正が必要。
  → `INITIAL_STATE` スプレッドを使うように統一し、新フィールドの追加にテストが耐えられる構造にする。

- **`wordRegistration.inputState` にも `cursorPos` が必要**: 入れ子の `SkkState` を持つ単語登録モードでも `cursorPos` が含まれる。登録モード中のカーソル移動は `processKey` の再帰呼び出しで自然に動作する。

- **コードポイント計算のオーバーヘッド**: `[...committed]` は毎回スプレッドするため O(n)。練習ツールとして入力されるテキスト量は高々数百文字なので実用上問題ない。
