# question-bank Specification

## Purpose
TBD - created by archiving change add-typing-game. Update Purpose after archive.
## Requirements
### Requirement: 問題文のデータ型
問題文は TypeScript の型 `Question` で定義し、`src/data/questions.ts` に静的配列として管理する。

```ts
type SkkFeature = 'hiragana-only' | 'katakana' | 'conversion' | 'okurigana'
type Difficulty = 'easy' | 'normal' | 'hard'

interface Question {
  id: string            // 一意な識別子 (例: "easy-001")
  text: string          // 正解テキスト (例: "かいだん")
  difficulty: Difficulty
  skkFeatures: SkkFeature[]
}
```

#### Scenario: 型定義の存在
- **WHEN** 開発者が問題を追加しようとする
- **THEN** `Question` 型と `SkkFeature` 型が `src/data/questions.ts` からインポート可能であり、型チェックが機能する

### Requirement: 難易度別の問題プール
各難易度に対応する問題がプール内に存在し、ゲーム開始時に10問がランダムに選択される。各難易度のプールには最低10問以上収録する。

難易度の基準:
- **easy**: `hiragana-only` または `katakana` のみで構成 (5〜10文字)。モード切替 (Ctrl+J, q) の練習。
- **normal**: `conversion` (送り仮名なし) を含む、ひらがな・カタカナ・漢字混在 (10〜18文字)。
- **hard**: `okurigana` (送り仮名あり) を含む (15〜25文字)。

#### Scenario: 難易度に対応した問題の選択
- **WHEN** ユーザーが easy を選択してゲームを開始する
- **THEN** easy の問題プールから重複なく10問が選ばれる

#### Scenario: 問題プールの不足
- **WHEN** ある難易度のプールが10問未満である
- **THEN** 開発者がビルドまたはテスト時に気づける形で警告またはエラーが出る (実装上のバリデーション)

### Requirement: 開発者向け問題追加ガイド
`src/data/questions.ts` の先頭またはコメント内に、問題を追加するための簡潔なガイドを記載する。

ガイドに含める内容:
- `SkkFeature` タグの説明と使い分け
- 難易度別の文字数目安
- サンプル問題

#### Scenario: ガイドの参照
- **WHEN** 開発者が `src/data/questions.ts` を開く
- **THEN** 問題を追加するための基準とサンプルが同一ファイル内で確認できる

