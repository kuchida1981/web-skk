# skk-engine Specification

## Purpose
TBD - created by archiving change web-skk-free-input. Update Purpose after archive.
## Requirements
### Requirement: ひらがなモードでローマ字入力からかなに変換する
システムはひらがなモード（デフォルト）において、ローマ字入力を標準ローマ字かな変換テーブルに従いひらがなに変換しなければならない（SHALL）。変換が確定したかな文字は即座にコミット済みテキストに追加される。子音 `n` に続くローマ字が `ny*`（にゃ行）のプレフィックスとなりうる場合、`n` を `ん` に早期確定してはならない（SHALL NOT）。

#### Scenario: 基本的なローマ字からかな変換
- **WHEN** ひらがなモードで `k`, `a` の順にキーを入力する
- **THEN** `か` がコミット済みテキストに追加される

#### Scenario: 複数文字のローマ字（shi, tsu など）
- **WHEN** ひらがなモードで `s`, `h`, `i` の順にキーを入力する
- **THEN** `し` がコミット済みテキストに追加される

#### Scenario: 促音（っ）の入力
- **WHEN** ひらがなモードで同じ子音を連続して入力する（例: `k`, `k`）
- **THEN** `っ` がバッファに追加され、次のかな変換を待つ

#### Scenario: 未確定ローマ字バッファの保持
- **WHEN** ひらがなモードで `k` のみ入力する（かな変換が確定しない）
- **THEN** `k` はローマ字バッファに保持され、コミット済みテキストには追加されない

#### Scenario: にゅ（nyu）の入力
- **WHEN** ひらがなモードで `n`, `y`, `u` の順にキーを入力する
- **THEN** `にゅ` がコミット済みテキストに追加される

#### Scenario: にゃ（nya）の入力
- **WHEN** ひらがなモードで `n`, `y`, `a` の順にキーを入力する
- **THEN** `にゃ` がコミット済みテキストに追加される

#### Scenario: にょ（nyo）の入力
- **WHEN** ひらがなモードで `n`, `y`, `o` の順にキーを入力する
- **THEN** `にょ` がコミット済みテキストに追加される

#### Scenario: ny 入力中はバッファ保持（pending）
- **WHEN** ひらがなモードで `n`, `y` を入力し `y` で止まっている
- **THEN** ローマ字バッファに `ny` が保持され、コミット済みテキストには何も追加されない

#### Scenario: n の後に ny 以外の子音が来た場合は ん を確定する
- **WHEN** ひらがなモードで `n`, `k`, `a` の順にキーを入力する
- **THEN** `んか` がコミット済みテキストに追加される

#### Scenario: ▽モードでの にゅ（Nyu）入力
- **WHEN** ひらがなモードで `N`, `y`, `u` の順にキーを入力する
- **THEN** フェーズが `pre-conversion` になり、見出し語（midashi）に `にゅ` が追加される

### Requirement: 大文字入力で変換モード（▽モード）を開始する
システムはひらがなモードにおいて、大文字アルファベットの入力で変換モードを開始しなければならない（SHALL）。変換モード開始後の入力はかなに変換され、▽マーカーとともに見出し語として蓄積される。

#### Scenario: 大文字入力で▽モードに入る
- **WHEN** ひらがなモードで `K` を入力する
- **THEN** フェーズが `pre-conversion` に遷移し、`▽` が表示される

#### Scenario: ▽モードでのかな入力
- **WHEN** `▽`モードで `a`, `n`, `j`, `i` の順にキーを入力する
- **THEN** `▽あんじ` と表示される

#### Scenario: Spaceで変換候補を取得する
- **WHEN** `▽かんじ` の状態で `Space` を入力する
- **THEN** `dictionaryRequest` として `{ midashi: "かんじ", okurigana: "" }` が返される

---

### Requirement: 送り仮名（okurigana）を正しく処理する
システムは▽モード中に大文字入力があった場合、それを送り仮名の開始として扱わなければならない（SHALL）。見出し語と送り仮名の先頭子音を辞書キーとして使用する。

