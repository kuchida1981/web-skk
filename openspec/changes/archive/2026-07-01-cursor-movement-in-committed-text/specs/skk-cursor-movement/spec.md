## ADDED Requirements

### Requirement: direct フェーズで矢印キーによるカーソル移動をサポートする
システムは `direct` フェーズにおいて、`ArrowLeft` / `ArrowRight` キーで確定済みテキスト内のカーソル位置を1文字単位で移動しなければならない（SHALL）。`Home` / `End` キーで行頭・行末へ移動しなければならない（SHALL）。カーソル位置はコードポイント単位で管理する。

#### Scenario: ArrowLeft でカーソルが1文字後退する
- **WHEN** `committed: "あいう"`, `cursorPos: 3`（末尾）の状態で `ArrowLeft` を押す
- **THEN** `cursorPos` が `2` になる

#### Scenario: ArrowRight でカーソルが1文字前進する
- **WHEN** `committed: "あいう"`, `cursorPos: 1` の状態で `ArrowRight` を押す
- **THEN** `cursorPos` が `2` になる

#### Scenario: 先頭でさらに ArrowLeft を押しても cursorPos は 0 のまま
- **WHEN** `committed: "あいう"`, `cursorPos: 0` の状態で `ArrowLeft` を押す
- **THEN** `cursorPos` が `0` のまま変わらない

#### Scenario: 末尾でさらに ArrowRight を押しても cursorPos は変わらない
- **WHEN** `committed: "あいう"`, `cursorPos: 3`（末尾）の状態で `ArrowRight` を押す
- **THEN** `cursorPos` が `3` のまま変わらない

#### Scenario: Home で行頭へ移動する
- **WHEN** `committed: "あいう"`, `cursorPos: 2` の状態で `Home` を押す
- **THEN** `cursorPos` が `0` になる

#### Scenario: End で行末へ移動する
- **WHEN** `committed: "あいう"`, `cursorPos: 0` の状態で `End` を押す
- **THEN** `cursorPos` が `3` になる

---

### Requirement: direct フェーズで readline 風カーソル移動キーをサポートする
システムは `direct` フェーズにおいて、`Ctrl+B`（1文字後退）/ `Ctrl+F`（1文字前進）/ `Ctrl+A`（行頭）/ `Ctrl+E`（行末）を `ArrowLeft` / `ArrowRight` / `Home` / `End` と同等に扱わなければならない（SHALL）。

#### Scenario: Ctrl+B でカーソルが1文字後退する
- **WHEN** `committed: "あいう"`, `cursorPos: 2` の状態で `Ctrl+B` を押す
- **THEN** `cursorPos` が `1` になる

#### Scenario: Ctrl+F でカーソルが1文字前進する
- **WHEN** `committed: "あいう"`, `cursorPos: 1` の状態で `Ctrl+F` を押す
- **THEN** `cursorPos` が `2` になる

#### Scenario: Ctrl+A で行頭へ移動する
- **WHEN** `committed: "あいう"`, `cursorPos: 3` の状態で `Ctrl+A` を押す
- **THEN** `cursorPos` が `0` になる

#### Scenario: Ctrl+E で行末へ移動する
- **WHEN** `committed: "あいう"`, `cursorPos: 0` の状態で `Ctrl+E` を押す
- **THEN** `cursorPos` が `3` になる

---

### Requirement: direct フェーズで readline 風テキスト削除操作をサポートする
システムは `direct` フェーズにおいて、以下の削除操作をサポートしなければならない（SHALL）: `Ctrl+D`（前方削除）、`Ctrl+K`（カーソル以降を削除）、`Ctrl+U`（カーソル以前を削除）、`Ctrl+W`（直前の単語を削除）。

#### Scenario: Ctrl+D でカーソル位置の文字を削除する
- **WHEN** `committed: "あいう"`, `cursorPos: 1` の状態で `Ctrl+D` を押す
- **THEN** `committed` が `"あう"` になり、`cursorPos` が `1` のまま変わらない

