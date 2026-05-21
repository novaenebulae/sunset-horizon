import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { SunsetResult } from '@/features/horizon/horizonTypes'
import { getPresetSettings } from '@/features/settings/defaultCalculationSettings'
import { buildHistoryEntryFromResult } from './calculationHistoryFromResult'
import {
  CALCULATION_HISTORY_STORAGE_KEY,
  HistoryStorageError,
  MAX_HISTORY_ENTRIES_PER_SPOT,
} from './calculationHistoryTypes'
import {
  addHistoryEntryFromResult,
  clearHistoryForSpot,
  getHistoryForSpot,
  getHistoryEntries,
  migrateHistoryPayload,
  readHistoryPayload,
  removeHistoryEntry,
} from './calculationHistoryStorage'

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

function mockSunsetResult(): SunsetResult {
  const official = new Date(2024, 5, 21, 21, 30, 0, 0)
  const terrain = new Date(2024, 5, 21, 21, 45, 0, 0)
  return {
    officialSunset: official,
    terrainSunset: terrain,
    deltaMinutes: 15,
    sunsetAzimuthDeg: 295,
    horizonProfile: {
      observer: { lat: 48.85, lon: 2.35, elevation: 100 },
      azimuthDeg: 295,
      samples: [],
      blockingSample: {
        point: { lat: 48.86, lon: 2.34, elevation: 400 },
        distanceM: 2500,
        elevationM: 400,
        apparentAngleDeg: 2.5,
      },
      horizonAngleDeg: 1.2,
      source: 'ign-geoplateforme',
    },
    uncertaintyMinutes: 3,
    warnings: ['Test warning'],
  }
}

describe('buildHistoryEntryFromResult', () => {
  it('maps sunset result fields', () => {
    const entry = buildHistoryEntryFromResult({
      spotId: 'spot-1',
      observationDate: new Date(2024, 5, 21, 12, 0, 0, 0),
      result: mockSunsetResult(),
      settings: getPresetSettings('balanced'),
    })

    expect(entry.spotId).toBe('spot-1')
    expect(entry.observationDate).toBe('2024-06-21')
    expect(entry.terrainSunsetIso).not.toBeNull()
    expect(entry.deltaMinutes).toBe(15)
    expect(entry.settingsSnapshot.precisionMode).toBe('balanced')
    expect(entry.warnings).toContain('Test warning')
  })
})

describe('calculationHistoryStorage', () => {
  let memoryStorage: Storage

  beforeEach(() => {
    memoryStorage = createMemoryStorage()
    vi.stubGlobal('localStorage', memoryStorage)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('adds and retrieves entries by spot', () => {
    const entry = addHistoryEntryFromResult({
      spotId: 'spot-a',
      observationDate: new Date(2024, 5, 21),
      result: mockSunsetResult(),
      settings: getPresetSettings('fast'),
    })

    expect(getHistoryForSpot('spot-a')).toHaveLength(1)
    expect(getHistoryForSpot('spot-a')[0].id).toBe(entry.id)
    expect(getHistoryForSpot('spot-b')).toHaveLength(0)
  })

  it('limits entries to 20 per spot', () => {
    for (let i = 0; i < 25; i++) {
      addHistoryEntryFromResult({
        spotId: 'spot-limit',
        observationDate: new Date(2024, 0, 1 + i),
        result: mockSunsetResult(),
        settings: getPresetSettings('balanced'),
        computedAt: new Date(2024, 0, i + 1).toISOString(),
      })
    }

    expect(getHistoryForSpot('spot-limit')).toHaveLength(
      MAX_HISTORY_ENTRIES_PER_SPOT,
    )
    expect(getHistoryEntries()).toHaveLength(MAX_HISTORY_ENTRIES_PER_SPOT)
  })

  it('removes a single entry', () => {
    const entry = addHistoryEntryFromResult({
      spotId: 'spot-x',
      observationDate: new Date(2024, 5, 21),
      result: mockSunsetResult(),
      settings: getPresetSettings('balanced'),
    })

    removeHistoryEntry(entry.id)
    expect(getHistoryForSpot('spot-x')).toHaveLength(0)
  })

  it('clears all history for a spot without affecting others', () => {
    addHistoryEntryFromResult({
      spotId: 'keep',
      observationDate: new Date(2024, 5, 21),
      result: mockSunsetResult(),
      settings: getPresetSettings('balanced'),
    })
    addHistoryEntryFromResult({
      spotId: 'clear-me',
      observationDate: new Date(2024, 5, 22),
      result: mockSunsetResult(),
      settings: getPresetSettings('balanced'),
    })

    clearHistoryForSpot('clear-me')
    expect(getHistoryForSpot('clear-me')).toHaveLength(0)
    expect(getHistoryForSpot('keep')).toHaveLength(1)
  })

  it('returns empty list for corrupted JSON', () => {
    memoryStorage.setItem(CALCULATION_HISTORY_STORAGE_KEY, '{bad')
    expect(getHistoryEntries()).toEqual([])
  })

  it('returns empty list when localStorage is undefined', () => {
    vi.stubGlobal('localStorage', undefined)
    expect(readHistoryPayload().entries).toEqual([])
  })

  it('throws when localStorage write fails', () => {
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

    expect(() =>
      addHistoryEntryFromResult({
        spotId: 's',
        observationDate: new Date(),
        result: mockSunsetResult(),
        settings: getPresetSettings('balanced'),
      }),
    ).toThrow(HistoryStorageError)
  })

  it('migrates unknown schema to empty payload', () => {
    const migrated = migrateHistoryPayload({ schemaVersion: 99, entries: [] })
    expect(migrated.entries).toEqual([])
  })
})
