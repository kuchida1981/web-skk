## ADDED Requirements

### Requirement: 対話ループによる質問対応
agy の出力に `[QUESTION]` が含まれる場合、Claude Code は質問ごとに回答主体を判定し、回答を追加コンテキストとして agy に渡して再実行しなければならない（MUST）。この対話ループは最大3回までとする。

#### Scenario: 質問への回答と再実行
- **WHEN** agy の出力に `[QUESTION]` が含まれる
- **THEN** Claude Code は質問ごとに回答主体を判定し、回答を追加コンテキストとして agy を再実行する（MCP: `mcp__agy__agy_continue`、Bash: 新規 `--print` 呼び出しに回答を含める）

#### Scenario: 対話ループの上限到達
- **WHEN** 対話ループが3回実行されても `[QUESTION]` が解消しない
- **THEN** Claude Code は agy への委譲を打ち切り、直接実装に切り替える

### Requirement: 質問の回答主体の判定基準
Claude Code は agy が出力した質問について、自ら回答できるか、ユーザーに確認すべきかを判定しなければならない（MUST）。

#### Scenario: Claude Code が自己解決できる質問
- **WHEN** 質問が既存コードのパターン・コンベンション、API の型やインターフェース、ファイル構成やインポートパス、または OpenSpec の design.md / specs から読み取れる仕様に関するものである
- **THEN** Claude Code は自らの判断で回答をまとめ、ユーザーに確認せず対話ループを継続する

#### Scenario: ユーザー確認が必要な質問
- **WHEN** 質問がビジネスロジックの仕様判断、破壊的変更や後方互換性に関わる判断、セキュリティ・認証に関わる設計判断、または複数の妥当な選択肢がありトレードオフが明確でない場合である
- **THEN** Claude Code はユーザーに確認してから対話ループを継続する
