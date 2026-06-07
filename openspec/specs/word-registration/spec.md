# word-registration Specification

## Purpose
TBD - created by archiving change add-word-registration. Update Purpose after archive.
## Requirements
### Requirement: 候補が存在しないとき辞書登録モードへ入る
候補が0件のとき（`injectCandidates` に空配列）または変換フェーズで Space を押して候補リストの末尾を超えたとき、システムは辞書登録モード（`SkkState.wordRegistration` を設定）へ入らなければならない（SHALL）。

#### Scenario: 候補ゼロで辞書登録モードへ入る
- **WHEN** `▽ほげほげ` の状態で Space を入力し、辞書に候補が存在しない
- **THEN** `wordRegistration` が設定され、`midashi: "ほげほげ"` が保持される

#### Scenario: 候補を使い切って辞書登録モードへ入る
- **WHEN** `▼感じ` の状態で Space を入力し、これ以上候補がない
- **THEN** `wordRegistration` が設定され、辞書登録モードへ入る

---

### Requirement: 辞書登録モードでの表示形式
システムは辞書登録モード中、`[登録: みだし]` に続いて内側の SKK 入力の preEdit を表示しなければならない（SHALL）。送り仮名がある場合は `[登録: みだし送り仮名]` の形式で表示する（辞書キーの末尾子音ではなく人間に読みやすい形）。

#### Scenario: 基本的な登録プロンプト表示
- **WHEN** `wordRegistration.midashi = "かんじ"` で登録モード中、inner が空
- **THEN** preEdit が `[登録: かんじ]` と表示される

#### Scenario: 送り仮名つきの登録プロンプト
- **WHEN** `wordRegistration.midashi = "うごく"` （送り仮名あり）で登録モード中
- **THEN** preEdit が `[登録: うごく]` と表示される（辞書キー `うごk` ではない）

#### Scenario: 内側で変換中の表示
- **WHEN** 登録モード中に内側で pre-conversion フェーズで `▽かん` の状態
- **THEN** preEdit が `[登録: かんじ]▽かん` と表示される

#### Scenario: 再帰登録の表示
- **WHEN** 登録モード中の inner で再帰的に登録モードへ入る
- **THEN** preEdit が `[登録: かんじ][登録: かん]▽か` のように入れ子表示される

---

### Requirement: Enter または Ctrl+J で登録を確定する
システムは辞書登録モード中、Enter または Ctrl+J が入力されかつ inner の committed が空でない場合、登録完了シグナル（`ProcessKeyResult.registrationResult`）を返さなければならない（SHALL）。登録語は直ちにコミットされ、`wordRegistration` がクリアされる。

#### Scenario: Enter で登録確定
- **WHEN** 登録モード中に `漢字` と入力して Enter を押す
- **THEN** `registrationResult: { midashiKey: "かんじ", word: "漢字" }` が返され、フェーズが `direct` に戻る

#### Scenario: inner が空の場合は確定しない
- **WHEN** 登録モード中に何も入力せず Enter を押す
- **THEN** 何も起こらず登録モードが継続する

---

### Requirement: Ctrl+G で登録をキャンセルして pre-conversion に戻る
システムは辞書登録モード中、Ctrl+G で登録をキャンセルし、`pre-conversion` フェーズに戻らなければならない（SHALL）。midashi と candidates は保持する。

#### Scenario: Ctrl+G でキャンセルして pre-conversion に戻る
- **WHEN** 登録モード中に Ctrl+G を入力する
- **THEN** phase が `pre-conversion` に戻り、midashi が保持され、`wordRegistration` がクリアされる

---

### Requirement: 登録モード中に再帰的に SKK 変換を使える
システムは辞書登録モード中の inner state においても完全な SKK 変換フロー（▽/▼）が動作しなければならない（SHALL）。inner state 自身が `wordRegistration` を再帰的に持てる。

#### Scenario: 登録中に SKK 変換を開始する
- **WHEN** 登録モード中に大文字入力で inner の pre-conversion を開始する
- **THEN** inner state が `pre-conversion` フェーズに入り、変換が使える

#### Scenario: 登録中の再帰登録トリガー
- **WHEN** 登録モード中に inner で変換を試みて候補が存在しない
- **THEN** inner state に `wordRegistration` が設定され、2段目の登録モードへ入る

