## Why

公開中の SKK 体験アプリ（GitHub Pages）の利用状況が把握できていない。GA4 を導入してページビュー・機能利用状況・辞書エラーを計測し、改善の判断材料を得る。

## What Changes

- `index.html` の `<head>` 冒頭に GA4 の gtag.js スニペットを追加（Measurement ID ハードコード）
- `src/lib/analytics.ts` を新規作成 — `trackEvent()` のみを公開する薄いラッパー
- `@types/gtag.js` を devDependency に追加（型補完用、ランタイムコストなし）
- `App.tsx` に `mode_switch` / `dictionary_ready` / `dictionary_error` / `game_complete` の計測を追加
- `TypingGame.tsx` に `game_start` / `game_abandon` の計測を追加

## Capabilities

### New Capabilities

- `analytics`: GA4 によるアクセス解析。ページビュー（自動）と下記カスタムイベントを計測する。
  - `mode_switch` — フリー↔ゲームモード切替時 `{mode}`
  - `game_start` — ゲーム開始時 `{difficulty}`
  - `game_complete` — 10問完答時 `{difficulty, time_ms}`
  - `game_abandon` — ゲーム中に中断ボタン押下時 `{difficulty, questions_done}`（結果画面からの離脱は除く）
  - `dictionary_ready` — 辞書読み込み成功時
  - `dictionary_error` — 辞書読み込み失敗時 `{message}`

### Modified Capabilities

（なし）

## Impact

- **ファイル変更**: `index.html`, `src/lib/analytics.ts`（新規）, `src/App.tsx`, `src/components/game/TypingGame.tsx`
- **依存追加**: `@types/gtag.js`（devDependency のみ）
- **外部サービス**: Google Analytics 4（Measurement ID 取得済み）
- **プライバシー**: Cookie 同意バナー不要（対象ユーザーのスコープ上）
- **破壊的変更**: なし
