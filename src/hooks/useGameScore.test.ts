import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGameScore, GameRecord } from './useGameScore'

const STORAGE_KEY = 'skk-game-records'

function makeRecord(overrides: Partial<GameRecord> = {}): GameRecord {
  return {
    date: new Date().toISOString(),
    difficulty: 'easy',
    timeMs: 30000,
    questions: 10,
    ...overrides,
  }
}

let store: Record<string, string> = {}
const localStorageMock = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value },
  removeItem: (key: string) => { delete store[key] },
  clear: () => { store = {} },
}

beforeAll(() => {
  vi.stubGlobal('localStorage', localStorageMock)
})

beforeEach(() => {
  store = {}
})

describe('useGameScore', () => {
  it('starts with empty records when localStorage is empty', () => {
    const { result } = renderHook(() => useGameScore())
    expect(result.current.records).toEqual([])
  })

  it('loads existing records from localStorage on mount', () => {
    const existing = [makeRecord({ timeMs: 12000 })]
    store[STORAGE_KEY] = JSON.stringify(existing)

    const { result } = renderHook(() => useGameScore())
    expect(result.current.records).toHaveLength(1)
    expect(result.current.records[0].timeMs).toBe(12000)
  })

  it('saveRecord appends and persists to localStorage', () => {
    const { result } = renderHook(() => useGameScore())
    const record = makeRecord({ difficulty: 'hard', timeMs: 60000 })

    act(() => { result.current.saveRecord(record) })

    expect(result.current.records).toHaveLength(1)
    expect(result.current.records[0].difficulty).toBe('hard')

    const stored = JSON.parse(store[STORAGE_KEY])
    expect(stored).toHaveLength(1)
    expect(stored[0].timeMs).toBe(60000)
  })

  it('keeps at most 50 records, discarding oldest', () => {
    const initial = Array.from({ length: 50 }, (_, i) =>
      makeRecord({ timeMs: i * 1000 }),
    )
    store[STORAGE_KEY] = JSON.stringify(initial)

    const { result } = renderHook(() => useGameScore())
    act(() => { result.current.saveRecord(makeRecord({ timeMs: 999999 })) })

    expect(result.current.records).toHaveLength(50)
    expect(result.current.records[49].timeMs).toBe(999999)
    expect(result.current.records[0].timeMs).toBe(1000)
  })

  it('handles corrupted localStorage gracefully', () => {
    store[STORAGE_KEY] = 'not-valid-json{{{'
    const { result } = renderHook(() => useGameScore())
    expect(result.current.records).toEqual([])
  })
})
