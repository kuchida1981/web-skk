## 1. プロジェクトセットアップ

- [x] 1.1 Vite + React + TypeScript でプロジェクトを初期化する（`npm create vite@latest`）
- [x] 1.2 Vitest と React Testing Library を追加・設定する
- [x] 1.3 Playwright を追加・設定する
- [x] 1.4 ディレクトリ構造を作成する（`src/skk/`, `src/components/`, `src/hooks/`）

## 2. ローマ字→かな変換テーブル

- [x] 2.1 標準ローマ字かな変換テーブルをデータファイルとして実装する（`src/skk/romaji-table.ts`）
- [x] 2.2 ローマ字バッファから最長一致でかなを変換する関数を実装する
- [x] 2.3 促音（っ）の変換ルールを実装する（子音重複パターン）
- [x] 2.4 全角ASCII変換テーブルを実装する
- [x] 2.5 ローマ字→かな変換のユニットテストを書く

## 3. SKKエンジン（状態マシン）

- [x] 3.1 `SkkState` 型と初期状態を定義する（`src/skk/types.ts`）
- [x] 3.2 `processKey(state, keyboardEvent) → { nextState, dictionaryRequest? }` を実装する（`src/skk/engine.ts`）
- [x] 3.3 ひらがなモードの直接入力（directフェーズ）を実装する
- [x] 3.4 大文字入力による▽モード（pre-conversionフェーズ）遷移を実装する
- [x] 3.5 Space入力による▼モード（conversionフェーズ）遷移とdictionaryRequestを実装する
- [x] 3.6 送り仮名ロジックを実装する（▽モード中の大文字入力でokuriganaBuffer開始）
- [x] 3.7 候補選択（Space→次候補、Enter→確定）を実装する
- [x] 3.8 Ctrl+Gによるキャンセルを実装する
- [x] 3.9 モード切り替えキー（Ctrl+J, Q, l, L）を実装する
- [x] 3.10 カタカナモードの入力を実装する
- [x] 3.11 全角ASCIIモードの入力を実装する
- [x] 3.12 Backspace/Ctrl+Hによる削除を実装する
- [x] 3.13 SKKエンジンのユニットテストを書く（各状態遷移・送り仮名・モード切り替え）

## 4. 辞書レイヤー

- [x] 4.1 辞書インターフェース（`DictionaryProvider`）を定義する（`src/skk/dictionary.ts`）
- [x] 4.2 SKK-JISYO.L のEUC-JPテキストパーサを実装する（Map構築）
- [x] 4.3 送り仮名付き見出し語の検索ロジックを実装する（`midashi + okurigana[0]` キー）
- [x] 4.4 IndexedDBへのキャッシュ保存・読み込みを実装する
- [x] 4.5 辞書フェッチURL・バージョン管理の設定を実装する
- [x] 4.6 テスト用モック辞書プロバイダーを実装する
- [x] 4.7 辞書パーサのユニットテストを書く（パース結果・送り仮名検索・候補なしケース）

## 5. Reactコンポーネントとフック

- [x] 5.1 `useSkkEngine` カスタムフックを実装する（エンジン状態管理・辞書連携）
- [x] 5.2 `useDictionary` カスタムフックを実装する（辞書ロード状態管理）
- [x] 5.3 SKK入力欄コンポーネントを実装する（`SkkInputArea`）：keydown捕捉・状態表示・ページロード時フォーカス
- [x] 5.4 候補ポップアップコンポーネントを実装する（`CandidatePopup`）
- [x] 5.5 モードインジケーターコンポーネントを実装する（`ModeIndicator`）
- [x] 5.6 辞書ロード状態表示コンポーネントを実装する（ローディング・エラー・リトライ）
- [x] 5.7 キーガイドコンポーネントを実装する（折りたたみ機能付き）
- [x] 5.8 各コンポーネントのインテグレーションテストを書く（React Testing Library）

## 6. ページ統合とスタイリング

- [x] 6.1 メインページ（`App.tsx`）でコンポーネントを統合する
- [x] 6.2 基本的なCSSスタイルを適用する（入力欄・候補ポップアップ・モードインジケーター）
- [x] 6.3 SKK-JISYO.L をホスティング用ファイルとして配置する（`public/` ディレクトリ）

## 7. E2Eテストと最終確認

- [x] 7.1 Playwrightでひらがな入力→変換→確定のE2Eシナリオを書く
- [x] 7.2 Playwrightで送り仮名変換のE2Eシナリオを書く
- [x] 7.3 Playwrightでモード切り替えのE2Eシナリオを書く
- [x] 7.4 辞書ロードとIndexedDBキャッシュの動作を手動確認する
