## Why

web-skk を GitHub Pages で公開し、インストール不要でブラウザからアクセスできるようにしたい。現状はローカルビルドが必要で、外部からの利用・共有が困難。

## What Changes

- `vite.config.ts` に `base: '/web-skk/'` を追加（サブパスへのデプロイ対応）
- `.github/workflows/deploy.yml` を新規作成（GitHub Release 公開時に自動デプロイ）

## Capabilities

### New Capabilities

- `github-pages-deployment`: GitHub Actions を使い、GitHub Release 公開をトリガーとして GitHub Pages へ自動デプロイする機能

### Modified Capabilities

（なし）

## Impact

- `vite.config.ts`: `base` オプション追加（ビルド出力のアセットパスが変わる）
- `.github/workflows/deploy.yml`: 新規ファイル
- 公開 URL: `https://kuchida1981.github.io/web-skk/`
- カスタムドメイン対応はスコープ外
