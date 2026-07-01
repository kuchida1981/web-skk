---
name: agy-delegate
description: Use this skill whenever delegating implementation, test, or fix work to agy (Antigravity CLI) — immediately before every MCP agy_ask/agy_continue call or Bash `agy --print` invocation. Covers MCP vs Bash method selection, timeout sizing, hang-prevention rules, the [QUESTION] dialogue loop, and failure recovery. Trigger this any time you've decided (per openspec/specs/agy-delegation-criteria) that a task should go to agy.
---

# agy への実装委譲プロトコル

実装をそもそも agy に委譲するかどうかの判定基準は `openspec/specs/agy-delegation-criteria/spec.md` を参照。委譲すると決めたら、以下の手順に従う。

## 方式の選択

| 方式 | 条件 | 利点 |
|------|------|------|
| MCP（推奨） | `mcp__agy__agy_ask` 系ツールが利用可能 | stdout バグ回避、会話継続が自然、タイムアウト問題が少ない |
| Bash（フォールバック） | MCP未セットアップの環境 | セットアップ不要、どの環境でも動く |

セッション開始時に MCP の agy ツールが呼べるか確認し、利用可能なら MCP 方式を使う。利用できなければ Bash 方式にフォールバックする。

## MCP 方式（推奨）

```
mcp__agy__agy_ask(prompt="<実装プロンプト>", workspace="<プロジェクトルート>")
```

- 新規タスク: `agy_ask`
- 追加指示・継続: `agy_continue`
- 診断（クォータ消費なし）: `agy_status`

## Bash 方式（フォールバック）

```bash
GIT_TERMINAL_PROMPT=0 CI=true \
  agy --dangerously-skip-permissions --print-timeout 3m --print "<実装プロンプト>" 2>&1
```

| タスク規模 | ファイル数 | タイムアウト |
|-----------|-----------|------------|
| 小 | 1-2 | `--print-timeout 3m` |
| 中 | 3-5 | `--print-timeout 5m` |
| 大 | 6+ | `--print-timeout 8m`（さらなる分割を検討） |

`CI=true` の副作用でツールの動作が変わった場合は、当該環境変数を除外し、プロンプト内ルールのみでハング予防する。

## 共通ルール（MCP・Bash 両方式共通）

**タスク単位の分割呼び出し**: 一括委譲ではなく、tasks.md の各タスクを個別の agy ワンショットで実行する。十分に小さいタスク（1ファイルの小変更）はまとめてよい。各タスク完了後に `git status` / `git diff` で結果を確認してから次のタスクに進む。

**プロンプトに含める内容**:
- 実装対象ファイルと変更内容（具体的に）
- 既存コードのパターン（コピーすべき書き方）
- スコープ外の制約（「この2ファイルだけ触れ」など）
- OpenSpec の change ディレクトリへの参照（`openspec/changes/<name>/` 以下）
- 実装完了後に `git add <実装ファイル> && git commit -m "feat: <変更内容>"` でコミットすること
- 不明点・判断に迷う点がある場合は実装せず、`[QUESTION] ...` の形式で質問を出力すること
- 下記の「必須のハング予防ルール」

## 必須のハング予防ルール（すべてのプロンプトに含める）

```
制約:
- 対話的入力（y/n, パスワード等）を求めるコマンドは絶対に実行しないこと
- 必ず非対話フラグ（--yes, -y, --no-input 等）を付けること
- git push, npm publish など外部サービスへの送信は行わないこと
- 対話的入力が必要な状況に遭遇したら、実行せず [QUESTION] で報告すること
- git add は指定ファイルのみ。`git add -A` や `git add .` は禁止
```

## 対話ループ（[QUESTION] 対応）

agy の出力に `[QUESTION]` が含まれる場合:

1. 質問ごとに回答主体を判定する
   - **Claude Code が自分で回答してよい**: 既存コードのパターン・コンベンション、API の型やインターフェース、ファイル構成やインポートパス、OpenSpec の design.md / specs から読み取れる仕様
   - **ユーザーに確認すべき**: ビジネスロジックの仕様判断、破壊的変更や後方互換性に関わる判断、セキュリティ・認証に関わる設計判断、複数の妥当な選択肢がありトレードオフが明確でない場合
2. 回答を追加コンテキストとして渡し、agy を再実行する（MCP: `agy_continue` / Bash: 新規 `--print` 呼び出しに回答を含める）
3. **ループの上限は3回**。3回で解決しない場合は Claude Code が直接実装に切り替える

## agy 失敗時のリカバリ

```
失敗発生
  ↓
git status / git diff で途中成果を確認
  ├─ 成果あり → 継続指示を送る（MCP: agy_continue / Bash: --continue）
  └─ 成果なし → 新規セッションで別アプローチを試行
      ↓
再試行も失敗（2回連続）
  ↓
Claude Code が直接実装に切り替える
```

Bash 方式の場合、`--print-timeout` が効かないケースがある。Bash ツールの `timeout` パラメータも併用し、agy プロセスが応答しない場合は `kill` して対処する。

---

**プロトコル変更時の運用ルール**: この手順（タイムアウト値、対話ループの上限回数、リカバリ手順等）を変更する場合は、先に対応する spec（`openspec/specs/agy-invocation-protocol`、`openspec/specs/agy-delegation-criteria`）を OpenSpec change として更新し、その後このスキルに反映すること。
