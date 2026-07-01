## 1. agy-delegate スキルの作成

- [x] 1.1 `.claude/skills/agy-delegate/SKILL.md` を新規作成し、現行 CLAUDE.md の「Claude Code から agy を呼び出す方法」セクション（MCP/Bash方式選択、共通ルール、プロンプト必須ルール、対話ループ、失敗リカバリ、委譲判断基準）を、実行時に読みやすい簡潔な運用手順として移植する
- [x] 1.2 SKILL.md の description に強いトリガー文言を設定する（agy へ実装委譲する直前・`agy_ask`/`agy_continue`/Bash `agy --print` 呼び出しの前に必ず使用する旨を明記）
- [x] 1.3 SKILL.md 末尾に運用ルールを明記する:「このプロトコルを変更する場合は、先に対応する spec（`agy-invocation-protocol`、`agy-delegation-criteria`）を OpenSpec change として更新し、その後このスキルに反映すること」

## 2. CLAUDE.md のスリム化

- [x] 2.1 「AI ツール役割分担」セクションを要約し、詳細な難易度判定基準は spec `agy-delegation-criteria` および `agy-delegate` skill を参照する形にする
- [x] 2.2 「Claude Code から agy を呼び出す方法」セクションを削除し、「agy に実装を委譲する際は必ず `agy-delegate` skill を使うこと」という数行のポインタに置き換える
- [x] 2.3 「開発ワークフロー」セクション内、agy 関連の詳細記述（ステップ2の呼び出しコマンド例、ステップ2.5、ステップ4の詳細手順）を圧縮し、詳細は `agy-delegate` skill を参照する形にする
- [x] 2.4 「ドキュメント更新の原則」「CI / pre-commit ルール」「OpenSpec チートシート」「ブランチ命名規則」の各セクションは変更せずそのまま維持する

## 3. 整合性確認

- [x] 3.1 `npx openspec validate --strict --all` を実行し、追加した delta spec（`agy-invocation-protocol` の ADDED Requirements、新規 `agy-delegation-criteria`）が CI のバリデーションに通ることを確認する（21 passed, 0 failed）
- [x] 3.2 スリム化後の CLAUDE.md の行数が目安（90〜110行程度）に収まっているか確認する（260行 → 113行、約57%削減。目安よりわずかに多いが許容範囲）
- [x] 3.3 スリム化後の CLAUDE.md と `agy-delegate` skill を読み合わせ、旧 CLAUDE.md にあった情報（タイムアウト値、環境変数、対話ループの上限回数など）が漏れなく移植されているか確認する
