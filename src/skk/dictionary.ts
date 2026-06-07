export interface DictionaryProvider {
  lookup(midashi: string, okurigana: string): string[]
  isReady(): boolean
}

export type DictionaryState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; provider: DictionaryProvider }
  | { status: 'error'; message: string }

// -----------------------------------------------------------------------
// SKK-JISYO parser
// -----------------------------------------------------------------------

function parseJisyo(text: string): Map<string, string[]> {
  const map = new Map<string, string[]>()
  let inEntrySection = false

  for (const line of text.split('\n')) {
    if (!inEntrySection) {
      if (line.startsWith(';; okuri-ari entries')) {
        inEntrySection = true
      }
      continue
    }
    if (line.startsWith(';')) continue
    if (!line.trim()) continue

    const spaceIdx = line.indexOf(' ')
    if (spaceIdx < 0) continue

    const midashi = line.slice(0, spaceIdx)
    const candidatePart = line.slice(spaceIdx + 1)

    // Format: /候補1/候補2/... or /候補/annotation;note/
    const candidates: string[] = []
    const parts = candidatePart.split('/').filter(Boolean)
    for (const part of parts) {
      // Strip annotations (after semicolon)
      const candidate = part.split(';')[0].trim()
      if (candidate) candidates.push(candidate)
    }

    if (candidates.length > 0) {
      map.set(midashi, candidates)
    }
  }

  return map
}

// -----------------------------------------------------------------------
// In-memory dictionary provider
// -----------------------------------------------------------------------

export class MapDictionaryProvider implements DictionaryProvider {
  private map: Map<string, string[]>

  constructor(map: Map<string, string[]>) {
    this.map = map
  }

  lookup(midashi: string, okurigana: string): string[] {
    if (okurigana) {
      // For okurigana, key is midashi + first consonant of okurigana romaji
      // The midashi key in the dict already contains the consonant prefix
      // e.g. midashi="かk", okurigana="く"
      const result = this.map.get(midashi)
      return result ?? []
    }
    return this.map.get(midashi) ?? []
  }

  isReady(): boolean {
    return true
  }
}

// -----------------------------------------------------------------------
// Mock provider (for testing)
// -----------------------------------------------------------------------

export class MockDictionaryProvider implements DictionaryProvider {
  private data: Map<string, string[]>

  constructor(data: Record<string, string[]>) {
    this.data = new Map(Object.entries(data))
  }

  lookup(midashi: string, okurigana: string): string[] {
    if (okurigana) return this.data.get(midashi) ?? []
    return this.data.get(midashi) ?? []
  }

  isReady(): boolean {
    return true
  }
}

// -----------------------------------------------------------------------
// Personal dictionary (localStorage-backed)
// -----------------------------------------------------------------------

const PERSONAL_DICT_KEY = 'web-skk-personal-dict'

export class PersonalDictionaryProvider implements DictionaryProvider {
  private map: Map<string, string[]>

  constructor() {
    this.map = new Map()
    try {
      const stored = localStorage.getItem(PERSONAL_DICT_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          for (const [k, v] of Object.entries(data)) {
            if (Array.isArray(v) && v.every((item) => typeof item === 'string')) {
              this.map.set(k, v as string[])
            }
          }
        }
      }
    } catch {
      // ignore localStorage errors
    }
  }

  lookup(midashi: string, _okurigana: string): string[] {
    return this.map.get(midashi) ?? []
  }

  isReady(): boolean {
    return true
  }

  register(midashiKey: string, word: string): void {
    const existing = this.map.get(midashiKey) ?? []
    const filtered = existing.filter((w) => w !== word)
    this.map.set(midashiKey, [word, ...filtered])
    this.save()
  }

  private save(): void {
    try {
      const data: Record<string, string[]> = {}
      this.map.forEach((v, k) => { data[k] = v })
      localStorage.setItem(PERSONAL_DICT_KEY, JSON.stringify(data))
    } catch {
      // ignore localStorage errors
    }
  }
}

// -----------------------------------------------------------------------
// Compound dictionary (personal + base)
// -----------------------------------------------------------------------

export class CompoundDictionaryProvider implements DictionaryProvider {
  constructor(
    private personal: PersonalDictionaryProvider,
    private base: DictionaryProvider,
  ) {}

  lookup(midashi: string, okurigana: string): string[] {
    const personalCandidates = this.personal.lookup(midashi, okurigana)
    const baseCandidates = this.base.lookup(midashi, okurigana)
    const seen = new Set(personalCandidates)
    const merged = [...personalCandidates]
    for (const c of baseCandidates) {
      if (!seen.has(c)) merged.push(c)
    }
    return merged
  }

  isReady(): boolean {
    return this.base.isReady()
  }
}

// -----------------------------------------------------------------------
// IndexedDB cache
// -----------------------------------------------------------------------

const DB_NAME = 'web-skk'
const DB_VERSION = 1
const STORE_NAME = 'dictionary'
const CACHE_KEY = 'skk-jisyo-l'
const CACHE_VERSION_KEY = 'skk-jisyo-l-version'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function loadFromCache(db: IDBDatabase, version: string): Promise<Map<string, string[]> | null> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const versionReq = store.get(CACHE_VERSION_KEY)
    versionReq.onsuccess = () => {
      if (versionReq.result !== version) {
        resolve(null)
        return
      }
      const dataReq = store.get(CACHE_KEY)
      dataReq.onsuccess = () => {
        if (!dataReq.result) {
          resolve(null)
          return
        }
        const map = new Map<string, string[]>(dataReq.result as [string, string[]][])
        resolve(map)
      }
      dataReq.onerror = () => reject(dataReq.error)
    }
    versionReq.onerror = () => reject(versionReq.error)
  })
}

async function saveToCache(db: IDBDatabase, version: string, map: Map<string, string[]>): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    store.put(version, CACHE_VERSION_KEY)
    store.put([...map.entries()], CACHE_KEY)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

// -----------------------------------------------------------------------
// Loader
// -----------------------------------------------------------------------

export interface DictionaryLoaderConfig {
  url: string
  version: string
  encoding?: string
}

export async function loadDictionary(config: DictionaryLoaderConfig): Promise<DictionaryProvider> {
  const { url, version, encoding = 'euc-jp' } = config

  try {
    const db = await openDB()
    const cached = await loadFromCache(db, version)
    if (cached) {
      return new MapDictionaryProvider(cached)
    }

    const response = await fetch(url)
    if (!response.ok) throw new Error(`Failed to fetch dictionary: ${response.status}`)

    const buffer = await response.arrayBuffer()
    const text = new TextDecoder(encoding).decode(buffer)
    const map = parseJisyo(text)

    // Cache in background (don't block on it)
    saveToCache(db, version, map).catch(() => {
      // Cache failure is non-fatal
    })

    return new MapDictionaryProvider(map)
  } catch (err) {
    throw err instanceof Error ? err : new Error(String(err))
  }
}
