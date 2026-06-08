import { useState, useCallback, useRef } from 'react'
import { SkkState } from '../../skk/types'
import { GameRecord } from '../../hooks/useGameScore'
import { useTypingGame } from '../../hooks/useTypingGame'
import { GameStart } from './GameStart'
import { GameQuestion } from './GameQuestion'
import { GameResult } from './GameResult'

type GameHook = ReturnType<typeof useTypingGame>

interface Props {
  game: GameHook
  skkState: SkkState
  handleKeyDown: (e: KeyboardEvent) => void
  resetSkkEngine: () => void
  records: GameRecord[]
  isReady: boolean
  onSwitchToFree: () => void
}

export function TypingGame({
  game,
  skkState,
  handleKeyDown,
  resetSkkEngine,
  records,
  isReady,
  onSwitchToFree,
}: Props) {
  const [warningMessage, setWarningMessage] = useState<string | null>(null)
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showWarning = useCallback((msg: string) => {
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current)
    setWarningMessage(msg)
    warningTimerRef.current = setTimeout(() => setWarningMessage(null), 2000)
  }, [])

  const handleEnterPress = useCallback(() => {
    if (skkState.phase !== 'direct') {
      showWarning('変換を確定してから Enter を押してください')
      return
    }
    if (skkState.romajiBuffer) {
      showWarning('ローマ字バッファが残っています')
      return
    }
    game.submitAnswer(skkState.committed)
    resetSkkEngine()
  }, [skkState, game, resetSkkEngine, showWarning])

  const handleGameKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        e.stopPropagation()
        handleEnterPress()
        return
      }
      handleKeyDown(e)
    },
    [handleKeyDown, handleEnterPress],
  )

  const handleQuit = useCallback(() => {
    game.quitGame()
    resetSkkEngine()
  }, [game, resetSkkEngine])

  const handlePlayAgain = useCallback(() => {
    game.playAgain()
    resetSkkEngine()
  }, [game, resetSkkEngine])

  const handleSwitchToFree = useCallback(() => {
    game.quitGame()
    onSwitchToFree()
  }, [game, onSwitchToFree])

  const { gameState } = game

  if (gameState.phase === 'idle') {
    return <GameStart onStart={game.startGame} />
  }

  if (gameState.phase === 'result') {
    return (
      <GameResult
        timeMs={gameState.endTime! - gameState.startTime!}
        difficulty={gameState.difficulty!}
        records={records}
        onPlayAgain={handlePlayAgain}
        onSwitchToFree={handleSwitchToFree}
      />
    )
  }

  const currentQuestion = gameState.questions[gameState.currentIndex]

  return (
    <GameQuestion
      question={currentQuestion}
      questionNumber={gameState.currentIndex + 1}
      totalQuestions={gameState.questions.length}
      startTime={gameState.startTime!}
      mismatchPositions={gameState.mismatchPositions}
      warningMessage={warningMessage}
      skkState={skkState}
      onGameKeyDown={handleGameKeyDown}
      isReady={isReady}
      onQuit={handleQuit}
    />
  )
}
