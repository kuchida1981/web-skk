## ADDED Requirements

### Requirement: 実装主体のデフォルト判定
システムは、OpenSpec change の tasks.md の各タスクについて、実装主体を agy をデフォルトとして判定しなければならない（MUST）。判定はタスク単位で行い、change 全体では判定しない。

#### Scenario: 標準的なタスクの委譲
- **WHEN** tasks.md の各タスクが、既存コードにパターンがある実装、既存コンポーネントへの機能追加、既存パターンの横展開、依存追加・設定変更・クリーンアップ、または既存テストパターンを参考にできるテスト追加のいずれかに該当する
- **THEN** Claude Code はそのタスクを agy に委譲する

### Requirement: Claude Code が直接実装する条件
システムは、以下のいずれかに該当するタスクを Claude Code が直接実装しなければならない（MUST）と規定する。

#### Scenario: 前例のない新規パターンの導入
- **WHEN** タスクがコードベースに前例のない新規アーキテクチャパターンの導入、または複数コンポーネント間の複雑な状態フローの設計と実装を必要とする
- **THEN** Claude Code は agy に委譲せず自ら実装する

#### Scenario: プロンプトで文脈を伝えきれない場合
- **WHEN** タスクの文脈をプロンプトで agy に十分に伝えきれないと Claude Code が判断した
- **THEN** Claude Code は自ら実装する

#### Scenario: agy の連続失敗
- **WHEN** agy による実装が2回連続で失敗した
- **THEN** Claude Code は直接実装に切り替える
