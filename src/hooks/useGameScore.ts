import { useState, useEffect } from 'react'
import { Difficulty } from '../data/questions'

export interface GameRecord {
  date: string
  difficulty: Difficulty
  timeMs: number
  questions: 10
}

const STORAGE_KEY = 'skk-game-records'
const MAX_RECORDS = 50

function readFromStorage(): GameRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as GameRecord[]) : []
  } catch {
    return []
  }
}

export function useGameScore() {
  const [records, setRecords] = useState<GameRecord[]>(readFromStorage)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
    } catch (e) {
      console.error('Failed to save game records to localStorage:', e)
    }
  }, [records])

  function saveRecord(record: GameRecord): void {
    setRecords((prev) => [...prev, record].slice(-MAX_RECORDS))
  }

  return { saveRecord, records }
}
