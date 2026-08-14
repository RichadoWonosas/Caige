import type { GameState } from '../domain/game'

const DB_NAME = 'caige-mvp'
const STORE_NAME = 'game-state'
const KEY = 'current'

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) request.result.createObjectStore(STORE_NAME)
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function saveGameState(state: GameState): Promise<void> {
  const db = await openDatabase()
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    transaction.objectStore(STORE_NAME).put(state, KEY)
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
  db.close()
}

export async function loadGameState(): Promise<GameState | null> {
  const db = await openDatabase()
  const value = await new Promise<GameState | null>((resolve, reject) => {
    const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(KEY)
    request.onsuccess = () => resolve((request.result as GameState | undefined) ?? null)
    request.onerror = () => reject(request.error)
  })
  db.close()
  return value
}

export function validateImportedState(value: unknown): value is GameState {
  if (!value || typeof value !== 'object') return false
  const state = value as Partial<GameState>
  return state.schemaVersion === 1 &&
    (state.mode === 'song-battle-royale' || state.mode === 'give-your-letters') &&
    Array.isArray(state.plain?.questions) && Array.isArray(state.battleRoyale?.players) &&
    Array.isArray(state.battleRoyale?.questions)
}
