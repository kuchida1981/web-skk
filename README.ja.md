# web-skk

ブラウザ上でSKK日本語入力を体験できるWebアプリです。インストール不要で、SKK独自の入力方式をすぐに試すことができます。

> **English README:** [README.md](./README.md)

---

## SKKとは

SKKは、一般的なIMEと大きく異なる日本語入力方式です。形態素解析による自動変換は行わず、ユーザーが変換境界を明示的に指定します。**大文字**で変換ブロックの開始を示し、**Space**で変換を実行します。慣れるまで少し学習コストがありますが、変換が決定論的で高速という特徴があります。

一般的なIMEとの主な違い：
- **大文字**で変換開始（▽マーカー）
- **Space**で辞書引き・候補選択
- **Enter**で確定、**Ctrl+G**でキャンセル
- 送り仮名の区切りもユーザーが指定する

---

## 機能（v1）

- OSレベルのIMEなしでブラウザ上からSKKを体験できる
- ひらがな・カタカナ・ASCII・全角ASCIIの各モード対応
- 送り仮名（okurigana）付き漢字変換
- 辞書：SKK-JISYO.L（約6MB）、初回ロード後はIndexedDBにキャッシュ
- モードインジケーター、候補ポップアップ、折りたたみ可能なキーガイド
- SKKエンジンは純粋TypeScript製（React/DOM非依存・ユニットテスト済み）

---

## 動作要件

| ツール | バージョン |
|--------|-----------|
| Node.js | ≥ 20 |
| npm | ≥ 10 |

---

## インストール

```bash
git clone <repo-url>
cd web-skk
npm install
```

---

## 開発サーバーの起動（動作確認・デバッグ用）

```bash
npm run dev
```

ブラウザで **http://localhost:5173** を開いてください。

### 起動後の動作

1. アプリが起動し、辞書（`public/skk-jisyo.utf8`、約6MB）のフェッチ中はスピナーが表示される
2. 辞書の読み込みが完了すると入力欄が有効化され、自動的にフォーカスが当たる
3. 2回目以降のアクセスはIndexedDBから辞書を読み込むため、ネットワーク通信なしで即時起動する

### デバッグのポイント

| 確認したいこと | 手順 |
|---------------|------|
| IndexedDBキャッシュの中身 | DevTools → **アプリケーション → IndexedDB → web-skk** |
| 辞書を強制的に再取得する | 上記のIndexedDBエントリを削除してページリロード |
| 辞書読み込みエラーの確認 | ブラウザのコンソールにエラーメッセージが表示される |
| 変換動作のトレース | DevToolsでブレークポイントを `src/skk/engine.ts` の `processKey` に設定 |

---

## SKKキー操作リファレンス

| キー | 動作 |
|------|------|
| 小文字アルファベット | ローマ字入力（かな変換） |
| **大文字アルファベット**（例: `K`） | 変換開始（▽モード） |
| `Space` | 変換 / 次の候補へ |
| `Enter` | 現在の入力を確定 |
| `Ctrl+G` | 変換をキャンセル |
| `Ctrl+J` | ひらがなモードへ |
| `Q` | ひらがな ↔ カタカナ切り替え |
| `l` | ASCIIモードへ |
| `L` | 全角ASCIIモードへ |
| `Backspace` | 1文字削除 |

**送り仮名の入力例：** 「書く」を入力するには `K` `a` `K` `u` と打ちます。2つ目の大文字 `K` が送り仮名の開始を示します。

---

## テストの実行

```bash
# ユニット・インテグレーションテスト（Vitest）
npm test

# ウォッチなし1回実行
npx vitest run

# E2Eテスト（開発サーバーが起動している状態で実行）
npm run test:e2e
```

テスト内訳：
- `src/skk/*.test.ts` — SKKエンジン・ローマ字変換・辞書パーサ（64テスト、DOM不要）
- `src/components/*.test.tsx` — Reactコンポーネントのインテグレーションテスト

---

## プロダクションビルド

```bash
npm run build
```

成果物は `dist/` に出力されます。任意の静的ファイルサーバーで配信できます：

```bash
npm run preview   # Viteの内蔵プレビューサーバー
```

---

## プロジェクト構成

```
src/
  skk/
    types.ts          # SkkState型・INITIAL_STATE・getPreEdit()
    romaji-table.ts   # ローマ字→かな変換テーブルと変換ロジック
    engine.ts         # processKey() — 純粋関数ステートマシン（React/DOM非依存）
    dictionary.ts     # SKK-JISYOパーサ・IndexedDBキャッシュ・DictionaryProvider
  components/
    SkkInputArea.tsx  # メイン入力欄（keydown捕捉・▽/▼表示）
    CandidatePopup.tsx
    ModeIndicator.tsx
    DictionaryStatus.tsx
    KeyGuide.tsx
  hooks/
    useSkkEngine.ts   # エンジン+辞書をReact状態に接続するカスタムフック
    useDictionary.ts  # 辞書の非同期ロードと状態管理
public/
  skk-jisyo.utf8      # SKK-JISYO.L（UTF-8変換済み）
e2e/
  skk-input.spec.ts   # PlaywrightのE2Eシナリオ
```

---

## アーキテクチャについて

SKKエンジン（`src/skk/engine.ts`）は純粋関数として実装されています：

```
processKey(state: SkkState, event: KeyboardEvent) → { nextState, dictionaryRequest? }
```

React・DOM・ブラウザAPIに一切依存しないため：
- **ブラウザなしでユニットテスト可能**
- **将来のタイピングゲームモードでも再利用可能**

辞書引きが必要な場合、エンジンは `dictionaryRequest` を返します。Reactフック（`useSkkEngine`）がそれを受け取り、同期的に辞書を引いて候補を状態に注入します。

---

## ライセンス

MIT
