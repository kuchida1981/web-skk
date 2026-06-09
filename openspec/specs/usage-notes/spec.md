# usage-notes Specification

## Purpose
ユーザーがスムーズに SKK 入力を開始できるよう、システム IME をオフにするよう促す案内と、一部ブラウザでの Ctrl+J 代替キー情報をキーガイド付近に常時表示する。

## Requirements

### Requirement: IME オフの案内を表示する
アプリはキーガイドの付近に、システムの日本語入力をオフにするよう促すテキストを表示しなければならない（SHALL）。代表的なソフト名（Microsoft IME・Google 日本語入力・Fcitx）を含めること。

#### Scenario: IME 案内が表示される
- **WHEN** ユーザーがアプリを開く
- **THEN** キーガイドの付近に「Microsoft IME・Google 日本語入力・Fcitx などシステムの日本語入力をオフにしてください」という旨のテキストが常時表示されている

### Requirement: Ctrl+J 代替キーを案内する
キーガイドの Ctrl+J 行は、一部ブラウザで Shift+Ctrl+J が代替として有効であることを示さなければならない（SHALL）。

#### Scenario: Ctrl+J 行に代替キーの注記がある
- **WHEN** ユーザーがキーガイドを参照する
- **THEN** Ctrl+J の説明に「Chrome など一部ブラウザでは Shift+Ctrl+J が有効」という旨の注記が含まれている
