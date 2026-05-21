import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  SAVED_SPOTS_STORAGE_KEY,
  SpotStorageError,
} from './spotTypes'
import {
  buildDefaultSpotName,
  clearSavedSpots,
  getSavedSpots,
  migrateStoragePayload,
  readStoragePayload,
  removeSpot,
  saveSpot,
  updateSpot,
} from './spotStorage'

function createMemoryStorage(): Storage {
  const store = new Map<string, string>()
  return {
    get length() {
      return store.size
    },
    clear() {
      store.clear()
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null
    },
    removeItem(key: string) {
      store.delete(key)
    },
    setItem(key: string, value: string) {
      store.set(key, value)
    },
  }
}

describe('spotStorage', () => {
  let memoryStorage: Storage

  beforeEach(() => {
    memoryStorage = createMemoryStorage()
    vi.stubGlobal('localStorage', memoryStorage)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('saves and reads a spot', () => {
    const saved = saveSpot({
      name: '  Ma côte  ',
      latitude: 48.06,
      longitude: -4.6,
      elevationM: 79,
    })

    expect(saved.name).toBe('Ma côte')
    expect(saved.latitude).toBe(48.06)
    expect(saved.elevationM).toBe(79)
    expect(getSavedSpots()).toHaveLength(1)
    expect(getSavedSpots()[0].id).toBe(saved.id)
  })

  it('reads multiple spots in order', () => {
    saveSpot({ name: 'A', latitude: 48, longitude: 2 })
    saveSpot({ name: 'B', latitude: 43, longitude: 1 })
    expect(getSavedSpots().map((s) => s.name)).toEqual(['A', 'B'])
  })

  it('removes a spot', () => {
    const spot = saveSpot({ name: 'X', latitude: 48, longitude: 2 })
    removeSpot(spot.id)
    expect(getSavedSpots()).toHaveLength(0)
  })

  it('updates a spot and preserves createdAt', () => {
    const spot = saveSpot({ name: 'Old', latitude: 48, longitude: 2 })
    const updated = updateSpot(spot.id, {
      name: 'New',
      lastComputedAt: '2026-05-21T12:00:00.000Z',
    })

    expect(updated.name).toBe('New')
    expect(updated.createdAt).toBe(spot.createdAt)
    expect(new Date(updated.updatedAt).getTime()).toBeGreaterThanOrEqual(
      new Date(spot.updatedAt).getTime(),
    )
    expect(updated.lastComputedAt).toBe('2026-05-21T12:00:00.000Z')
  })

  it('normalizes empty name to default coordinates label', () => {
    const spot = saveSpot({ name: '   ', latitude: 48.6431, longitude: 6.1899 })
    expect(spot.name).toBe('Spot 48.6431, 6.1899')
  })

  it('buildDefaultSpotName prefers address label', () => {
    expect(
      buildDefaultSpotName({
        lat: 48,
        lon: 2,
        addressLabel: '12 rue de la Paix, Paris',
      }),
    ).toBe('12 rue de la Paix, Paris')
  })

  it('rejects invalid coordinates on save', () => {
    expect(() => saveSpot({ latitude: 95, longitude: 2 })).toThrow(
      SpotStorageError,
    )
    expect(() => saveSpot({ latitude: 48, longitude: 200 })).toThrow(
      SpotStorageError,
    )
    try {
      saveSpot({ latitude: 95, longitude: 2 })
    } catch (error) {
      expect((error as SpotStorageError).code).toBe('INVALID_COORDINATES')
    }
  })

  it('returns empty list when storage key is missing', () => {
    expect(getSavedSpots()).toEqual([])
  })

  it('returns empty list for corrupted JSON', () => {
    memoryStorage.setItem(SAVED_SPOTS_STORAGE_KEY, '{not-json')
    expect(getSavedSpots()).toEqual([])
  })

  it('migrates unknown schema version to empty payload', () => {
    memoryStorage.setItem(
      SAVED_SPOTS_STORAGE_KEY,
      JSON.stringify({ schemaVersion: 99, spots: [{ id: 'x' }] }),
    )
    expect(getSavedSpots()).toEqual([])
  })

  it('migrates legacy array payload without schemaVersion', () => {
    const migrated = migrateStoragePayload([
      {
        id: 'legacy-1',
        name: 'Legacy',
        latitude: 48.1,
        longitude: -4.5,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    ])
    expect(migrated.spots).toHaveLength(1)
    expect(migrated.spots[0].name).toBe('Legacy')
  })

  it('filters invalid spots during migration', () => {
    const migrated = migrateStoragePayload({
      schemaVersion: 1,
      spots: [
        { id: 'ok', name: 'OK', latitude: 48, longitude: 2, createdAt: 'a', updatedAt: 'b' },
        { id: 'bad', name: '', latitude: 999, longitude: 2, createdAt: 'a', updatedAt: 'b' },
      ],
    })
    expect(migrated.spots).toHaveLength(1)
    expect(migrated.spots[0].id).toBe('ok')
  })

  it('throws STORAGE_UNAVAILABLE when localStorage throws on write', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: () => {
        throw new Error('quota')
      },
      removeItem: () => undefined,
      clear: () => undefined,
      key: () => null,
      length: 0,
    })

    expect(() => saveSpot({ latitude: 48, longitude: 2 })).toThrow(SpotStorageError)
    try {
      saveSpot({ latitude: 48, longitude: 2 })
    } catch (error) {
      expect((error as SpotStorageError).code).toBe('STORAGE_UNAVAILABLE')
    }
  })

  it('returns empty list when localStorage is undefined', () => {
    vi.stubGlobal('localStorage', undefined)
    expect(readStoragePayload().spots).toEqual([])
    expect(getSavedSpots()).toEqual([])
  })

  it('clearSavedSpots removes all entries', () => {
    saveSpot({ name: 'A', latitude: 48, longitude: 2 })
    clearSavedSpots()
    expect(getSavedSpots()).toEqual([])
  })

  it('throws SPOT_NOT_FOUND when updating unknown id', () => {
    expect(() => updateSpot('missing', { name: 'X' })).toThrow(SpotStorageError)
  })
})
