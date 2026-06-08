## ADDED Requirements

### Requirement: ゲーム開始
ユーザーは難易度 (easy / normal / hard) を選択してゲームを開始できる。開始と同時にタイマーが計測を始める。

#### Scenario: 難易度選択と開始
- **WHEN** ユーザーがスタート画面で難易度を選択し「開始」ボタンを押す
- **THEN** 選択した難易度に対応する問題プールから10問がランダムに選ばれ、第1問が表示される。タイマーが起動する。

### Requirement: 問題表示
ゲーム画面には現在の問題文・進捗 (例: 3/10)・タイマーを表示する。SKK入力欄にフォーカスが当たった状態で始まる。

#### Scenario: 問題画面の表示内容
- **WHEN** 問題が表示される
- **THEN** 問題文・進捗カウンター・経過タイム・途中終了ボタンが画面上に存在する

### Requirement: Enter による提出
SKK の phase が direct かつ romajiBuffer が空のとき、Enter キーを「提出」として扱う。Enter はエンジンに渡さず (`\n` はコミットしない)。

#### Scenario: 正常な提出
- **WHEN** phase=direct かつ romajiBuffer が空の状態で Enter を押す
- **THEN** committed と問題文を比較して正誤を判定する

#### Scenario: 変換中の Enter
- **WHEN** phase が pre-conversion または conversion のときに Enter を押す
- **THEN** Enter はエンジンに渡されず、「変換を確定してから Enter を押してください」という警告メッセージを表示する

#### Scenario: romajiBuffer 残りの Enter
- **WHEN** phase=direct かつ romajiBuffer に文字がある状態で Enter を押す
- **THEN** Enter はエンジンに渡されず、警告メッセージを表示する

### Requirement: 正誤判定
committed と問題文テキストを Unicode コードポイント単位で完全比較する。

#### Scenario: 正解
- **WHEN** committed が問題文と完全一致した状態で提出される
- **THEN** 正解として扱い、committed をリセットして次の問題へ進む (最終問の場合は結果画面へ)

#### Scenario: 不一致
- **WHEN** committed が問題文と一致しない状態で提出される
- **THEN** 不一致の文字位置を赤くハイライトした問題文を表示し、committed をリセットして同じ問題の再入力を求める

### Requirement: 途中終了
ゲーム進行中、ユーザーは「途中終了」ボタンを押してゲームを中断できる。成績は記録されない。

#### Scenario: 途中終了の実行
- **WHEN** ユーザーが途中終了ボタンを押す
- **THEN** タイマーが停止し、成績を保存せずにゲームのスタート画面へ戻る

### Requirement: ゲーム完了
10問すべてに正解するとゲームが完了し、結果画面へ遷移する。

#### Scenario: 10問完了
- **WHEN** 10問目に正解する
- **THEN** タイマーが停止し、合計タイムが計算されて結果画面が表示される
