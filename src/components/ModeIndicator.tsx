import { SkkMode } from '../skk/types'

const MODE_LABELS: Record<SkkMode, string> = {
  hiragana: 'ひらがな',
  katakana: 'カタカナ',
  ascii: 'ASCII',
  'zenkaku-ascii': '全角ASCII',
}

interface Props {
  mode: SkkMode
}

export function ModeIndicator({ mode }: Props) {
  return (
    <div className="mode-indicator" data-mode={mode}>
      {MODE_LABELS[mode]}
    </div>
  )
}
