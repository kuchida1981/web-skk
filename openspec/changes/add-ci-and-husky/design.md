## Context

web-skk は Vite + React + TypeScript のフロントエンドアプリケーション。テストは Vitest（ユニット）と Playwright（E2E）の2種類が存在する。現状、テスト・lintの実行は開発者の手動操作に依存しており、品質チェックの自動化が必要。

## Goals / Non-Goals

**Goals:**
- PR時に GitHub Actions でlint・ユニットテスト・E2Eテストを自動実行する
- `git commit`時に Husky で lint・ユニットテストを自動実行してコミットをブロックする

**Non-Goals:**
- `main` ブランチへの push時のCI（PRのみ対象）
- E2EテストのHuskyへの組み込み（起動コストが高いため除外）
- lint-staged による差分ファイルのみのテスト（全テスト実行で十分）
- デプロイや成果物の配布

## Decisions

### Job 分割: 2 jobs（lint+unit / e2e）

lint と unit test は Node.js のみで高速に完了するため1つのjobにまとめる。E2Eはブラウザのインストールが必要なため別jobとし、並列実行する。

**代替案**: 3 jobs（lint / unit / e2e）→ セットアップのオーバーヘッドが増えるため却下。

### Node.js バージョン: 20

LTS バージョンの 20 を使用。プロジェクトの `.nvmrc` や `engines` フィールドが存在しないため、安定版の 20 を選択。

### E2E ブラウザ: Chromium のみ

`playwright.config.ts` の `projects` が Chromium のみを定義しているため、それに合わせる。

### Huskyの初期化: `prepare` スクリプト

`npm ci` 後に自動で `husky` が初期化されるよう、`package.json` の `prepare` スクリプトに `husky` を追加する。CI環境では `npm ci --ignore-scripts` を使うことで Husky の実行を抑制する。

## Risks / Trade-offs

- [pre-commit が遅い] → 現状のテスト数なら数秒で完了する想定。テストが大幅に増えた場合は lint-staged の導入を検討する
- [CI 環境での Husky 起動] → `npm ci --ignore-scripts` または `CI=true` 環境変数で抑制できる。GitHub Actions ではデフォルトで `CI=true` が設定されているため、husky のインストール自体は `prepare` で問題ない（実行はされない）
