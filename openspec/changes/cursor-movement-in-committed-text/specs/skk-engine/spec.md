## MODIFIED Requirements

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

---

### Requirement: テキスト確定はカーソル位置に挿入する
システムはかな文字・記号・変換候補などのテキストを確定する際、`committed` の末尾ではなく `cursorPos` の位置に挿入し、`cursorPos` を確定テキストのコードポイント数だけ前進させなければならない（SHALL）。

#### Scenario: カーソルが末尾にある場合の確定
- **WHEN** `committed: "あ"`, `cursorPos: 1`（末尾）の状態でローマ字 `i` を入力し `い` が確定する
- **THEN** `committed` が `"あい"` になり、`cursorPos` が `2` になる

#### Scenario: カーソルが途中にある場合の確定
- **WHEN** `committed: "あう"`, `cursorPos: 1` の状態でローマ字 `i` を入力し `い` が確定する
- **THEN** `committed` が `"あいう"` になり、`cursorPos` が `2` になる
