import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTypingGame } from './useTypingGame'

vi.mock('../data/questions', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../data/questions')>()
  // Override pickRandom to always return the first N questions deterministically
  return {
    ...actual,
    pickRandom: (qs: typeof actual.QUESTIONS, count: number) => qs.slice(0, count),
  }
})

describe('useTypingGame', () => {
  const saveRecord = vi.fn()

  beforeEach(() => {
    saveRecord.mockClear()
  })

  it('starts in idle phase', () => {
    const { result } = renderHook(() => useTypingGame(saveRecord))
    expect(result.current.gameState.phase).toBe('idle')
  })

  it('transitions to playing after startGame', () => {
    const { result } = renderHook(() => useTypingGame(saveRecord))
    act(() => { result.current.startGame('easy') })
    expect(result.current.gameState.phase).toBe('playing')
    expect(result.current.gameState.difficulty).toBe('easy')
    expect(result.current.gameState.questions).toHaveLength(10)
    expect(result.current.gameState.currentIndex).toBe(0)
  })

  it('advances to next question on correct answer', () => {
    const { result } = renderHook(() => useTypingGame(saveRecord))
    act(() => { result.current.startGame('easy') })

    const firstQuestion = result.current.gameState.questions[0]
    let submitResult: ReturnType<typeof result.current.submitAnswer> | undefined

    act(() => {
      submitResult = result.current.submitAnswer(firstQuestion.text)
    })

    expect(submitResult!.outcome).toBe('correct')
    expect((submitResult as { outcome: 'correct'; finished: boolean }).finished).toBe(false)
    expect(result.current.gameState.currentIndex).toBe(1)
    expect(result.current.gameState.mismatchPositions).toBeNull()
  })

  it('sets mismatch positions on incorrect answer', () => {
    const { result } = renderHook(() => useTypingGame(saveRecord))
    act(() => { result.current.startGame('easy') })

    let submitResult: ReturnType<typeof result.current.submitAnswer> | undefined
    act(() => {
      submitResult = result.current.submitAnswer('まちがい')
    })

    expect(submitResult!.outcome).toBe('incorrect')
    expect(result.current.gameState.mismatchPositions).not.toBeNull()
    expect(result.current.gameState.currentIndex).toBe(0) // same question
  })

  it('completes game after 10 correct answers and calls saveRecord', () => {
    const { result } = renderHook(() => useTypingGame(saveRecord))
    act(() => { result.current.startGame('easy') })

    // Submit each answer in its own act() to avoid stale closure
    for (let i = 0; i < 10; i++) {
      act(() => {
        const q = result.current.gameState.questions[result.current.gameState.currentIndex]
        result.current.submitAnswer(q.text)
      })
    }

    expect(result.current.gameState.phase).toBe('result')
    expect(result.current.gameState.endTime).not.toBeNull()
    expect(saveRecord).toHaveBeenCalledTimes(1)
    expect(saveRecord.mock.calls[0][0].difficulty).toBe('easy')
    expect(saveRecord.mock.calls[0][0].questions).toBe(10)
  })

  it('quitGame resets to idle without saving', () => {
    const { result } = renderHook(() => useTypingGame(saveRecord))
    act(() => { result.current.startGame('easy') })
    act(() => { result.current.quitGame() })

    expect(result.current.gameState.phase).toBe('idle')
    expect(saveRecord).not.toHaveBeenCalled()
  })

  it('playAgain restarts with same difficulty', () => {
    const { result } = renderHook(() => useTypingGame(saveRecord))
    act(() => { result.current.startGame('normal') })

    for (let i = 0; i < 10; i++) {
      act(() => {
        const q = result.current.gameState.questions[result.current.gameState.currentIndex]
        result.current.submitAnswer(q.text)
      })
    }
    expect(result.current.gameState.phase).toBe('result')

    act(() => { result.current.playAgain() })
    expect(result.current.gameState.phase).toBe('playing')
    expect(result.current.gameState.difficulty).toBe('normal')
    expect(result.current.gameState.currentIndex).toBe(0)
  })

  it('mismatch detects all differing positions', () => {
    const { result } = renderHook(() => useTypingGame(saveRecord))
    act(() => { result.current.startGame('easy') })

    // Submit empty string - all chars should mismatch
    act(() => { result.current.submitAnswer('') })

    const target = result.current.gameState.questions[0].text
    const mismatch = result.current.gameState.mismatchPositions
    expect(mismatch).not.toBeNull()
    expect(mismatch!.length).toBe([...target].length)
  })

  it('Unicode-safe: treats each codepoint as a character', () => {
    const { result } = renderHook(() => useTypingGame(saveRecord))
    act(() => { result.current.startGame('easy') })

    const target = result.current.gameState.questions[0].text
    act(() => { result.current.submitAnswer(target) })
    expect(result.current.gameState.currentIndex).toBe(1)
  })
})
