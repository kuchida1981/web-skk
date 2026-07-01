# CLAUDE.md — web-skk プロジェクト

## AI ツール役割分担

このプロジェクトでは Claude Code と Antigravity CLI (agy) を役割に応じて使い分ける。

| フェーズ | ツール | 理由 |
|---------|--------|------|
| 設計・調査・探索 | **Claude Code** | 設計能力・コードベース理解が高い |
| 実装 | **Antigravity CLI** (`agy`) | Gemini クレジットを活用、Claude クレジットを節約 |
| コードレビュー・PR作成 | **Claude Code** | `/code-review` スキルを使う |
| レビュー指摘の修正 | **Antigravity CLI** (`agy`) | 実装担当が修正。Claude Code は修正内容を指示するのみ |

### 難易度の目安（タスク単位で判定）

判定は change 全体ではなく tasks.md の各タスク単位で行う。agy をデフォルトとし、前例のない新規アーキテクチャパターン・複雑な状態フロー設計・プロンプトで文脈を伝えきれない場合・agy 2回連続失敗時のみ Claude Code が実装する。詳細な判定基準は `openspec/specs/agy-delegation-criteria/spec.md` を参照。

### agy への実装委譲

agy に実装を委譲すると判断したら、必ず **`agy-delegate` skill を invoke** すること（MCP/Bash方式選択、タイムアウト値、ハング予防ルール、`[QUESTION]` 対話ループ、失敗リカバリの詳細手順を集約している）。プロトコル自体（タイムアウト値、対話ループの上限回数等）を変更する場合は、先に `openspec/specs/agy-invocation-protocol` を OpenSpec change として更新し、その後 skill に反映する。

---

## 開発ワークフロー

### 機能追加・バグ修正の標準フロー

```
1. 設計 & proposal コミット (Claude Code)
   /opsx:explore  → 問題を探索し設計を固める
   /opsx:propose  → change proposal を生成（proposal.md / design.md / specs / tasks.md）

   ★ /opsx:propose 完了後、Claude Code は自動的に以下を実行する（スキルの出力より優先）:
     a. main ブランチにいる場合:
        git checkout -b feature/<change-name>
        git add openspec/changes/<change-name>/
        git commit -m "docs(openspec): propose <change-name>"
     b. main 以外のブランチにいる場合:
        ユーザーに「新しいブランチを作るか、現在のブランチで続けるか」を確認する

   ★ コミット後、ユーザーに proposal の確認を促す:
     「proposal をコミットしました。内容を確認して、問題なければ `/opsx:apply` で実装を開始できます。」
     → 実装開始を勝手に促さない。まずユーザーのレビューを待つ。

2. 実装 (agy タスク単位 × N)
   /opsx:apply 実行時、各タスクの難易度をタスク単位で判定する（「難易度の目安」参照）
   agy に委譲する場合は `agy-delegate` skill の手順に従う
   → agy が実装コードをコミットする（"feat: <変更内容>"）

2.5. agy 別セッションレビュー (agy 新規セッション、`agy-review-flow` spec 参照)
   実装とは別の新規 agy セッションで diff と変更要約をレビューさせる
   → 変更が 1 ファイル・20 行以下の場合はこのステップを省略してよい

3. コードレビュー (Claude Code)
   /code-review（agy レビュー結果も参考にしつつ最終判断）
   → 指摘があれば、修正内容を具体的にまとめる

4. レビュー指摘の修正 (agy)
   Claude Code がレビュー結果から修正プロンプトを作成し、`agy-delegate` skill の手順で agy に委譲する
   → agy が修正コードをコミットする（"fix: <修正内容>"）
   → 指摘がなければこのステップはスキップ

5. PR 作成 & OpenSpec アーカイブ (Claude Code)
   /opsx:archive  → change をアーカイブ（delta spec sync を含む）
   gh pr create
   → アーカイブと spec sync のコミットを PR に含める

6. CI 確認 (Claude Code)
   gh pr checks --watch
   → 失敗したら是正してプッシュし、再度 watch する
```

### ドキュメント更新の原則

**設計・実装・レビューのすべての場面で常に検討すること。**

- 仕様変更・機能追加があれば `openspec/specs/` の対応する spec.md を更新する
- CLAUDE.md 自体のワークフローや規約が変わったときは即座に更新する
- agy への実装プロンプトにも「関連ドキュメントの更新が必要か検討すること」を明示する

### CI / pre-commit ルール

**pre-commit のスキップ禁止**
`--no-verify` や `SKIP=...` による pre-commit フックのスキップは一切行わない。
フックが失敗した場合は、スキップせず根本原因を修正してから再コミットする。

**GitHub Actions の失敗は必ず是正する**
pre-commit が通っても GitHub Actions が失敗した場合は問題とみなす。
PR 作成後は必ず次のコマンドで CI 結果を待ち、失敗があれば修正してプッシュすること:

```bash
gh pr checks --watch   # 成功: exit 0 / 失敗: exit 非0
```

失敗した場合は `gh pr checks` でどのジョブが落ちたかを確認し、修正 → コミット → プッシュ → 再度 watch のサイクルで是正する。
CI がすべてグリーンになったことを確認してから作業完了を報告する。

### OpenSpec チートシート

| スキル | 用途 |
|--------|------|
| `/opsx:explore` | アイデア・問題を探索する（実装しない） |
| `/opsx:propose` | change proposal を一括生成 |
| `/opsx:apply` | tasks.md のタスクを順に実装（Claude Code が担当する場合） |
| `/opsx:sync` | delta spec を main spec にマージ |
| `/opsx:archive` | 完了した change をアーカイブ（PR 作成前に実施） |

### ブランチ命名規則

```
feature/<change-name>   # 機能追加（OpenSpec change 名と一致させる）
fix/<change-name>       # バグ修正
```
