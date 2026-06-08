type Binding = { key: string; description: string }

type Section = {
  title: string
  bindings: Binding[]
  detail?: boolean
}

const SECTIONS: Section[] = [
  {
    title: '基本',
    bindings: [
      { key: '大文字 (例: K)', description: 'かな変換開始 (▽モード)' },
      { key: 'Space', description: '変換 / 次の候補へ' },
      { key: 'Enter / Ctrl+J', description: '確定（Ctrl+J はひらがなモードへも切替）※Chrome では Shift+Ctrl+J' },
      { key: 'Ctrl+G', description: 'キャンセル' },
    ],
  },
  {
    title: 'モード切替',
    detail: true,
    bindings: [
      { key: 'Q', description: 'カタカナ ↔ ひらがな切り替え' },
      { key: 'l', description: 'ASCII モードへ' },
      { key: 'L', description: '全角 ASCII モードへ' },
    ],
  },
  {
    title: '▽変換中',
    detail: true,
    bindings: [
      { key: 'Space / Tab', description: '変換開始 / 次の候補へ' },
      { key: '大文字', description: '送り仮名を入力' },
      { key: 'q', description: '見出し語をカタカナで確定' },
      { key: 'Enter / Ctrl+J', description: '変換せずそのまま確定' },
      { key: 'Backspace', description: '1文字削除' },
      { key: 'Ctrl+G', description: 'キャンセルして direct へ' },
    ],
  },
  {
    title: '▼候補選択中',
    detail: true,
    bindings: [
      { key: 'Space / Tab', description: '次の候補へ' },
      { key: 'x / Shift+Tab', description: '前の候補へ' },
      { key: 'Enter / Ctrl+J', description: '候補を確定' },
      { key: 'Backspace', description: '▽モードに戻る' },
    ],
  },
  {
    title: '単語登録',
    detail: true,
    bindings: [
      { key: '（候補なし）', description: '自動で単語登録モードへ' },
      { key: 'Enter / Ctrl+J', description: '入力した単語を登録して確定' },
      { key: 'Ctrl+G', description: '登録をキャンセル' },
    ],
  },
]

export function KeyGuide() {
  return (
    <div className="key-guide">
      <h2 className="key-guide__title">キーガイド</h2>
      {SECTIONS.map((section) => (
        <div
          key={section.title}
          className={`key-guide__section${section.detail ? ' key-guide__detail' : ''}`}
        >
          <h3 className="key-guide__section-title">{section.title}</h3>
          <table className="key-guide__table">
            <tbody>
              {section.bindings.map(({ key, description }) => (
                <tr key={key}>
                  <td className="key-guide__key"><kbd>{key}</kbd></td>
                  <td className="key-guide__desc">{description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}
