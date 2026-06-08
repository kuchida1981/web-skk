import { useState, useCallback } from 'react'
import { Question, Difficulty, getQuestionsByDifficulty, pickRandom } from '../data/questions'
import { GameRecord } from './useGameScore'

export type GamePhase = 'idle' | 'playing' | 'result'

export interface GameState {
  phase: GamePhase
  difficulty: Difficulty | null
  questions: Question[]
  currentIndex: number
  startTime: number | null
  endTime: number | null
  mismatchPositions: number[] | null
}

export type SubmitResult =
  | { outcome: 'correct'; finished: boolean }
  | { outcome: 'incorrect'; mismatchPositions: number[] }

const QUESTION_COUNT = 10

const INITIAL_GAME_STATE: GameState = {
  phase: 'idle',
  difficulty: null,
  questions: [],
  currentIndex: 0,
  startTime: null,
  endTime: null,
  mismatchPositions: null,
}

export function useTypingGame(saveRecord: (record: GameRecord) => void) {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE)

  const startGame = useCallback((difficulty: Difficulty) => {
    const pool = getQuestionsByDifficulty(difficulty)
    const questions = pickRandom(pool, QUESTION_COUNT)
    setGameState({
      phase: 'playing',
      difficulty,
      questions,
      currentIndex: 0,
      startTime: Date.now(),
      endTime: null,
      mismatchPositions: null,
    })
  }, [])

  const submitAnswer = useCallback(
    (committed: string): SubmitResult => {
      if (gameState.phase !== 'playing') {
        return { outcome: 'correct', finished: false }
      }

      const target = gameState.questions[gameState.currentIndex].text
      const targetChars = [...target]
      const committedChars = [...committed]

      if (committed === target) {
        const isLast = gameState.currentIndex === gameState.questions.length - 1
        if (isLast) {
          const now = Date.now()
          saveRecord({
            date: new Date(now).toISOString(),
            difficulty: gameState.difficulty!,
            timeMs: now - gameState.startTime!,
            questions: 10,
          })
          setGameState((prev) => ({ ...prev, phase: 'result', endTime: now, mismatchPositions: null }))
        } else {
          setGameState((prev) => ({ ...prev, currentIndex: prev.currentIndex + 1, mismatchPositions: null }))
        }
        return { outcome: 'correct', finished: isLast }
      }

      const mismatchPositions: number[] = []
      const maxLen = Math.max(targetChars.length, committedChars.length)
      for (let i = 0; i < maxLen; i++) {
        if (committedChars[i] !== targetChars[i]) mismatchPositions.push(i)
      }
      setGameState((prev) => ({ ...prev, mismatchPositions }))
      return { outcome: 'incorrect', mismatchPositions }
    },
    [gameState, saveRecord],
  )

  const clearMismatch = useCallback(() => {
    setGameState((prev) => ({ ...prev, mismatchPositions: null }))
  }, [])

  const quitGame = useCallback(() => {
    setGameState(INITIAL_GAME_STATE)
  }, [])

  const playAgain = useCallback(() => {
    setGameState((prev) => {
      if (!prev.difficulty) return prev
      const pool = getQuestionsByDifficulty(prev.difficulty)
      const questions = pickRandom(pool, QUESTION_COUNT)
      return {
        phase: 'playing',
        difficulty: prev.difficulty,
        questions,
        currentIndex: 0,
        startTime: Date.now(),
        endTime: null,
        mismatchPositions: null,
      }
    })
  }, [])

  return { gameState, startGame, submitAnswer, clearMismatch, quitGame, playAgain }
}