#### Scenario: Ctrl+D を末尾で押しても何も変わらない
- **WHEN** `committed: "あいう"`, `cursorPos: 3`（末尾）の状態で `Ctrl+D` を押す
- **THEN** `committed` と `cursorPos` が変わらない

#### Scenario: Ctrl+K でカーソル位置から末尾までを削除する
- **WHEN** `committed: "あいう"`, `cursorPos: 1` の状態で `Ctrl+K` を押す
- **THEN** `committed` が `"あ"` になり、`cursorPos` が `1` になる

#### Scenario: Ctrl+U でカーソル位置から先頭までを削除する
- **WHEN** `committed: "あいう"`, `cursorPos: 2` の状態で `Ctrl+U` を押す
- **THEN** `committed` が `"う"` になり、`cursorPos` が `0` になる

#### Scenario: Ctrl+W でカーソル直前の単語を削除する
- **WHEN** `committed: "hello world"`, `cursorPos: 11`（末尾）の状態で `Ctrl+W` を押す
- **THEN** `committed` が `"hello "` になり、`cursorPos` が `6` になる

#### Scenario: Ctrl+W で空白をまたいで前の単語を削除する
- **WHEN** `committed: "hello  world"`, `cursorPos: 12`（末尾）の状態で `Ctrl+W` を押す
- **THEN** 直前の空白を含む単語（`world` とその前の空白）が削除される

---

### Requirement: pre-conversion・conversion フェーズでは矢印・readline 移動キーを無視する
システムは `pre-conversion` または `conversion` フェーズにおいて、カーソル移動キー（矢印・Ctrl+B/F/A/E）および削除操作キー（Ctrl+D/K/U/W）を無視し、SKK 状態を変更してはならない（SHALL NOT）。

#### Scenario: pre-conversion 中の ArrowLeft は無視される
- **WHEN** フェーズが `pre-conversion` の状態で `ArrowLeft` を押す
- **THEN** `SkkState` が変化しない

#### Scenario: conversion 中の Ctrl+F は無視される
- **WHEN** フェーズが `conversion` の状態で `Ctrl+F` を押す
- **THEN** `SkkState` が変化しない

---

### Requirement: Backspace はカーソル位置の直前の文字を削除する
システムは `direct` フェーズにおいて、`Backspace`（および `Ctrl+H`）でカーソル位置の直前の文字を削除し、カーソル位置を1文字後退させなければならない（SHALL）。カーソルが先頭の場合は何もしない。

#### Scenario: カーソルが末尾にある場合の Backspace は末尾文字を削除する
- **WHEN** `committed: "あいう"`, `cursorPos: 3` の状態で `Backspace` を押す
- **THEN** `committed` が `"あい"` になり、`cursorPos` が `2` になる

#### Scenario: カーソルが途中にある場合の Backspace はカーソル直前の文字を削除する
- **WHEN** `committed: "あいう"`, `cursorPos: 2` の状態で `Backspace` を押す
- **THEN** `committed` が `"あう"` になり、`cursorPos` が `1` になる

#### Scenario: カーソルが先頭の場合の Backspace は何もしない
- **WHEN** `committed: "あいう"`, `cursorPos: 0` の状態で `Backspace` を押す
- **THEN** `committed` と `cursorPos` が変化しない

---

### Requirement: テキスト確定はカーソル位置に挿入する
システムは SKK エンジンがテキストを確定する際、末尾ではなく現在の `cursorPos` に挿入し、`cursorPos` を確定テキストの文字数だけ前進させなければならない（SHALL）。

#### Scenario: カーソルが末尾にある場合は末尾に追加される
- **WHEN** `committed: "あい"`, `cursorPos: 2`（末尾）の状態でテキスト `"う"` を確定する
- **THEN** `committed` が `"あいう"` になり、`cursorPos` が `3` になる

#### Scenario: カーソルが途中にある場合はカーソル位置に挿入される
- **WHEN** `committed: "あう"`, `cursorPos: 1` の状態でテキスト `"い"` を確定する
- **THEN** `committed` が `"あいう"` になり、`cursorPos` が `2` になる
