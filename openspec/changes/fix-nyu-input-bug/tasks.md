## 1. バグ修正

- [ ] 1.1 `src/skk/romaji-table.ts` の `convertRomaji` 内 `n` ハンドラーに「2文字プレフィックスがテーブルに存在する場合はスキップ」チェックを追加する

## 2. ユニットテスト追加（romaji-table.test.ts）

- [ ] 2.1 `convertRomaji('ny')` が `{ type: 'pending' }` を返すことを確認するテストを追加する
- [ ] 2.2 `convertRomaji('nyu')` が `{ type: 'converted', kana: 'にゅ', remaining: '' }` を返すことを確認するテストを追加する
- [ ] 2.3 `convertRomaji('nya')` が `{ type: 'converted', kana: 'にゃ', remaining: '' }` を返すことを確認するテストを追加する
- [ ] 2.4 `convertRomaji('nyo')` が `{ type: 'converted', kana: 'にょ', remaining: '' }` を返すことを確認するテストを追加する
- [ ] 2.5 `convertRomaji('nk')` が引き続き `{ type: 'converted', kana: 'ん', remaining: 'k' }` を返すことを確認するリグレッションテストを追加する

## 3. 統合テスト追加（engine.test.ts）

- [ ] 3.1 ひらがな直接入力で `n, y, u` → committed `にゅ` となることを確認するテストを追加する
- [ ] 3.2 変換モードで `N, y, u` → midashi `にゅ` となることを確認するテストを追加する

## 4. 動作確認

- [ ] 4.1 `npm test` を実行し全テストがグリーンになることを確認する
