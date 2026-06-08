# web-skk

ブラウザ上でSKK日本語入力を体験できるWebアプリです。インストール不要で、SKK独自の入力方式をすぐに試すことができます。

**デモサイト:** https://skk.u-rei.com/

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

## 機能

- OSレベルのIMEなしでブラウザ上からSKKを体験できる
- ひらがな・カタカナ・ASCII・全角ASCIIの各モード対応
- 送り仮名（okurigana）付き漢字変換
- **辞書登録モード**: 候補が存在しないとき、入れ子のSKK入力で単語をその場で登録できる
- **個人辞書**: 登録した語をlocalStorageに永続化し、共通辞書より優先して候補に出す
- 辞書：SKK-JISYO.L（約6MB）、初回ロード後はIndexedDBにキャッシュ
- **タイピングゲームモード**: easy / normal / hard の難易度で10問に挑戦、タイマーとスコア履歴付き
- ヘッダータブで切り替えられる2モード：**フリー入力**と**ゲーム**
- モードインジケーター、候補ポップアップ、IMEオフ案内付き折りたたみキーガイド

---

## 対応範囲

このアプリは SKK の**中核的な体験**を提供することを目的としており、[ddskk](https://github.com/skk-dev/ddskk) が持つすべての機能は実装していません。

以下の機能は意図的に省いています：

| 機能 | ddskk での操作 | 備考 |
|------|----------------|------|
| Abbrev モード | ひらがなモードで `/` | ASCII 文字で辞書を引くモード。現在 `/` は中点（・）に割り当て済み |
| 補完 (skk-comp) | ▽モードで `Tab` | 辞書からの前方一致補完。現在 `Tab` は `Space` と同じ変換扱い |
| アノテーション表示 | 候補選択時 | 辞書エントリの `;` 以降の注釈（意味・読み）は非表示 |
| 数値変換 (skk-num) | 見出し語中の `#` | `#0`〜`#9` 形式による数字の多形式変換 |
| 句読点スタイル切替 | `skk-toggle-kutouten` | 。、↔ ．， の切替 |
| スティッキーシフト | 任意キーで ▽ 起動 | シフトキーを使わずに変換開始点を指定する入力スタイル |
| SKK サーバー接続 | skkserv プロトコル | 外部辞書サーバーへの問い合わせ |

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

## 開発サーバーの起動

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
| `Ctrl+J` | ひらがなモードへ（一部ブラウザでは `Shift+Ctrl+J`） |
| `Q` | ひらがな ↔ カタカナ切り替え |
| `l` | ASCIIモードへ |
| `L` | 全角ASCIIモードへ |
| `Backspace` | 1文字削除 |

**送り仮名の入力例：** 「書く」を入力するには `K` `a` `K` `u` と打ちます。2つ目の大文字 `K` が送り仮名の開始を示します。

**辞書登録：** Spaceを押しても候補が存在しない（または候補リストの末尾を超えた）とき、辞書登録モードへ入ります。入れ子のSKK入力で語を入力してEnterを押すと、個人辞書にすぐ保存されます。

> **注意：** アプリ使用前にシステムの日本語入力（Microsoft IME・Google 日本語入力・Fcitxなど）をオフにしてください。キーが競合する場合があります。

---

## タイピングゲーム

ヘッダーの**ゲーム**タブに切り替え、難易度を選んでスタートします。

| 難易度 | 内容 |
|--------|------|
| Easy | ひらがな・カタカナのみ（5〜10文字） |
| Normal | 送り仮名なしの漢字変換（10〜18文字） |
| Hard | 送り仮名ありの漢字変換（15〜25文字） |

各難易度のプールからランダムに10問出題されます。タイマーは第1問から計測されます。10問すべてに正解すると合計タイムと過去のスコア履歴（最大10件表示、最大50件をlocalStorageに保存）が結果画面に表示されます。

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
- `src/skk/*.test.ts` — SKKエンジン・ローマ字変換・辞書パーサ（DOM不要）
- `src/hooks/*.test.ts` — タイピングゲームのロジックとスコア保存
- `src/components/*.test.tsx` — Reactコンポーネントのインテグレーションテスト
- `e2e/` — PlaywrightのE2Eシナリオ

---

## プロダクションビルド

```bash
npm run build
```

成果物は `dist/` に出力されます。任意の静的ファイルサーバーで配信できます：

```bash
npm run preview   # Viteの内蔵プレビューサーバー
```

ビルドは GitHub Pages 向けに `base: '/web-skk/'` を設定済みです。GitHub で Release を公開すると、デプロイワークフロー（`.github/workflows/deploy.yml`）が自動起動します。

---

## プロジェクト構成

```
src/
  skk/
    types.ts            # SkkState型・INITIAL_STATE・getPreEdit()
    romaji-table.ts     # ローマ字→かな変換テーブルと変換ロジック
    engine.ts           # processKey() — 純粋関数ステートマシン（React/DOM非依存）
    dictionary.ts       # SKK-JISYOパーサ・IndexedDBキャッシュ・個人辞書・DictionaryProvider
  components/
    SkkInputArea.tsx    # メイン入力欄（keydown捕捉・▽/▼表示）
    CandidatePopup.tsx
    ModeIndicator.tsx
    DictionaryStatus.tsx
    KeyGuide.tsx
    game/
      TypingGame.tsx    # ゲームモードのルートコンポーネント
      GameStart.tsx     # 難易度選択画面
      GameQuestion.tsx  # 問題表示・入力画面
      GameResult.tsx    # 結果・スコア履歴画面
  hooks/
    useSkkEngine.ts     # エンジン+辞書をReact状態に接続するカスタムフック
    useDictionary.ts    # 辞書の非同期ロードと状態管理
    useTypingGame.ts    # タイピングゲームのステートマシン
    useGameScore.ts     # スコアのlocalStorage永続化
  data/
    questions.ts        # 静的問題バンク（easy / normal / hardプール）
public/
  skk-jisyo.utf8        # SKK-JISYO.L（UTF-8変換済み）
e2e/
  skk-input.spec.ts     # PlaywrightのE2Eシナリオ
```

---

## アーキテクチャについて

SKKエンジン（`src/skk/engine.ts`）は純粋関数として実装されています：

```
processKey(state: SkkState, event: KeyboardEvent) → { nextState, dictionaryRequest?, registrationResult? }
```

React・DOM・ブラウザAPIに一切依存しないため：
- **ブラウザなしでユニットテスト可能**
- **フリー入力とゲームモードの両方で再利用可能**

辞書引きが必要な場合、エンジンは `dictionaryRequest` を返します。Reactフック（`useSkkEngine`）がそれを受け取り、同期的に辞書を引いて候補を状態に注入します。辞書登録が確定すると `registrationResult` が返され、フックが個人辞書（localStorage）に保存し、以降の候補リストの先頭に追加します。

個人辞書は `CompoundDictionaryProvider` が管理しており、共通辞書をラップして常にユーザー登録語を優先し、重複を除去して返します。

---

## ライセンス

MIT
