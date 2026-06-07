## 1. Vite 設定の変更

- [ ] 1.1 `vite.config.ts` に `base: '/web-skk/'` を追加する

## 2. GitHub Actions ワークフローの作成

- [ ] 2.1 `.github/workflows/` ディレクトリを作成する
- [ ] 2.2 `.github/workflows/deploy.yml` を作成する（トリガー: `release: types: [published]`、build + deploy の2ジョブ構成、`permissions: pages: write, id-token: write`）

## 3. 動作確認（ユーザー手動）

- [ ] 3.1 GitHub リポジトリの Settings → Pages → Source を「GitHub Actions」に変更する
- [ ] 3.2 GitHub で Release を作成・公開し、Actions が正常に実行されることを確認する
- [ ] 3.3 `https://kuchida1981.github.io/web-skk/` でアプリが正常に動作することを確認する
