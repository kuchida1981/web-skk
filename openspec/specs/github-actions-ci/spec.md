# Spec: github-actions-ci

## Purpose

GitHub Actions CI workflow that runs lint, unit tests, and E2E tests on every pull request.

## Requirements

### Requirement: PR時にlintとユニットテストを実行する
CI SHALL run `npm run lint` followed by `npm run test -- --run` on every pull_request event using Node.js 20 and npm cache.

#### Scenario: lintエラーがある場合
- **WHEN** PRにlintエラーを含むコードが含まれる
- **THEN** Job 1 が失敗し、PRのステータスチェックが fail になる

#### Scenario: ユニットテストが失敗する場合
- **WHEN** PRにユニットテストが失敗するコードが含まれる
- **THEN** Job 1 が失敗し、PRのステータスチェックが fail になる

#### Scenario: lint・ユニットテストがすべて通る場合
- **WHEN** lintエラーもユニットテスト失敗もない
- **THEN** Job 1 が成功する

### Requirement: PR時にE2Eテストを実行する
CI SHALL install Playwright Chromium dependencies and run `npm run test:e2e` on every pull_request event, parallel to the lint+unit job.

#### Scenario: E2Eテストが失敗する場合
- **WHEN** PRにE2Eテストが失敗するコードが含まれる
- **THEN** Job 2 が失敗し、PRのステータスチェックが fail になる

#### Scenario: E2Eテストがすべて通る場合
- **WHEN** E2Eテストがすべて成功する
- **THEN** Job 2 が成功する

### Requirement: CIはpull_requestイベントのみで起動する
The workflow SHALL be triggered exclusively by `pull_request` events and SHALL NOT run on direct pushes to any branch.

#### Scenario: mainブランチへの直接push
- **WHEN** mainブランチに直接 push される
- **THEN** CI ワークフローは起動しない