#### Scenario: 送り仮名の開始を検出する
- **WHEN** `▽か` の状態で `K` を入力する
- **THEN** 送り仮名バッファが `k` になり、辞書検索の準備をする

#### Scenario: 送り仮名確定と辞書リクエスト
- **WHEN** `▽か` + 送り仮名バッファ `k` の状態で `u` を入力して `く` が確定する
- **THEN** `dictionaryRequest` として `{ midashi: "かk", okurigana: "く" }` が返される

---

### Requirement: 変換候補を順に選択・確定する
システムは▼モードにおいて、Spaceキーで次の候補に移動し、`x` または `Shift+Tab` で前の候補に戻り、Enterまたは他のかな入力で候補を確定しなければならない（SHALL）。候補がゼロ、または全候補を使い切った場合は辞書登録モードへ入る。

#### Scenario: Spaceで次の候補へ移動する
- **WHEN** `▼漢字` の状態で `Space` を入力する
- **THEN** 次の候補（例: `感じ`）が表示される

#### Scenario: Enterで候補を確定する
- **WHEN** `▼漢字` の状態で `Enter` を入力する
- **THEN** `漢字` がコミット済みテキストに追加され、フェーズが `direct` に戻る

#### Scenario: 候補なしの場合は辞書登録モードへ入る
- **WHEN** 辞書に該当候補がなく変換フェーズへ入ろうとする
- **THEN** 辞書登録モード（`wordRegistration` 状態）へ入り、変換前のかなをコミットしない

#### Scenario: 候補を使い切った場合は辞書登録モードへ入る
- **WHEN** 最後の候補を表示中に `Space` を入力する
- **THEN** 辞書登録モード（`wordRegistration` 状態）へ入る

#### Scenario: xキーで前の候補へ戻る
- **WHEN** `▼感じ`（candidateIndex=1）の状態で `x` を入力する
- **THEN** 前の候補（例: `漢字`）が表示され、candidateIndex が 0 になる

#### Scenario: Shift+Tabで前の候補へ戻る
- **WHEN** `▼感じ`（candidateIndex=1）の状態で `Shift+Tab` を入力する
- **THEN** 前の候補（例: `漢字`）が表示され、candidateIndex が 0 になる

#### Scenario: 先頭候補でxキーを押しても何も変わらない
- **WHEN** `▼漢字`（candidateIndex=0）の状態で `x` を入力する
- **THEN** 候補は変わらず、candidateIndex が 0 のまま維持される

### Requirement: Ctrl+Gで変換をキャンセルする
システムは▽モードおよび▼モードにおいて、Ctrl+Gで変換操作をキャンセルし、ひらがなモードの直接入力に戻らなければならない（SHALL）。

#### Scenario: ▽モードでのキャンセル
- **WHEN** `▽かんじ` の状態で `Ctrl+G` を入力する
- **THEN** フェーズが `direct` に戻り、preEditがクリアされる

#### Scenario: ▼モードでのキャンセル
- **WHEN** `▼漢字` の状態で `Ctrl+G` を入力する
- **THEN** フェーズが `pre-conversion`（▽モード）に戻る

---

### Requirement: モード切り替えキーを処理する
システムは以下のキーでモードを切り替えなければならない（SHALL）。

| キー | 動作 |
|------|------|
| `Ctrl+J` | ひらがなモードへ |
| `Q`（directフェーズ） | カタカナモードへ（ひらがな時）またはひらがなモードへ（カタカナ時） |
| `l` | ASCIIモードへ |
| `L` | 全角ASCIIモードへ |

#### Scenario: Ctrl+Jでひらがなモードに戻る
- **WHEN** ASCIIモードで `Ctrl+J` を入力する
- **THEN** モードが `hiragana` になる

