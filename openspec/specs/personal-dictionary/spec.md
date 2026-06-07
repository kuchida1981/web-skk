# personal-dictionary Specification

## Purpose
TBD - created by archiving change add-word-registration. Update Purpose after archive.
## Requirements
### Requirement: 登録した語を localStorage に永続化する
システムは辞書登録が確定したとき（`registrationResult` を受け取ったとき）、見出しキーと登録語を localStorage の個人辞書に保存しなければならない（SHALL）。キーは `"web-skk-personal-dict"`、形式は `{ [midashiKey: string]: string[] }`。

#### Scenario: 新規単語の登録
- **WHEN** `registrationResult: { midashiKey: "かんじ", word: "感字" }` を受け取る
- **THEN** localStorage の個人辞書に `"かんじ": ["感字"]` が保存される

#### Scenario: 既存見出し語への追加
- **WHEN** `"かんじ"` に既に `["漢字"]` がある状態で `"感字"` を登録する
- **THEN** 個人辞書が `"かんじ": ["感字", "漢字"]`（新規登録語を先頭）に更新される

#### Scenario: 重複登録の排除と先頭移動
- **WHEN** 既に登録済みの語 `"漢字"` を再登録する
- **THEN** 重複が除去され、`"漢字"` が先頭に移動する

---

### Requirement: 個人辞書の候補を共通辞書より優先して返す
システムは候補検索において、個人辞書の候補を共通辞書の候補より先に返さなければならない（SHALL）。重複する候補は除去し、個人辞書側を優先する。`CompoundDictionaryProvider` がこの統合を担う。

#### Scenario: 個人辞書が優先される
- **WHEN** `"かんじ"` が個人辞書に `["感字"]`、共通辞書に `["漢字", "感じ"]` ある状態で `lookup("かんじ", "")` を呼ぶ
- **THEN** `["感字", "漢字", "感じ"]` が返される

#### Scenario: 個人辞書のみにある語
- **WHEN** 共通辞書に存在しない見出し語が個人辞書にある
- **THEN** 個人辞書の候補リストが返される

#### Scenario: 個人辞書が空の場合は共通辞書のみ
- **WHEN** 個人辞書にエントリがない見出し語を検索する
- **THEN** 共通辞書の候補リストがそのまま返される

---

### Requirement: アプリ起動時に個人辞書を復元する
システムはアプリ起動時に localStorage から個人辞書を読み込み、変換候補検索に即座に使えなければならない（SHALL）。

#### Scenario: 起動時の個人辞書読み込み
- **WHEN** アプリを起動し、localStorage に個人辞書データがある
- **THEN** 起動直後から個人辞書の候補が lookup に反映される

