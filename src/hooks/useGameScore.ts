import { useState } from 'react'
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
    return raw ? (JSON.parse(raw) as GameRecord[]) : []
  } catch {
    return []
  }
}

export function useGameScore() {
  const [records, setRecords] = useState<GameRecord[]>(readFromStorage)

  function saveRecord(record: GameRecord): void {
    setRecords((prev) => {
      const updated = [...prev, record].slice(-MAX_RECORDS)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }

  return { saveRecord, records }
}
