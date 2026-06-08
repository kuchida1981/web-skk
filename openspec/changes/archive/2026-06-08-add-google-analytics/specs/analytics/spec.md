## ADDED Requirements

### Requirement: GA4 スクリプトの読み込み
アプリは GA4 の gtag.js スクリプトを `<head>` 冒頭で読み込み、ページビューを自動計測する SHALL。

#### Scenario: ページ初期表示
- **WHEN** ユーザーがアプリのページを開く
- **THEN** GA4 にページビューイベントが送信される

### Requirement: analytics モジュール
`src/lib/analytics.ts` は `trackEvent(name, params?)` 関数を公開する SHALL。gtag が未定義の場合（スクリプト読み込み失敗など）は無音で失敗する SHALL。

#### Scenario: gtag 未定義時の呼び出し
- **WHEN** `window.gtag` が未定義の状態で `trackEvent()` が呼ばれる
- **THEN** エラーを throw せず処理を終了する

### Requirement: mode_switch イベント
ユーザーがフリーモードとゲームモードを切り替えたとき、`mode_switch` イベントを GA4 に送信する SHALL。

#### Scenario: ゲームモードへ切り替え
- **WHEN** ユーザーが「ゲーム」タブをクリックする
- **THEN** `mode_switch` イベントが `{mode: 'game'}` パラメータとともに送信される

#### Scenario: フリーモードへ切り替え
- **WHEN** ユーザーが「フリー入力」タブをクリックする
- **THEN** `mode_switch` イベントが `{mode: 'free'}` パラメータとともに送信される

### Requirement: game_start イベント
ゲームが開始されたとき、`game_start` イベントを GA4 に送信する SHALL。

#### Scenario: ゲーム開始
- **WHEN** ユーザーが難易度を選択してゲームを開始する
- **THEN** `game_start` イベントが `{difficulty}` パラメータとともに送信される

### Requirement: game_complete イベント
10問すべてに正解してゲームが完了したとき、`game_complete` イベントを GA4 に送信する SHALL。

#### Scenario: ゲーム完了
- **WHEN** ユーザーが 10 問すべてに正解する
- **THEN** `game_complete` イベントが `{difficulty, time_ms}` パラメータとともに送信される

### Requirement: game_abandon イベント
ゲームプレイ中に中断ボタンを押したとき、`game_abandon` イベントを GA4 に送信する SHALL。結果画面からフリーモードに戻る操作では送信しない SHALL。

#### Scenario: プレイ中に中断
- **WHEN** ゲームフェーズが `playing` の状態でユーザーが中断ボタンを押す
- **THEN** `game_abandon` イベントが `{difficulty, questions_done}` パラメータとともに送信される

#### Scenario: 結果画面からフリーへ
- **WHEN** ゲームフェーズが `result` の状態でユーザーがフリーモードに切り替える
- **THEN** `game_abandon` イベントは送信されない

### Requirement: dictionary_ready イベント
辞書の読み込みが成功したとき、`dictionary_ready` イベントを GA4 に送信する SHALL。

#### Scenario: 辞書読み込み成功
- **WHEN** 辞書の読み込みが完了し、ステータスが `ready` になる
- **THEN** `dictionary_ready` イベントが送信される

### Requirement: dictionary_error イベント
辞書の読み込みが失敗したとき、`dictionary_error` イベントを GA4 に送信する SHALL。

#### Scenario: 辞書読み込み失敗
- **WHEN** 辞書の読み込みが失敗し、ステータスが `error` になる
- **THEN** `dictionary_error` イベントが `{message}` パラメータとともに送信される
