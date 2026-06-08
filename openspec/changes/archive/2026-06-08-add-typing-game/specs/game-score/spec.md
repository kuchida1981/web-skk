## ADDED Requirements

### Requirement: 成績の localStorage 保存
ゲームを完走したとき、成績を localStorage に保存する。途中終了の場合は保存しない。

保存スキーマ:
```ts
interface GameRecord {
  date: string      // ISO 8601 (例: "2026-06-08T12:34:56.789Z")
  difficulty: 'easy' | 'normal' | 'hard'
  timeMs: number    // 合計タイム (ミリ秒)
  questions: 10
}
// localStorage キー: "skk-game-records"
// 値: JSON.stringify(GameRecord[])  最大50件 (超過時は古いものを削除)
```

#### Scenario: 完走時の保存
- **WHEN** 10問すべてに正解してゲームが完了する
- **THEN** 成績が localStorage の "skk-game-records" に追記される

#### Scenario: 途中終了時の非保存
- **WHEN** ユーザーが途中終了ボタンを押す
- **THEN** localStorage には何も書き込まれない

#### Scenario: 50件超過時の削除
- **WHEN** 保存件数が50件に達している状態で新たな成績を保存する
- **THEN** 最も古い記録が削除され、新しい記録が末尾に追加される

### Requirement: 結果画面での成績表示
ゲーム完了後の結果画面には、今回の合計タイムと過去の成績一覧 (最大10件) を表示する。

#### Scenario: 結果画面の表示内容
- **WHEN** 10問完走して結果画面が表示される
- **THEN** 今回の合計タイム・難易度と、過去の成績一覧 (日付・難易度・タイム) が表示される

#### Scenario: 成績がない場合
- **WHEN** 初回プレイで結果画面が表示される (過去成績なし)
- **THEN** 過去成績エリアには「まだ記録がありません」のようなメッセージが表示される

### Requirement: 結果画面からの遷移
結果画面には「もう一度」と「フリー入力へ」の2つのアクションを提供する。

#### Scenario: もう一度プレイ
- **WHEN** ユーザーが「もう一度」ボタンを押す
- **THEN** 同じ難易度でゲームのスタート画面 (難易度選択を経ずに即開始) に戻る

#### Scenario: フリー入力へ移行
- **WHEN** ユーザーが「フリー入力へ」ボタンを押す
- **THEN** アプリのモードがフリー入力に切り替わる
