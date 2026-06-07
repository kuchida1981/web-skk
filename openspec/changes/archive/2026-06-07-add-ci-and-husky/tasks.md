## 1. Husky のセットアップ

- [x] 1.1 `npm install --save-dev husky` で husky を devDependencies に追加する
- [x] 1.2 `package.json` の `scripts` に `"prepare": "husky"` を追加する
- [x] 1.3 `npx husky init` で `.husky/pre-commit` を生成する
- [x] 1.4 `.husky/pre-commit` の内容を `npm run lint && npm run test -- --run` に書き換える

## 2. GitHub Actions ワークフローの作成

- [x] 2.1 `.github/workflows/` ディレクトリを作成する
- [x] 2.2 `.github/workflows/ci.yml` を作成する（トリガー: `on: pull_request`）
- [x] 2.3 Job 1（`test`）: `npm ci` → `npm run lint` → `npm run test -- --run` を定義する
- [x] 2.4 Job 2（`e2e`）: `npm ci` → `npx playwright install --with-deps chromium` → `npm run test:e2e` を定義する

## 3. 動作確認

- [x] 3.1 `npm run lint` と `npm run test -- --run` がローカルで正常に通ることを確認する
- [x] 3.2 `.husky/pre-commit` フックが実行可能権限（`chmod +x`）を持つことを確認する
- [x] 3.3 テスト用ブランチを作成してPRを開き、GitHub Actions が起動することを確認する
