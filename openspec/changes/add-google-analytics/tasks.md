## 1. 依存追加

- [ ] 1.1 `@types/gtag.js` を devDependency に追加する（`npm install -D @types/gtag.js`）

## 2. GA スニペットの追加

- [ ] 2.1 `index.html` の `<head>` 冒頭に gtag.js の `<script async src="...">` タグを追加する
- [ ] 2.2 `index.html` に `window.dataLayer` / `window.gtag` の初期化スニペットと `gtag('config', 'G-XXXXXXXXXX')` を追加する（Measurement ID は実際の値に置き換える）

## 3. analytics モジュールの作成

- [ ] 3.1 `src/lib/analytics.ts` を新規作成し、`trackEvent(name, params?)` 関数を実装する（`window.gtag?.('event', ...)` のオプショナルチェーンで無音失敗）

## 4. イベント配線

- [ ] 4.1 `App.tsx` の `switchMode()` に `trackEvent('mode_switch', { mode })` を追加する
- [ ] 4.2 `App.tsx` に `dictState.status` を監視する `useEffect` を追加し、`'ready'` → `dictionary_ready`、`'error'` → `dictionary_error` を送信する
- [ ] 4.3 `App.tsx` に `game.gameState.phase` を監視する `useEffect` を追加し、`'result'` への遷移で `game_complete` を送信する（`difficulty`, `time_ms` を含む）
- [ ] 4.4 `TypingGame.tsx` の `onStart` を `startGame` のラッパーに変え、`game_start` を送信してから `game.startGame(difficulty)` を呼ぶ
- [ ] 4.5 `TypingGame.tsx` の `handleQuit()` に `trackEvent('game_abandon', { difficulty, questions_done: gameState.currentIndex })` を追加する（`phase === 'playing'` のときのみ発火するのでガード不要）

## 5. 動作確認

- [ ] 5.1 ブラウザの DevTools で Network タブを開き、各インタラクションで `google-analytics.com` への通信が発生することを確認する
- [ ] 5.2 GA4 のリアルタイムレポートで各カスタムイベントが表示されることを確認する
