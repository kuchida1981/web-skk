## Context

現在の web-skk は React + Vite で構成されており、スタイルは `src/index.css`（グローバル）と `src/App.css`（コンポーネント固有）に分かれている。ヘッダーは `#f5f5f5` のボディと同色でフラットに表示されており、アプリとしての質感が乏しい。SKK の説明は README にあるが、サイト上には存在しない。

## Goals / Non-Goals

**Goals:**
- ヘッダーに SKK の1行説明（subtitle）を追加し、初見ユーザーに概要を伝える
- デザインをアプリシェルスタイルにリッチ化し、視覚的な質感を向上させる
- CSS のみの変更を基本とし、JSX の変更は subtitle 追加の最小限にとどめる

**Non-Goals:**
- 画面遷移・モーダル・新規ページの追加
- SKK の詳細解説コンテンツの作成
- テーマ切替・ダークモードなどの動的デザイン機能

## Decisions

### ヘッダーの subtitle 配置

`<h1>` の直下に `<p class="app__subtitle">` を追加する。ヘッダーは `flex` レイアウトのため、subtitle をタイトル列と tabs 列に分けるために `<div class="app__header-title">` でラップする。

**代替案**: header の外（main 上部）に info バナーを置く案もあったが、ヘッダー内のほうがタイトルと意味が直結しており自然。

### アクセントバーの実装

`body::before` または `.app::before` の疑似要素で実装するより、ヘッダー要素自体に `border-top` で追加するほうがシンプルで副作用が少ない。

```css
.app__header {
  border-top: 4px solid;
  border-image: linear-gradient(to right, #3949ab, #7c3aed) 1;
}
```

### 入力エリアのシャドウ

`box-shadow` を追加するが、フォーカス時の ring と干渉しないよう、通常状態に subtle な shadow を、フォーカス時は既存の ring を維持する。

## Risks / Trade-offs

- [border-image と border-radius の非互換] `border-image` は `border-radius` と同時に機能しない → ヘッダーに `border-radius` は使っていないので問題なし
- [subtitle のレイアウト崩れ] ヘッダーが `flex` なため、subtitle 追加時にタブや mode indicator との整列が乱れる可能性 → タイトル部分を縦 flex の `div` にラップして対処
