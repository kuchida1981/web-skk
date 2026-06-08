import { Difficulty } from '../../data/questions'
import { GameRecord } from '../../hooks/useGameScore'

interface Props {
  timeMs: number
  difficulty: Difficulty
  records: GameRecord[]
  onPlayAgain: () => void
  onSwitchToFree: () => void
}

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: '初級',
  normal: '中級',
  hard: '上級',
}

function formatTime(ms: number): string {
  const s = Math.floor(ms / 1000)
  const cents = Math.floor((ms % 1000) / 10)
  return `${s}.${String(cents).padStart(2, '0')} 秒`
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function GameResult({ timeMs, difficulty, records, onPlayAgain, onSwitchToFree }: Props) {
  const recentRecords = [...records].reverse().slice(0, 10)

  return (
    <div className="game-result">
      <h2 className="game-result__title">完了!</h2>
      <div className="game-result__score">
        <span className="game-result__time">{formatTime(timeMs)}</span>
        <span className="game-result__difficulty">{DIFFICULTY_LABEL[difficulty]}</span>
      </div>

      <div className="game-result__actions">
        <button className="game-result__btn game-result__btn--primary" onClick={onPlayAgain}>
          もう一度
        </button>
        <button className="game-result__btn" onClick={onSwitchToFree}>
          フリー入力へ
        </button>
      </div>

      <div className="game-result__history">
        <h3 className="game-result__history-title">これまでの成績</h3>
        {recentRecords.length === 0 ? (
          <p className="game-result__no-records">まだ記録がありません</p>
        ) : (
          <table className="game-result__table">
            <thead>
              <tr>
                <th>日時</th>
                <th>難易度</th>
                <th>タイム</th>
              </tr>
            </thead>
            <tbody>
              {recentRecords.map((r, i) => (
                <tr key={i}>
                  <td>{formatDate(r.date)}</td>
                  <td>{DIFFICULTY_LABEL[r.difficulty]}</td>
                  <td>{formatTime(r.timeMs)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
