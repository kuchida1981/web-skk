import { SkkMode } from '../skk/types'

const MODE_LABELS: Record<SkkMode, string> = {
  hiragana: 'ひらがな',
  katakana: 'カタカナ',
  ascii: 'ASCII',
  'zenkaku-ascii': '全角ASCII',
}

const ASCII_MODES = new Set<SkkMode>(['ascii', 'zenkaku-ascii'])

interface Props {
  mode: SkkMode
}

export function ModeIndicator({ mode }: Props) {
  const isAsciiMode = ASCII_MODES.has(mode)
  return (
    <div className="mode-indicator-wrapper">
      <div className="mode-indicator" data-mode={mode}>
        {MODE_LABELS[mode]}
      </div>
      {isAsciiMode && (
        <span className="mode-indicator-hint">
          Ctrl+J でひらがなへ
        </span>
      )}
    </div>
  )
}
