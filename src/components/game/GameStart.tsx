import { Difficulty } from '../../data/questions'

interface Props {
  onStart: (difficulty: Difficulty) => void
}

const DIFFICULTIES: { value: Difficulty; label: string; description: string }[] = [
  { value: 'easy',   label: '初級', description: 'ひらがな・カタカナのみ' },
  { value: 'normal', label: '中級', description: '漢字変換あり' },
  { value: 'hard',   label: '上級', description: '送り仮名あり' },
]

export function GameStart({ onStart }: Props) {
  return (
    <div className="game-start">
      <h2 className="game-start__title">タイピングゲーム</h2>
      <p className="game-start__desc">難易度を選んでスタート。10問に Enter で回答します。</p>
      <div className="game-start__buttons">
        {DIFFICULTIES.map(({ value, label, description }) => (
          <button
            key={value}
            className={`game-start__btn game-start__btn--${value}`}
            onClick={() => onStart(value)}
          >
            <span className="game-start__btn-label">{label}</span>
            <span className="game-start__btn-desc">{description}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
