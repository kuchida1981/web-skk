# Spec: husky-pre-commit

## Purpose

Husky pre-commit hook that automatically runs lint and unit tests before every git commit.

## Requirements

### Requirement: コミット時にlintとユニットテストを自動実行する
The pre-commit hook SHALL run `npm run lint && npm run test -- --run` before every `git commit`.

#### Scenario: lintエラーがある場合
- **WHEN** ステージされたコードにlintエラーが含まれる
- **THEN** コミットがブロックされ、エラーメッセージが表示される

#### Scenario: ユニットテストが失敗する場合
- **WHEN** ユニットテストが1つ以上失敗する
- **THEN** コミットがブロックされる

#### Scenario: lint・ユニットテストがすべて通る場合
- **WHEN** lintエラーもテスト失敗もない
- **THEN** コミットが正常に完了する

### Requirement: `npm install` 後にHuskyが自動初期化される
The `prepare` script in `package.json` SHALL invoke `husky` so that hooks are installed automatically after `npm install`.

#### Scenario: 新規クローン後の npm install
- **WHEN** 開発者がリポジトリをクローンして `npm install` を実行する
- **THEN** `.husky/pre-commit` フックが自動的に有効化される
