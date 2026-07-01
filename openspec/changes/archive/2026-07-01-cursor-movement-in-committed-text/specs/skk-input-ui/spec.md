## MODIFIED Requirements

### Requirement: 入力欄に現在のSKK状態を表示する
システムはSKK状態（committed/preEdit）を入力欄にリアルタイムで描画しなければならない（SHALL）。確定済みテキストは `cursorPos` で前後に分割して描画し、カーソルは `committed[:cursorPos]`・preEdit の直後（preEdit がない場合は `committed[:cursorPos]` の直後）に表示しなければならない。▽/▼マーカーはpreEditの先頭に表示される。

#### Scenario: コミット済みテキストの表示（カーソル末尾）
- **WHEN** `committed: "今日は"`, `cursorPos: 3`（末尾）の状態
- **THEN** 入力欄に `今日は▷` が表示される（▷はカーソル位置を示す）

#### Scenario: コミット済みテキストの途中にカーソルがある場合の表示
- **WHEN** `committed: "今日は"`, `cursorPos: 2` の状態
- **THEN** 入力欄に `今日▷は` が表示される

#### Scenario: カーソルが途中にある状態で preEdit が存在する場合
- **WHEN** `committed: "今は"`, `cursorPos: 1`, `preEdit: "▽てんき"` の状態
- **THEN** 入力欄に `今▽てんき▷は` が表示される（preEdit がカーソル位置に挿入される）

#### Scenario: ▼マーカー付き変換候補の表示
- **WHEN** 変換候補 `天気` が選択中、`committed: "今日は"`, `cursorPos: 3`
- **THEN** 入力欄に `今日は▼天気▷` が表示される
