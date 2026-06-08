## MODIFIED Requirements

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
