## Context

web-skk は React + Vite で構成された SPA。GitHub リポジトリ `kuchida1981/web-skk` は public で、GitHub Pages の無料枠が使用可能。デプロイ先 URL は `https://kuchida1981.github.io/web-skk/`（サブパス）。

## Goals / Non-Goals

**Goals:**
- GitHub Release を公開したときに自動で GitHub Pages へデプロイされること
- `https://kuchida1981.github.io/web-skk/` でアプリが正常動作すること

**Non-Goals:**
- カスタムドメインの設定
- ステージング環境の用意
- Draft Release でのプレビュー

## Decisions

### 1. Vite の `base` オプションを `/web-skk/` に設定する

GitHub Pages でのサブパスデプロイでは、ビルドされた JS/CSS のパスが `/assets/...` のようにルートからの絶対パスになるとロードに失敗する。`base: '/web-skk/'` を設定することでアセットパスが `/web-skk/assets/...` に変わり、正常にロードされる。

### 2. デプロイトリガーを `release: types: [published]` にする

- `push` トリガーにすると開発中のコミットがすべて公開されてしまう
- `release: types: [published]` にすることで Draft から公開に変えたタイミングでのみ発火し、意図したバージョンだけがデプロイされる

### 3. GitHub Actions 公式の Pages デプロイアクションを使う（`actions/deploy-pages`）

`peaceiris/actions-gh-pages`（gh-pages ブランチに push するアプローチ）より、GitHub 公式の `actions/upload-pages-artifact` + `actions/deploy-pages` の組み合わせを採用する。

**理由:**
- gh-pages ブランチという余分なブランチを管理しなくてよい
- リポジトリの Pages 設定で「Source: GitHub Actions」を選ぶだけで完結
- GitHub による公式サポートで長期メンテナンスが期待できる

**必要な Workflow 構成:**
```
jobs:
  build:
    - actions/checkout
    - actions/setup-node
    - npm ci && npm run build
    - actions/upload-pages-artifact (dist/ をアップロード)

  deploy:
    needs: build
    - actions/deploy-pages
```

`permissions` として `pages: write` と `id-token: write` が必要（公式アクションの要件）。

## Risks / Trade-offs

- [リスク] `base` の変更により、ローカル開発時（`npm run dev`）に影響が出る可能性
  → Vite は `dev` 時に `base` を考慮してサーブするため影響なし

- [リスク] リポジトリの Pages 設定が「GitHub Actions」になっていないとデプロイが失敗する
  → 初回デプロイ前にリポジトリ側の設定が必要（Settings → Pages → Source: GitHub Actions）。これはユーザーが手動で行う必要がある。
