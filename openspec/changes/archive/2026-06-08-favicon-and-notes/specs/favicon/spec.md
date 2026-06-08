## ADDED Requirements

### Requirement: アプリ専用 favicon を表示する
アプリは「あ」白文字・背景 #1565c0 の青丸 SVG を favicon として提供しなければならない（SHALL）。ブラウザタブおよびブックマークにこのアイコンが表示されること。

#### Scenario: ブラウザタブにアイコンが表示される
- **WHEN** ユーザーがアプリをブラウザで開く
- **THEN** タブに「あ」青丸のアイコンが表示される

#### Scenario: デフォルト Vite アイコンが使われない
- **WHEN** ページの `<head>` を確認する
- **THEN** `<link rel="icon">` の `href` が `/favicon.svg` を指しており、`/vite.svg` ではない
