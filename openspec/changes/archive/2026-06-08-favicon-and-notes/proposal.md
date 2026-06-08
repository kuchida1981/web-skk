## Why

初めて使うユーザーがアプリの目的を即座に理解し、スムーズに試せるよう、favicon とユーザーガイドを整備する。現状は Vite のデフォルト favicon のままで、システム IME の干渉やキーバインドの差異についての案内もない。

## What Changes

- **favicon**: `public/favicon.svg` を新規作成（「あ」白文字＋背景 #1565c0 の青丸、明朝体）。`index.html` のアイコン参照を差し替える。
- **IME 注意書き**: キーガイド付近に「Microsoft IME・Google 日本語入力・Fcitx などシステムの日本語入力をオフにしてください」という一行を追加する。
- **Ctrl+J 補足**: キーガイドの Ctrl+J 行に「Chrome など一部ブラウザでは Shift+Ctrl+J が有効」という注記を追加する。

## Capabilities

### New Capabilities

- `favicon`: ブラウザタブ・ブックマークに表示されるアイコン（SVG）
- `usage-notes`: IME オフの案内と Ctrl+J 代替キーの案内をキーガイド付近に表示する機能

### Modified Capabilities

（なし）

## Impact

- `public/favicon.svg`: 新規追加
- `index.html`: favicon リンク差し替え
- `src/components/KeyGuide.tsx`: IME 注意書き追加・Ctrl+J 行の description 更新
