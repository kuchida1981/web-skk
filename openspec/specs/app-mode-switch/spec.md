# app-mode-switch Specification

## Purpose
TBD - created by archiving change add-typing-game. Update Purpose after archive.
## Requirements
### Requirement: アプリモードの切替
アプリは「フリー入力」と「ゲーム」の2モードを持つ。ユーザーはヘッダーに表示されたタブまたはスイッチでいつでも切り替えられる。

#### Scenario: フリー入力モードからゲームモードへの切替
- **WHEN** ユーザーがヘッダーの「ゲーム」タブをクリックする
- **THEN** 現在の入力内容がリセットされ、ゲームのスタート画面が表示される

#### Scenario: ゲームモードからフリー入力モードへの切替
- **WHEN** ユーザーがヘッダーの「フリー入力」タブをクリックする
- **THEN** SKK フリー入力画面が表示され、committed は空の状態から始まる

### Requirement: ゲーム中のモード切替抑制
ゲームが進行中 (phase=playing) の場合、ヘッダーのモード切替UIは無効化される。

#### Scenario: ゲーム中のモード切替試行
- **WHEN** ゲームの phase が playing のときにユーザーがモード切替タブをクリックする
- **THEN** モード切替は行われない (タブは視覚的に無効状態を示す)

