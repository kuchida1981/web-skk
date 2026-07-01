## Context

CLAUDE.md（260行）は Claude Code のセッション開始時に常時全文がコンテキストへ読み込まれる。一方、`.claude/skills/*/SKILL.md` はスキル一覧に description のみが常時表示され、本文は明示的に invoke されたときだけ読み込まれる。CLAUDE.md の内容のうち agy 呼び出しプロトコル（32〜158行、約127行）は「agy に実装を委譲する瞬間」にしか使わない手続き情報であり、常時ロードのコストに見合わない。

さらに、`openspec/specs/agy-invocation-protocol/spec.md` と `openspec/specs/agy-review-flow/spec.md` に、CLAUDE.md と重複する内容が既に存在している。CI（`.github/workflows/check-openspec.yml`）は `npx openspec validate --strict --all` を実行しており、`@fission-ai/openspec` の `RequirementSchema` は各 Requirement のテキストに `MUST`/`SHALL` を含むこと、各 Requirement に最低1つの Scenario を持つことを強制する（`base.schema.js`）。そのため spec.md の記述を簡潔なプレーン文体に書き換えることはできず、Requirement/Scenario 形式を維持する必要がある。

このプロジェクトは agy-invocation-protocol・agy-review-flow のように、製品仕様だけでなく「開発プロセスのルール」も OpenSpec の capability として管理する方針を既に採っている。今回もこの方針を継続し、CLAUDE.md にしか存在しない口伝ルール（対話ループ、質問の判断基準、役割分担・難易度判定）を spec 化する。

## Goals / Non-Goals

**Goals:**
- CLAUDE.md を、常時参照する必要があるポリシー・概要情報のみに圧縮する（目安: 260行 → 90〜110行）。
- agy 呼び出しの実務手順を、invoke 時にのみ読み込まれる `.claude/skills/agy-delegate/SKILL.md` に集約する。
- CLAUDE.md にしか存在しなかった対話ループ・質問の判断基準・役割分担の難易度判定を、CI で検証される正式な spec として記録する。
- spec（正式仕様） と skill（実行時の運用手順） の二重管理によるドリフトを、運用ルールの明記によって抑制する。

**Non-Goals:**
- `openspec validate` のスキーマ自体（Requirement に MUST/SHALL を必須とする等）を変更すること。
- agy 呼び出しプロトコルの中身（タイムアウト値、環境変数等）を今回の変更で見直すこと。既存ルールを保存先を変えて再配置するのみで、ルールの内容自体は変えない。
- `agy-review-flow` capability の変更。今回のスコープは `agy-invocation-protocol` の拡張と `agy-delegation-criteria` の新設のみ。

## Decisions

### 1. spec を正式仕様、skill を実行時の運用手順として役割分担する

spec.md は CI で validate される「正式な記録」とし、内容の変更は必ず OpenSpec change（propose → apply → archive）を経由する。skill (`agy-delegate/SKILL.md`) は spec と一言一句同じである必要はなく、実行時に読みやすい簡潔な命令形で書く「運用手順の要約」とする。

代替案として「skill が spec ファイルを都度 Read する」という完全な単一ソース化も検討したが、Requirement/Scenario 形式は説明文（"WHEN/THEN"の構造、MUST/SHALL の定型文）を含むため invoke 時の読み込みコストが増え、かつ spec は複数ファイルに分かれる（agy-invocation-protocol + agy-delegation-criteria）ため呼び出しのたびに2ファイル読む必要が生じる。実行時コストを優先し、要約版を skill 本文に持たせる方式を採用する。

### 2. ドリフト防止は仕組みではなく運用ルールで担保する

spec と skill の内容的な同期を機械的に強制する仕組み（ビルドスクリプト等）は導入しない。代わりに、CLAUDE.md の1文と `agy-delegate/SKILL.md` の末尾に「このプロトコルを変更する場合は、先に対応する spec を OpenSpec change として更新し、その後このスキルに反映すること」という運用ルールを明記する。将来 tasks.md 側でこのルールを機械的にチェックする仕組みが必要になれば、別途 change を起こす。

### 3. capability の境界: `agy-invocation-protocol`拡張 vs `agy-delegation-criteria`新設

「対話ループ」「質問の判断基準」は agy 呼び出し**中**の振る舞いであり、既存 `agy-invocation-protocol` の Purpose（呼び出しプロトコルの定義）にそのまま収まるため、この spec に Requirement を追加する。「役割分担・難易度判定」は agy を呼び出す**前**の意思決定（そもそも委譲するか）であり、責務が異なるため新規 capability `agy-delegation-criteria` として切り出す。

## Risks / Trade-offs

- [Risk] spec 更新時に skill への反映を忘れ、内容が乖離する → [Mitigation] CLAUDE.md と skill 本文の両方に明記した運用ルールで注意喚起する。将来的な乖離が頻発するようであれば、CI での整合性チェック導入を別途検討する。
- [Risk] skill の description のトリガー文言が弱いと、Claude Code が agy 委譲の瞬間に skill を invoke し忘れる → [Mitigation] description に強いトリガー文（「agy への実装委譲前に必ず使用する」等）を明記し、CLAUDE.md 側にも「agy に委譲する際は必ず `agy-delegate` skill を使う」という1文を残す。
- [Risk] 既存 spec の Requirement 追加により `openspec validate --strict --all` が失敗する可能性 → [Mitigation] 追加する Requirement 文にも必ず MUST/SHALL と Scenario を含める。
