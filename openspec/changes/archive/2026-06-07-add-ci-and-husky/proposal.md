## Why

現状、テストやlintを手動で実行する仕組みしかなく、品質チェックが開発者の裁量に依存している。CI（GitHub Actions）とpre-commitフック（Husky）を導入することで、PRマージ前の品質保証と、コミット時のローカル品質ゲートを自動化する。

## What Changes

- GitHub Actions ワークフローを追加し、PR時に自動でlint・ユニットテスト・E2Eテストを実行する
- Huskyを導入し、`git commit`時にlintとユニットテストをpre-commitフックとして実行する
- `package.json` に `prepare` スクリプト（husky初期化用）を追加する

## Capabilities

### New Capabilities

- `github-actions-ci`: PR時にlint+unit test（Job 1）とE2E test（Job 2）を並列実行するGitHub Actionsワークフロー
- `husky-pre-commit`: git commit時にlintとunit testを実行するpre-commitフック

### Modified Capabilities

（なし）

## Impact

- `.github/workflows/ci.yml`（新規作成）
- `.husky/pre-commit`（新規作成）
- `package.json`（`devDependencies` に `husky` 追加、`prepare` スクリプト追加）
- 既存コードへの変更なし
