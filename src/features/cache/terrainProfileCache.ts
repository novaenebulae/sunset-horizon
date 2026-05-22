import type { TerrainProfileResult } from '@/features/terrain/terrainTypes'
import {
  TERRAIN_CACHE_SCHEMA_VERSION,
  TERRAIN_PROFILE_ALGORITHM_VERSION,
  type TerrainProfileCacheEntry,
  type TerrainProfileCacheStats,
} from './cacheTypes'
import {
  TERRAIN_PROFILE_CACHE_DB_NAME,
  TERRAIN_PROFILE_CACHE_STORE_NAME,
  TERRAIN_PROFILE_CACHE_TTL_MS,
} from './cacheSettings'
import { notifyTerrainProfileCacheChanged } from './terrainProfileCacheNotify'

let cacheAvailable: boolean | null = null

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function parseElevationPoint(raw: unknown): boolean {
  if (!isRecord(raw)) return false
  return (
    typeof raw.lat === 'number' &&
    Number.isFinite(raw.lat) &&
    typeof raw.lon === 'number' &&
    Number.isFinite(raw.lon) &&
    typeof raw.elevationM === 'number' &&
    Number.isFinite(raw.elevationM) &&
    typeof raw.distanceM === 'number' &&
    Number.isFinite(raw.distanceM)
  )
}

function parseTerrainProfileResult(raw: unknown): TerrainProfileResult | null {
  if (!isRecord(raw)) return null

  const observer = raw.observer
  if (
    !isRecord(observer) ||
    typeof observer.lat !== 'number' ||
    typeof observer.lon !== 'number' ||
    typeof observer.elevationM !== 'number' ||
    !Number.isFinite(observer.lat) ||
    !Number.isFinite(observer.lon) ||
    !Number.isFinite(observer.elevationM)
  ) {
    return null
  }

  const points = raw.points
  if (!Array.isArray(points) || points.length < 2) {
    return null
  }
  if (!points.every(parseElevationPoint)) {
    return null
  }

  const source = raw.source
  if (source !== 'ign-geoplateforme' && source !== 'mock') {
    return null
  }

  const azimuthDeg = raw.azimuthDeg
  if (typeof azimuthDeg !== 'number' || !Number.isFinite(azimuthDeg)) {
    return null
  }

  return {
    observer: {
      lat: observer.lat,
      lon: observer.lon,
      elevationM: observer.elevationM,
    },
    azimuthDeg,
    points: points as TerrainProfileResult['points'],
    source,
  }
}

function parseCacheEntry(raw: unknown): TerrainProfileCacheEntry | null {
  if (!isRecord(raw)) return null

  const key = typeof raw.key === 'string' ? raw.key : ''
  const createdAt = typeof raw.createdAt === 'string' ? raw.createdAt : ''
  const cacheVersion = raw.cacheVersion
  const algorithmVersion =
    typeof raw.algorithmVersion === 'string' ? raw.algorithmVersion : ''
  const profile = parseTerrainProfileResult(raw.profile)

  if (
    !key ||
    !createdAt ||
    cacheVersion !== TERRAIN_CACHE_SCHEMA_VERSION ||
    algorithmVersion !== TERRAIN_PROFILE_ALGORITHM_VERSION ||
    !profile
  ) {
    return null
  }

  return {
    key,
    profile,
    createdAt,
    cacheVersion: TERRAIN_CACHE_SCHEMA_VERSION,
    algorithmVersion,
  }
}

function isEntryExpired(entry: TerrainProfileCacheEntry): boolean {
  const createdMs = Date.parse(entry.createdAt)
  if (!Number.isFinite(createdMs)) {
    return true
  }
  return Date.now() - createdMs > TERRAIN_PROFILE_CACHE_TTL_MS
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(TERRAIN_PROFILE_CACHE_DB_NAME, 1)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(TERRAIN_PROFILE_CACHE_STORE_NAME)) {
        db.createObjectStore(TERRAIN_PROFILE_CACHE_STORE_NAME, { keyPath: 'key' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('IndexedDB open failed'))
  })
}

function idbRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () =>
      reject(request.error ?? new Error('IndexedDB request failed'))
  })
}

async function withStore<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => Promise<T>,
): Promise<T> {
  const db = await openDatabase()
  try {
    const transaction = db.transaction(TERRAIN_PROFILE_CACHE_STORE_NAME, mode)
    const store = transaction.objectStore(TERRAIN_PROFILE_CACHE_STORE_NAME)
    const result = await run(store)
    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve()
      transaction.onerror = () =>
        reject(transaction.error ?? new Error('IndexedDB transaction failed'))
    })
    return result
  } finally {
    db.close()
  }
}

export function isTerrainProfileCacheAvailable(): boolean {
  if (cacheAvailable !== null) {
    return cacheAvailable
  }
  try {
    if (typeof indexedDB === 'undefined') {
      cacheAvailable = false
      return false
    }
    cacheAvailable = true
    return true
  } catch {
    cacheAvailable = false
    return false
  }
}

/** Reset availability probe — for tests only. */
export function resetTerrainProfileCacheAvailabilityForTests(): void {
  cacheAvailable = null
}

export async function getCachedTerrainProfile(
  key: string,
): Promise<TerrainProfileResult | null> {
  if (!isTerrainProfileCacheAvailable()) {
    return null
  }

  try {
    const raw = await withStore('readonly', (store) => idbRequest(store.get(key)))
    const entry = parseCacheEntry(raw)
    if (!entry) {
      if (raw !== undefined) {
        void deleteCachedTerrainProfile(key)
      }
      return null
    }

    if (isEntryExpired(entry)) {
      void deleteCachedTerrainProfile(key)
      return null
    }

    return entry.profile
  } catch {
    return null
  }
}

export async function setCachedTerrainProfile(
  key: string,
  profile: TerrainProfileResult,
): Promise<void> {
  if (!isTerrainProfileCacheAvailable()) {
    return
  }

  const entry: TerrainProfileCacheEntry = {
    key,
    profile,
    createdAt: new Date().toISOString(),
    cacheVersion: TERRAIN_CACHE_SCHEMA_VERSION,
    algorithmVersion: TERRAIN_PROFILE_ALGORITHM_VERSION,
  }

  try {
    await withStore('readwrite', (store) =>
      idbRequest(store.put(entry)).then(() => undefined),
    )
    notifyTerrainProfileCacheChanged()
  } catch {
    // Non-blocking: calculation must continue.
  }
}

export async function deleteCachedTerrainProfile(key: string): Promise<void> {
  if (!isTerrainProfileCacheAvailable()) {
    return
  }

  try {
    await withStore('readwrite', (store) =>
      idbRequest(store.delete(key)).then(() => undefined),
    )
    notifyTerrainProfileCacheChanged()
  } catch {
    // ignore
  }
}

export async function clearTerrainProfileCache(): Promise<void> {
  if (!isTerrainProfileCacheAvailable()) {
    return
  }

  try {
    await withStore('readwrite', (store) =>
      idbRequest(store.clear()).then(() => undefined),
    )
    notifyTerrainProfileCacheChanged()
  } catch {
    // ignore
  }
}

export async function getTerrainProfileCacheStats(): Promise<TerrainProfileCacheStats> {
  if (!isTerrainProfileCacheAvailable()) {
    return { available: false, entryCount: 0, approximateBytes: 0 }
  }

  try {
    const entries = await withStore('readonly', (store) => idbRequest(store.getAll()))
    if (!Array.isArray(entries)) {
      return { available: true, entryCount: 0, approximateBytes: 0 }
    }

    let entryCount = 0
    let approximateBytes = 0

    for (const raw of entries) {
      const entry = parseCacheEntry(raw)
      if (!entry || isEntryExpired(entry)) {
        if (isRecord(raw) && typeof raw.key === 'string') {
          void deleteCachedTerrainProfile(raw.key)
        }
        continue
      }
      entryCount += 1
      approximateBytes += JSON.stringify(entry).length
    }

    return { available: true, entryCount, approximateBytes }
  } catch {
    return { available: false, entryCount: 0, approximateBytes: 0 }
  }
}
