import { useState, useCallback, useRef, useEffect } from 'react'
import { SkkState } from '../../skk/types'
import { Difficulty } from '../../data/questions'
import { GameRecord } from '../../hooks/useGameScore'
import { useTypingGame } from '../../hooks/useTypingGame'
import { GameStart } from './GameStart'
import { GameQuestion } from './GameQuestion'
import { GameResult } from './GameResult'
import { trackEvent } from '../../lib/analytics'

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

  useEffect(() => {
    return () => {
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current)
    }
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
    const result = game.submitAnswer(skkState.committed)
    if (result.outcome === 'correct') {
      resetSkkEngine()
    }
  }, [skkState, game, resetSkkEngine, showWarning])

  const handleGameKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        e.stopPropagation()
        // Word registration mode: let the engine handle Enter (confirm/reject the word)
        if (skkState.wordRegistration) {
          handleKeyDown(e)
          return
        }
        handleEnterPress()
        return
      }
      handleKeyDown(e)
    },
    [handleKeyDown, handleEnterPress, skkState.wordRegistration],
  )

  const handleQuit = useCallback(() => {
    trackEvent('game_abandon', {
      difficulty: game.gameState.difficulty,
      questions_done: game.gameState.currentIndex,
    })
    game.quitGame()
    resetSkkEngine()
  }, [game.gameState.difficulty, game.gameState.currentIndex, game.quitGame, resetSkkEngine])

  const handlePlayAgain = useCallback(() => {
    game.playAgain()
    resetSkkEngine()
  }, [game.playAgain, resetSkkEngine])

  const handleSwitchToFree = useCallback(() => {
    game.quitGame()
    onSwitchToFree()
  }, [game.quitGame, onSwitchToFree])

  const { gameState } = game

  const handleStart = useCallback(
    (difficulty: Difficulty) => {
      trackEvent('game_start', { difficulty })
      game.startGame(difficulty)
    },
    [game.startGame],
  )

  if (gameState.phase === 'idle') {
    return <GameStart onStart={handleStart} />
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
