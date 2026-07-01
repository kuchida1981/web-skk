# Capability: agy-invocation-protocol

## Purpose

agy（Antigravity CLI）を Claude Code から呼び出す際のプロトコルを定義する。タイムアウト制御、ハング予防、タスク分割、リカバリの各ルールを規定し、安定した自動実装を実現する。
## Requirements
### Requirement: タイムアウト付き呼び出し
Claude Code から agy を呼び出す際、`--print-timeout` を必ず指定しなければならない（MUST）。デフォルト値は `3m` とし、タスクの規模に応じて調整する。

#### Scenario: 標準的なタスク実行
- **WHEN** Claude Code がタスク単位で agy に実装を委譲する
- **THEN** `agy --dangerously-skip-permissions --print-timeout 3m --print "<プロンプト>" 2>&1` の形式で呼び出す

#### Scenario: 大きなタスクの実行
- **WHEN** 対象タスクが 6 ファイル以上に及ぶ
- **THEN** `--print-timeout` を最大 `8m` まで延長するか、タスクをさらに分割する

### Requirement: ハング予防の環境変数
agy 呼び出し時に、対話的プロンプトを抑制する環境変数を設定しなければならない（MUST）。

#### Scenario: 環境変数付き呼び出し
- **WHEN** Claude Code が agy を呼び出す
- **THEN** `GIT_TERMINAL_PROMPT=0` と `CI=true` を環境変数として付与する

#### Scenario: 環境変数の副作用発生
- **WHEN** `CI=true` によりツールの動作が意図せず変わった場合
- **THEN** 当該環境変数を除外し、プロンプト内のルールのみでハング予防する

### Requirement: プロンプト内のハング予防ルール
agy へのすべてのプロンプトに、対話的入力を禁止するルールを含めなければならない（MUST）。

#### Scenario: ハング予防ルールの適用
- **WHEN** Claude Code が agy へのプロンプトを構成する
- **THEN** 以下のルールをプロンプトに含める:
  - 対話的入力（y/n、パスワード等）を求めるコマンドは実行しない
  - 非対話フラグ（--yes, -y, --no-input 等）を必ず付ける
  - git push, npm publish など外部サービスへの送信は行わない
  - 対話的入力が必要な場合は [QUESTION] で報告する

### Requirement: タスク単位の分割呼び出し
OpenSpec tasks.md の各タスクを個別の agy ワンショットで実行しなければならない（MUST）。ただし、十分に小さいタスクは結合してよい（MAY）。

#### Scenario: 複数タスクの順次実行
- **WHEN** tasks.md に Task-1, Task-2, Task-3 がある
- **THEN** Claude Code は各タスクを個別の agy 呼び出しで実行し、各完了後に `git status` / `git diff` で結果を確認する

#### Scenario: 小タスクの結合
- **WHEN** 連続するタスクがいずれも 1 ファイルの小変更である
- **THEN** Claude Code の判断でこれらを 1 回の agy 呼び出しにまとめてよい

### Requirement: タイムアウト時のリカバリ
agy がタイムアウトした場合、`--continue` による再開を試みなければならない（MUST）。再開が 2 回失敗したら Claude Code が直接実装に切り替える。

#### Scenario: タイムアウト後の再開
- **WHEN** agy の実行が `--print-timeout` で中断された
- **THEN** Claude Code は `git status` で途中成果を確認し、`agy --continue --print "<再開指示>"` で同じ会話を再開する

#### Scenario: 再開の連続失敗
- **WHEN** `--continue` による再開が 2 回連続で失敗（タイムアウトまたはエラー）した
- **THEN** Claude Code が直接実装に切り替える

#### Scenario: 途中成果がない場合
- **WHEN** タイムアウト後に `git status` で変更が確認できない
- **THEN** 新規セッション（`--continue` なし）で別アプローチを試みる

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

