## Why

サイトに初めて訪れたユーザーが「SKKとは何か」を理解できないまま離脱するリスクがある。また、現状のデザインはシンプルすぎてアプリとしての質感が低く、初印象を損ねている。これら2点を最小限の変更で改善する。

## What Changes

- ヘッダーに SKK の1行説明（subtitle）を追加する
- ヘッダー上部に indigo → violet のグラデーションアクセントバー（4px）を追加する
- ヘッダーを白背景 + 下シャドウのアプリシェルスタイルに変更する
- タイトル文字色を indigo 系に変更する
- 入力エリアに subtle な box-shadow を追加する

## Capabilities

### New Capabilities

- `skk-intro-subtitle`: ヘッダー内に SKK の概要を伝える1行テキストを表示する機能

### Modified Capabilities

（なし）

## Impact

- `src/App.tsx`: subtitle 要素の JSX 追加
- `src/App.css`: ヘッダー・タイトル・入力エリアのスタイル変更
- `src/index.css`: body 背景など全体スタイルの微調整
- 画面遷移・UXフローへの影響なし
