## 1. KeyGuide コンポーネントの刷新

- [x] 1.1 `KeyGuide.tsx` からトグル用 `useState` を削除し、折りたたみ機能を廃止する
- [x] 1.2 `KEY_BINDINGS` 配列を6セクション構成（基本 / モード切替 / ▽変換中 / ▼候補選択中 / 記号変換 / 単語登録）のデータ構造に置き換える
- [x] 1.3 各セクションを `<section>` または `<div>` で区切り、セクション見出し付きのテーブルとしてレンダリングする
- [x] 1.4 詳細セクション（モード切替以降）に CSS クラス `key-guide__detail` を付与し、狭い画面で非表示にできるようにする
- [x] 1.5 IME注意書き（`key-guide__ime-note`）の JSX を `KeyGuide.tsx` から削除する

## 2. IME注意書きの移動

- [x] 2.1 `App.tsx` のフリー入力エリア内、入力欄（`SkkInputArea`）の直上に IME注意書きを追加する
- [x] 2.2 対応する CSS スタイル（`app__ime-note` など）を `App.css` に追加する

## 3. レイアウトの変更（サイドバイサイド）

- [x] 3.1 `App.tsx` のフリー入力エリアを `<div className="app__free-layout">` でラップし、入力カラムとキーガイドパネルを横並びにする構造に変更する
- [x] 3.2 `App.css` に `.app__free-layout` のグリッドレイアウト（`grid-template-columns: 1fr auto`）を追加する
- [x] 3.3 `App.css` に `KeyGuide` サイドパネル用スタイル（`max-height`・`overflow-y: auto` 等）を追加する
- [x] 3.4 `App.css` にメディアクエリ（`max-width: 899px`）を追加し、狭い画面で縦積みレイアウトに戻す
- [x] 3.5 `App.css` の同メディアクエリ内で `.key-guide__detail` を `display: none` にする
- [x] 3.6 `App.tsx` の `<footer>` を廃止し、`KeyGuide` をレイアウト内（`app__free-layout` のカラム）に移動する

## 4. 動作確認

- [x] 4.1 広い画面でキーガイドが入力エリアの右側に常時表示されることを確認する
- [x] 4.2 狭い画面（ブラウザ幅を900px未満に縮小）で基本セクションのみが下部に表示されることを確認する
- [x] 4.3 IME注意書きが入力欄付近に表示されることを確認する
- [x] 4.4 全セクションの内容（キーバインド・説明）に漏れや誤りがないか確認する
