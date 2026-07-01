## Why

CLAUDE.md は毎セッション全文がコンテキストに読み込まれるが、260行のうち半分近く（agy 呼び出しプロトコルの詳細）は agy に実装を委譲する瞬間にしか使わない手続き情報であり、常時ロードする必要がない。さらにその内容は `openspec/specs/agy-invocation-protocol` と `openspec/specs/agy-review-flow` にも重複して存在しており、二重管理によるドリフトのリスクがある。加えて、CLAUDE.md には対話ループ・質問時の判断基準・役割分担の難易度判定など、どの spec にも記載されていないルールが存在し、OpenSpec の change プロセスで管理できていない。

## What Changes

- agy 呼び出しの詳細手順（MCP/Bash方式選択、共通ルール、対話ループ、失敗リカバリ、委譲判断基準）を新規プロジェクトスキル `.claude/skills/agy-delegate/SKILL.md` に集約し、実際に agy へ委譲する瞬間にのみ読み込まれるようにする。
- CLAUDE.md から上記の詳細手順を削除し、役割分担表・ワークフロー概要・恒久的なポリシー（ドキュメント更新原則、CI/pre-commitルール、チートシート、ブランチ命名）のみを残す形にスリム化する。
- 既存 spec `agy-invocation-protocol` に、これまで CLAUDE.md にのみ存在していた「対話ループ（`[QUESTION]` 対応、再試行上限3回）」と「質問の判断基準（Claude Code が自己解決できるか、ユーザー確認が必要か）」の Requirement を追加する。
- 新規 capability `agy-delegation-criteria` を追加し、agy デフォルト方針と Claude Code が自ら実装すべき条件（役割分担・難易度判定）を正式な spec として定義する。
- spec とスキルの内容が将来ドリフトしないよう、spec 変更時にはスキルへの反映も行うことをスキル本文と CLAUDE.md に明記する運用ルールを設ける。

## Capabilities

### New Capabilities
- `agy-delegation-criteria`: agy と Claude Code の間でどちらが実装を担当するかを判定する基準（デフォルトは agy、前例のない新規パターンや agy 連続失敗時は Claude Code）を定義する。

### Modified Capabilities
- `agy-invocation-protocol`: agy 呼び出し中の対話ループ（`[QUESTION]` 発生時の質問ごとの判定、再試行上限3回）と、質問をどちらが判断するか（Claude Code 自己解決 vs ユーザー確認）の Requirement を追加する。

## Impact

- `/Users/kosuke/projects/web-skk/CLAUDE.md`: agy 呼び出し詳細（現在の32〜158行相当）を削除し、スキルへのポインタと圧縮したワークフロー概要に置き換える。
- `/Users/kosuke/projects/web-skk/.claude/skills/agy-delegate/SKILL.md`: 新規作成。agy 呼び出しの実務手順を集約する。
- `/Users/kosuke/projects/web-skk/openspec/specs/agy-invocation-protocol/spec.md`: Requirement 追加（delta spec 経由）。
- `/Users/kosuke/projects/web-skk/openspec/specs/agy-delegation-criteria/spec.md`: 新規作成（delta spec 経由）。
- 既存の `agy-review-flow` capability には変更なし。
