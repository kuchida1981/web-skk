import { useEffect, useState } from 'react'
import { Question } from '../../data/questions'
import { SkkState } from '../../skk/types'
import { SkkInputArea } from '../SkkInputArea'

interface Props {
  question: Question
  questionNumber: number
  totalQuestions: number
  startTime: number
  mismatchPositions: number[] | null
  warningMessage: string | null
  skkState: SkkState
  onGameKeyDown: (e: KeyboardEvent) => void
  isReady: boolean
  onQuit: () => void
}

function formatTime(ms: number): string {
  const s = Math.floor(ms / 1000)
  const cents = Math.floor((ms % 1000) / 10)
  return `${s}.${String(cents).padStart(2, '0')} 秒`
}

export function GameQuestion({
  question,
  questionNumber,
  totalQuestions,
  startTime,
  mismatchPositions,
  warningMessage,
  skkState,
  onGameKeyDown,
  isReady,
  onQuit,
}: Props) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setElapsed(Date.now() - startTime), 100)
    return () => clearInterval(id)
  }, [startTime])

  const chars = [...question.text]
  const mismatchSet = new Set(mismatchPositions ?? [])

  return (
    <div className="game-question">
      <div className="game-question__header">
        <span className="game-question__progress">
          {questionNumber} / {totalQuestions}
        </span>
        <span className="game-question__timer">{formatTime(elapsed)}</span>
        <button className="game-question__quit" onClick={onQuit}>
          途中終了
        </button>
      </div>

      <div className="game-question__text">
        {chars.map((char, i) => (
          <span
            key={i}
            className={
              mismatchPositions !== null && mismatchSet.has(i)
                ? 'game-question__char--mismatch'
                : ''
            }
          >
            {char}
          </span>
        ))}
        {mismatchPositions !== null && mismatchPositions.some((pos) => pos >= chars.length) && (
          <span className="game-question__char--mismatch" aria-label="余分な入力">&nbsp;</span>
        )}
      </div>

      {warningMessage && (
        <p className="game-question__warning">{warningMessage}</p>
      )}

      <SkkInputArea
        skkState={skkState}
        disabled={!isReady}
        onKeyDown={onGameKeyDown}
      />

      <p className="game-question__hint">入力後 Enter で提出</p>
    </div>
  )
}
