## Context

現状は Vite のデフォルト favicon（`/vite.svg`）を使用している。UI は React + CSS Modules ではなく素の CSS で構成されており、カラーテーマは `#1565c0`（ブルー）を基調とする。キーガイドは `KeyGuide.tsx` の `KEY_BINDINGS` 配列で管理されており、フッターに配置されている。

## Goals / Non-Goals

**Goals:**
- favicon を「あ」青丸 SVG に差し替え、アプリの目的をブラウザタブ・ブックマークで即座に伝える
- キーガイド付近に IME オフの案内を追加し、システム IME の干渉を防ぐ
- Ctrl+J が効かない環境向けに Shift+Ctrl+J の代替を案内する

**Non-Goals:**
- IME をプログラム的に抑制・検知すること（技術的に不可能または不安定）
- OS 別の詳細な IME 操作手順の掲載
- favicon のアニメーションや複数サイズ対応（PNG, ICO 等）

## Decisions

### favicon は SVG 単体で対応する

PNG/ICO 生成ツールを使わず SVG 1 ファイルで完結させる。現代ブラウザは SVG favicon をサポートしており、メンテナンスコストが最小になる。

デザイン：
- viewBox: `0 0 32 32`
- 背景円: `cx="16" cy="16" r="15" fill="#1565c0"`
- テキスト: `"あ"` / `fill="white"` / `font-size="22"` / `font-family` はセリフ系（明朝）を指定し、ゴシックへのフォールバックも設ける
- `index.html` の `<link rel="icon">` の `type` を `image/svg+xml`、`href` を `/favicon.svg` に変更

### IME 注意書きは KeyGuide 内に配置する

別コンポーネントを作らず `KeyGuide.tsx` の先頭に `<p>` 一行として置く。キーガイドと同じフッター領域に収まり、入力エリアの邪魔にならない。

### Ctrl+J の補足は description のみ更新する

`KEY_BINDINGS` 配列の Ctrl+J エントリの `description` 文字列を更新するだけ。key 列（`<kbd>` 表示）は `Ctrl+J` のままとし、description 末尾に `※ Chrome など一部ブラウザでは Shift+Ctrl+J` を追記する。

エンジン側は `key === 'j' || key === 'J'` で判定するため、Shift+Ctrl+J（`key='J'`, `ctrlKey=true`）は既にハンドル済みであり、エンジンの変更は不要。

## Risks / Trade-offs

- **SVG favicon のフォント依存** → フォントが端末にない場合、「あ」の字形が異なる可能性がある。`font-family` に複数フォールバックを指定して軽減する。視認性には影響しない。
- **IME 案内の網羅性** → ソフト名を列挙しても全 IME を網羅することはできない。「など」を付記して限定しない表現にする。
