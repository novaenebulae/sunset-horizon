import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { buildTerrainProfileCacheKey } from './cacheKey'
import {
  TERRAIN_PROFILE_CACHE_DB_NAME,
  TERRAIN_PROFILE_CACHE_STORE_NAME,
  TERRAIN_PROFILE_CACHE_TTL_MS,
} from './cacheSettings'
import {
  TERRAIN_CACHE_SCHEMA_VERSION,
  TERRAIN_PROFILE_ALGORITHM_VERSION,
} from './cacheTypes'
import * as terrainProfileCache from './terrainProfileCache'
import type { TerrainProfileResult } from '@/features/terrain/terrainTypes'

const SAMPLE_PROFILE: TerrainProfileResult = {
  observer: { lat: 48.64, lon: 6.19, elevationM: 230 },
  azimuthDeg: 246,
  source: 'ign-geoplateforme',
  points: [
    { lat: 48.64, lon: 6.19, elevationM: 230, distanceM: 0 },
    { lat: 48.641, lon: 6.191, elevationM: 210, distanceM: 150 },
    { lat: 48.642, lon: 6.192, elevationM: 190, distanceM: 300 },
  ],
}

const CACHE_KEY = buildTerrainProfileCacheKey({
  observer: { lat: 48.643098, lon: 6.189897 },
  azimuthDeg: 246.04,
  maxDistanceM: 30_000,
  stepM: 150,
  provider: 'ign',
})

describe('terrainProfileCache', () => {
  beforeEach(async () => {
    terrainProfileCache.resetTerrainProfileCacheAvailabilityForTests()
    await terrainProfileCache.clearTerrainProfileCache()
  })

  afterEach(async () => {
    if (typeof indexedDB !== 'undefined') {
      await terrainProfileCache.clearTerrainProfileCache()
    }
    terrainProfileCache.resetTerrainProfileCacheAvailabilityForTests()
  })

  it('reports cache available with fake IndexedDB', () => {
    expect(terrainProfileCache.isTerrainProfileCacheAvailable()).toBe(true)
  })

  it('returns null on cache miss', async () => {
    const result = await terrainProfileCache.getCachedTerrainProfile(CACHE_KEY)
    expect(result).toBeNull()
  })

  it('stores and reads a profile on cache hit', async () => {
    await terrainProfileCache.setCachedTerrainProfile(CACHE_KEY, SAMPLE_PROFILE)
    const cached = await terrainProfileCache.getCachedTerrainProfile(CACHE_KEY)
    expect(cached).not.toBeNull()
    expect(cached?.observer.elevationM).toBe(230)
    expect(cached?.points).toHaveLength(3)
  })

  it('clears all cached entries', async () => {
    await terrainProfileCache.setCachedTerrainProfile(CACHE_KEY, SAMPLE_PROFILE)
    await terrainProfileCache.clearTerrainProfileCache()
    expect(await terrainProfileCache.getCachedTerrainProfile(CACHE_KEY)).toBeNull()
    const stats = await terrainProfileCache.getTerrainProfileCacheStats()
    expect(stats.entryCount).toBe(0)
  })

  it('returns null for expired entries', async () => {
    const expiredEntry = {
      key: CACHE_KEY,
      profile: SAMPLE_PROFILE,
      createdAt: new Date(
        Date.now() - TERRAIN_PROFILE_CACHE_TTL_MS - 60_000,
      ).toISOString(),
      cacheVersion: TERRAIN_CACHE_SCHEMA_VERSION,
      algorithmVersion: TERRAIN_PROFILE_ALGORITHM_VERSION,
    }

    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(TERRAIN_PROFILE_CACHE_DB_NAME, 1)
      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains(TERRAIN_PROFILE_CACHE_STORE_NAME)) {
          db.createObjectStore(TERRAIN_PROFILE_CACHE_STORE_NAME, {
            keyPath: 'key',
          })
        }
      }
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const db = request.result
        const tx = db.transaction(TERRAIN_PROFILE_CACHE_STORE_NAME, 'readwrite')
        tx.objectStore(TERRAIN_PROFILE_CACHE_STORE_NAME).put(expiredEntry)
        tx.oncomplete = () => {
          db.close()
          resolve()
        }
        tx.onerror = () => reject(tx.error)
      }
    })

    expect(await terrainProfileCache.getCachedTerrainProfile(CACHE_KEY)).toBeNull()
  })

  it('does not throw when IndexedDB is unavailable', async () => {
    const originalIndexedDb = globalThis.indexedDB
    try {
      // @ts-expect-error simulate private mode / blocked storage
      delete globalThis.indexedDB
      terrainProfileCache.resetTerrainProfileCacheAvailabilityForTests()

      await expect(
        terrainProfileCache.setCachedTerrainProfile(CACHE_KEY, SAMPLE_PROFILE),
      ).resolves.toBeUndefined()
      await expect(
        terrainProfileCache.getCachedTerrainProfile(CACHE_KEY),
      ).resolves.toBeNull()
      await expect(
        terrainProfileCache.clearTerrainProfileCache(),
      ).resolves.toBeUndefined()
    } finally {
      globalThis.indexedDB = originalIndexedDb
      terrainProfileCache.resetTerrainProfileCacheAvailabilityForTests()
    }
  })

  it('tracks approximate cache size in stats', async () => {
    await terrainProfileCache.setCachedTerrainProfile(CACHE_KEY, SAMPLE_PROFILE)
    const stats = await terrainProfileCache.getTerrainProfileCacheStats()
    expect(stats.available).toBe(true)
    expect(stats.entryCount).toBe(1)
    expect(stats.approximateBytes).toBeGreaterThan(0)
  })
})
