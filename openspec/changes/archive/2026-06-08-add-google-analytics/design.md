## Context

SKK 体験アプリは React + Vite の SPA で、GitHub Pages にデプロイされている。現状、利用状況の計測手段がなく、改善の判断が主観に頼らざるを得ない。GA4 を導入することで定量データを得る。

SPA のため「ページ遷移」はなく、モード切替・ゲームの進行・辞書の状態変化といったインタラクションが計測ポイントになる。

## Goals / Non-Goals

**Goals:**
- GA4 のページビューを自動計測する
- アプリ固有の 6 種類のカスタムイベントを計測する
- 型安全な analytics ラッパーを `src/lib/analytics.ts` に実装する
- 開発環境でも誤送信なく動作する（本番 ID を開発環境で使わない想定は今回スコープ外）

**Non-Goals:**
- Cookie 同意バナー
- ルーターベースの仮想ページビュー追跡
- 複数環境（dev/staging/prod）での ID 切り替え
- E2E テストでの GA 送信検証

## Decisions

### 1. gtag.js を `index.html` に直書きする

**採用理由**: GA の推奨配置（`<head>` 冒頭）に忠実で、スクリプト読み込みが最速になる。Vite プラグイン不要でシンプル。

**代替案**: `analytics.ts` 内で動的に `<script>` を挿入する案 → ページ読み込みの初期フェーズより遅れるため見送り。

### 2. Measurement ID を `index.html` にハードコードする

**採用理由**: GA Measurement ID は HTML ソースに出力されるため本質的に公開情報。`.env` や GitHub Secrets で隠す意味がない。シンプルさを優先する。

**代替案**: `VITE_GA_MEASUREMENT_ID` 環境変数を使う案 → 利点がなく複雑さが増すため見送り。

### 3. `src/lib/analytics.ts` に薄いラッパーを置く

**採用理由**: `window.gtag` への直接呼び出しをアプリコード全体に散らばらせず、1 ファイルに集約する。将来 GA 以外のツールに切り替える際の変更点を最小化する。型は `@types/gtag.js` で補完する（ランタイムコストゼロ）。

`trackEvent()` のみを公開し、初期化は `index.html` のスニペットが担う。

### 4. イベント発火箇所

| イベント | 配線箇所 | 理由 |
|---|---|---|
| `mode_switch` | `App.tsx` の `switchMode()` | モード状態を持つ最上位コンポーネント |
| `dictionary_ready/error` | `App.tsx` の `useEffect`（`dictState.status` 監視） | 辞書状態変化を一箇所で捕捉 |
| `game_complete` | `App.tsx` の `useEffect`（`game.gameState.phase` 監視） | `'result'` への遷移を監視 |
| `game_start` | `TypingGame.tsx` の `onStart` ラッパー | `startGame` の呼び出し元に最も近い |
| `game_abandon` | `TypingGame.tsx` の `handleQuit()` | `phase === 'playing'` の中断のみを担う関数 |

`game_complete` を `App.tsx` の `useEffect` で検知する理由: `saveRecord` を wrap する案もあるが、effect の方が「フェーズ遷移という事実」を宣言的に表現できる。

## Risks / Trade-offs

- **開発中も GA に送信される**: Measurement ID をハードコードしているため、`dev` サーバーで動かしても本番 GA に送信される。GA の「内部トラフィックフィルタ」設定で IP 除外することで対処可能。
- **gtag.js の読み込み失敗**: ネットワークエラーで gtag.js が読み込めない場合、`window.gtag` が未定義になる。`trackEvent` 内で `window.gtag?.()` のオプショナルチェーンを使うことで無音で失敗させる。
- **`game_complete` の二重発火リスク**: `useEffect` は `phase` が `'result'` に遷移するたびに発火する。`playAgain` で再プレイしても `phase` は `'playing'` → `'result'` と遷移するため問題ない（毎回 1 回ずつ発火する）。
