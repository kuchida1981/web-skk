## Why

SKKは独特な操作感を持つ日本語入力方式だが、体験するにはOSレベルのIMEインストールが必要で、試しにくい。ブラウザ上でSKKを体験できる場所を作ることで、SKKへの入門障壁を下げる。

## What Changes

- ブラウザ上でSKK入力方式によるフリー入力を体験できるWebアプリを新規構築する
- SKKエンジンをTypeScriptで自前実装する（ブラウザ向け成熟ライブラリが存在しないため）
- SKK-JISYO.L（大辞書）をIndexedDBにキャッシュして使用する
- モード表示・候補ポップアップ・キーガイドを備えたUIを提供する

## Capabilities

### New Capabilities

- `skk-engine`: キー入力を受け取りSKKの状態遷移を処理する純粋TypeScriptエンジン。ひらがな/カタカナ/ASCII/全角ASCIIモード、▽/▼変換フロー、送り仮名をサポートする
- `skk-dictionary`: SKK-JISYO.L形式の辞書を読み込み・検索するレイヤー。IndexedDBによるキャッシュ機能を含む
- `skk-input-ui`: SKKエンジンと辞書を組み合わせたReactベースの入力UI。入力欄・モード表示・候補ポップアップ・キーガイドを提供する

### Modified Capabilities

## Impact

- 新規プロジェクト構築（既存コードへの影響なし）
- 依存: React, TypeScript, Vite, Vitest, Playwright
- 外部データ: SKK-JISYO.L（~4MB、初回ロード時にfetchしてIndexedDBにキャッシュ）
