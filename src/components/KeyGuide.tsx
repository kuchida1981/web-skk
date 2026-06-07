import { useState } from 'react'

const KEY_BINDINGS = [
  { key: '大文字 (例: K)', description: 'かな変換開始 (▽モード) ※ひらがな・カタカナモードのみ' },
  { key: 'Space', description: '変換候補を表示 / 次の候補へ' },
  { key: 'Enter', description: '現在の入力を確定・改行' },
  { key: 'Ctrl+G', description: '変換をキャンセル' },
  { key: 'Ctrl+J', description: 'ひらがなモードへ（どのモードからも使用可）' },
  { key: 'Q', description: 'カタカナ ↔ ひらがな切り替え ※ひらがな・カタカナモードのみ' },
  { key: 'l', description: 'ASCIIモードへ ※ひらがな・カタカナモードのみ' },
  { key: 'L', description: '全角ASCIIモードへ ※ひらがな・カタカナモードのみ' },
  { key: 'Backspace', description: '1文字削除' },
]

export function KeyGuide() {
  const [open, setOpen] = useState(true)

  return (
    <div className="key-guide">
      <button
        className="key-guide__toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        キーガイド {open ? '▲' : '▼'}
      </button>
      {open && (
        <table className="key-guide__table">
          <tbody>
            {KEY_BINDINGS.map(({ key, description }) => (
              <tr key={key}>
                <td className="key-guide__key"><kbd>{key}</kbd></td>
                <td className="key-guide__desc">{description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
