### Requirement: Vite base path configuration
ビルド時のアセットパスが `/web-skk/` を起点とするよう、`vite.config.ts` に `base: '/web-skk/'` を設定しなければならない（SHALL）。

#### Scenario: Production build のアセットパスが正しい
- **WHEN** `npm run build` を実行したとき
- **THEN** `dist/index.html` 内のアセット参照が `/web-skk/assets/...` 形式になっていること

#### Scenario: ローカル dev サーバーが引き続き動作する
- **WHEN** `npm run dev` を実行したとき
- **THEN** `http://localhost:5173/` でアプリが正常に表示されること

### Requirement: GitHub Actions deploy workflow
GitHub Release が公開されたタイミングで自動的に GitHub Pages へデプロイするワークフローが存在しなければならない（SHALL）。ファイルは `.github/workflows/deploy.yml` に配置する。

#### Scenario: Release 公開でデプロイがトリガーされる
- **WHEN** GitHub 上で Release を published 状態にしたとき
- **THEN** GitHub Actions ワークフローが自動起動すること

#### Scenario: ビルドが成功しデプロイされる
- **WHEN** ワークフローが起動したとき
- **THEN** `npm ci` → `npm run build` → `dist/` を GitHub Pages へアップロード → デプロイの順で実行されること

#### Scenario: デプロイ後にサイトへアクセスできる
- **WHEN** デプロイが完了したとき
- **THEN** `https://kuchida1981.github.io/web-skk/` でアプリが正常に動作すること