#### Scenario: Qでカタカナモードに切り替わる
- **WHEN** ひらがなモードのdirectフェーズで `Q` を入力する
- **THEN** モードが `katakana` になる

#### Scenario: lでASCIIモードに切り替わる
- **WHEN** ひらがなモードで `l` を入力する
- **THEN** モードが `ascii` になる

#### Scenario: LでZenkaku-ASCIIモードに切り替わる
- **WHEN** ひらがなモードで `L` を入力する
- **THEN** モードが `zenkaku-ascii` になる

---

### Requirement: カタカナモードで入力する
システムはカタカナモードにおいて、ローマ字をカタカナに変換しなければならない（SHALL）。カタカナモードでも大文字入力による変換フロー（▽/▼）が動作する。

#### Scenario: カタカナ変換
- **WHEN** カタカナモードで `k`, `a` の順に入力する
- **THEN** `カ` がコミット済みテキストに追加される

---

### Requirement: 全角ASCIIモードで入力する
システムは全角ASCIIモードにおいて、ASCII文字を対応する全角文字に変換してコミットしなければならない（SHALL）。

#### Scenario: 全角ASCII変換
- **WHEN** 全角ASCIIモードで `a` を入力する
- **THEN** `ａ` がコミット済みテキストに追加される

---

### Requirement: Backspace でカーソル直前の文字を削除する
システムは `direct` フェーズにおいて、`Backspace`（および `Ctrl+H`）を受け取ったとき、ローマ字バッファが空であればカーソル位置（`cursorPos`）の直前の文字を削除し、`cursorPos` を1後退させなければならない（SHALL）。ローマ字バッファが空でなければ、バッファの末尾を削除し `cursorPos` は変化しない。カーソルが先頭（`cursorPos === 0`）かつバッファが空の場合は何もしない。

#### Scenario: カーソルが末尾にある場合の Backspace
- **WHEN** `committed: "あい"`, `cursorPos: 2`, `romajiBuffer: ""` の状態で `Backspace` を押す
- **THEN** `committed` が `"あ"` になり、`cursorPos` が `1` になる

#### Scenario: カーソルが途中にある場合の Backspace
- **WHEN** `committed: "あいう"`, `cursorPos: 2`, `romajiBuffer: ""` の状態で `Backspace` を押す
- **THEN** `committed` が `"あう"` になり、`cursorPos` が `1` になる

#### Scenario: カーソルが先頭の場合の Backspace は何もしない
- **WHEN** `committed: "あいう"`, `cursorPos: 0`, `romajiBuffer: ""` の状態で `Backspace` を押す
- **THEN** `committed` と `cursorPos` が変化しない

#### Scenario: ローマ字バッファが空でない場合の Backspace
- **WHEN** `committed: "あ"`, `cursorPos: 1`, `romajiBuffer: "k"` の状態で `Backspace` を押す
- **THEN** `romajiBuffer` が `""` になり、`committed` と `cursorPos` は変化しない

#### Scenario: ▽モードでのBackspace
- **WHEN** `▽かん` の状態で `Backspace` を入力する
- **THEN** preEditが `▽か` になる

---

### Requirement: テキスト確定はカーソル位置に挿入する
システムはかな文字・記号・変換候補などのテキストを確定する際、`committed` の末尾ではなく `cursorPos` の位置に挿入し、`cursorPos` を確定テキストのコードポイント数だけ前進させなければならない（SHALL）。

#### Scenario: カーソルが末尾にある場合の確定
- **WHEN** `committed: "あ"`, `cursorPos: 1`（末尾）の状態でローマ字 `i` を入力し `い` が確定する
- **THEN** `committed` が `"あい"` になり、`cursorPos` が `2` になる

#### Scenario: カーソルが途中にある場合の確定
- **WHEN** `committed: "あう"`, `cursorPos: 1` の状態でローマ字 `i` を入力し `い` が確定する
- **THEN** `committed` が `"あいう"` になり、`cursorPos` が `2` になる

