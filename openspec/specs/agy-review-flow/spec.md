# Capability: agy-review-flow

## Purpose

agy による実装完了後のレビューフローを定義する。実装セッションとは別のセッションでレビューと変更要約を生成し、Claude Code の最終レビュー効率を向上させる。

## Requirements

### Requirement: 別セッションレビュー
実装完了後、実装セッションとは別の新規 agy セッションでコードレビューを実行しなければならない（MUST）。

#### Scenario: 別セッションでのレビュー実行
- **WHEN** agy による実装タスクがすべて完了し、コミット済みである
- **THEN** Claude Code は新規の agy セッション（`--continue` なし）で diff を渡し、レビューを依頼する

#### Scenario: レビュー結果の活用
- **WHEN** agy がレビュー結果を出力した
- **THEN** Claude Code はレビュー結果を読み、重要な指摘を判断した上で最終レビュー（`/code-review` またはインラインレビュー）を行う

### Requirement: 変更要約の生成
agy のレビューセッションでは、diff のレビューに加えて変更要約を生成しなければならない（MUST）。

#### Scenario: 変更要約の内容
- **WHEN** Claude Code が agy にレビューを依頼する
- **THEN** agy は以下のセクションを含む変更要約を出力する:
  - 変更ファイル一覧と各ファイルの変更概要
  - 潜在的な問題点（最大 10 個）
  - 設計上の判断や懸念点
  - テストの充足度評価

#### Scenario: Claude Code の最終レビュー
- **WHEN** Claude Code が agy の変更要約を受け取った
- **THEN** Claude Code は要約をベースに最終判断を行い、必要な箇所のみ diff を直接確認する

### Requirement: レビューフローの省略可能性
システムは変更が十分に小さい場合に agy レビューステップを省略できなければならない（SHALL）。

#### Scenario: 小さな変更のレビュー省略
- **WHEN** 変更が 1 ファイル・20 行以下の修正である
- **THEN** Claude Code の判断で agy レビューを省略し、直接 `/code-review` を行ってよい
