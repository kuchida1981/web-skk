## Context

SKKは独自の状態マシンを持つ日本語入力方式で、OS/IMEレベルで動作するのが一般的。ブラウザでは標準のIMEをバイパスし、`keydown`イベントを直接捕捉してSKKロジックを実装する必要がある。ブラウザ向けの成熟したSKKライブラリは存在しないため、TypeScriptで自前実装する。将来のタイピングゲームモード（v2）への拡張を見据えた設計とする。

## Goals / Non-Goals

**Goals:**
- SKKエンジンをReact/DOM/ブラウザAPIから完全に切り離した純粋TypeScriptモジュールとして実装する
- `processKey(state, key) → newState` の純粋関数インターフェースを持つ
- 辞書レイヤーをテスト時に差し替え可能（モック辞書対応）にする
- v2のタイピングゲームモードがエンジンをそのまま利用できる設計にする

**Non-Goals:**
- 数値変換（#プレフィックス）
- abbrevモード（/プレフィックス）
- 新語登録（辞書への書き込み）
- SKKサーバー連携

## Decisions

### 1. SKKエンジンを純粋TypeScriptで自前実装する

**選択**: 自前実装（TypeScript）

**理由**: ブラウザ向けの成熟したSKKライブラリが存在しない。cskk（Rust/WASM）はデスクトップIME向けであり、ブラウザバインディングが不明確。自前実装であれば状態マシンをトレーニングUIに最適化した形（状態の完全可視化）で設計できる。

**代替案**: cskk WASMビルド → ブラウザバインディングの不確実性と、状態の外部観察が困難なため不採用。

---

### 2. エンジンインターフェース: 純粋関数 + 不変状態

```
type SkkState = {
  mode: 'hiragana' | 'katakana' | 'ascii' | 'zenkaku-ascii'
  phase: 'direct' | 'pre-conversion' | 'conversion'
  committed: string        // 確定済みテキスト
  preEdit: string          // 変換前テキスト（▽マーカー部分）
  romajiBuffer: string     // ローマ字未確定バッファ
  okuriganaBuffer: string  // 送り仮名バッファ
  midashi: string          // 見出し語（辞書検索キー）
  candidates: string[]     // 変換候補リスト
  candidateIndex: number   // 現在の候補インデックス
}

processKey(state: SkkState, key: KeyboardEvent): {
  nextState: SkkState
  dictionaryRequest?: { midashi: string; okurigana: string }
}
```

辞書検索が必要なときはエンジンが`dictionaryRequest`を返し、呼び出し側が非同期で辞書を引いて結果を`SkkState.candidates`に注入する。エンジン自体は非同期処理を含まない。

---

### 3. 辞書: テキスト形式 → メモリ上のMapで検索

**形式**: SKK-JISYO.L（EUC-JP エンコード）

**処理フロー**:
```
fetch(URL) → EUC-JP decode → テキストパース → Map<string, string[]> → IndexedDB保存
                                                        ↓
                                              2回目以降: IndexedDB → Map 再構築
```

**検索**: `Map.get(midashi)` でO(1)ルックアップ。送り仮名付きの場合は`midashi + okurigana[0]`をキーとして試みる。

---

### 4. キーボードイベント: `keydown`を`contenteditable`要素で捕捉

ネイティブIMEが介入しないよう、`keydown`イベントを`event.preventDefault()`で抑制し、SKKエンジンが処理する。表示は`div[contenteditable=false]`（またはカスタムテキストエリア）にReactで描画する。

**代替案**: `<textarea>` + `compositionstart/end` → ブラウザのネイティブIMEとの競合が避けられないため不採用。

---

### 5. テスト戦略

| 層 | ツール | 対象 |
|---|---|---|
| Unit | Vitest | SKKエンジン、ローマ字変換、辞書パーサ（DOM不要） |
| Integration | Vitest + React Testing Library | Reactコンポーネント × エンジン |
| E2E | Playwright | 実ブラウザでのキー入力シナリオ |

## Risks / Trade-offs

- **モバイル対応** → v1対象外。物理キーボード前提。モバイルは後続バージョンで検討。
- **EUC-JPデコード** → `TextDecoder('euc-jp')`はブラウザでサポート済みだが、環境差異に注意。回避策としてUTF-8変換済みJISOYファイルをホストすることも検討。
- **辞書4MBのメモリ展開** → Map展開後は10〜30MB程度のメモリ使用が見込まれる。現代的なブラウザでは問題ないが、低スペック端末での動作は保証しない。
- **送り仮名の複雑さ** → 送り仮名ロジックはSKKの中で最も難易度が高い。複数の送り仮名パターン（二重子音、特殊ルール）をユニットテストで網羅する。
