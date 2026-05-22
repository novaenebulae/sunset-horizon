import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CALCULATION_HISTORY_STORAGE_KEY } from '@/features/history/calculationHistoryTypes'
import { getHistoryEntries } from '@/features/history/calculationHistoryStorage'
import { CALCULATION_SETTINGS_STORAGE_KEY } from '@/features/settings/calculationSettingsTypes'
import { loadCalculationSettings } from '@/features/settings/calculationSettingsStorage'
import { SAVED_SPOTS_STORAGE_KEY } from '@/features/spots/spotTypes'
import { getSavedSpots, saveSpot } from '@/features/spots/spotStorage'
import { DEFAULT_CALCULATION_SETTINGS } from '@/features/settings/defaultCalculationSettings'
import {
  buildExportFilename,
  buildExportPayload,
  serializeExportPayload,
} from './exportData'
import {
  applyImportData,
  mergeHistoryByComputedAt,
  mergeSpotsByUpdatedAt,
} from './importData'
import {
  EXPORT_APP_NAME,
  EXPORT_SCHEMA_VERSION,
  ImportExportError,
  type SunsetHorizonExport,
} from './exportTypes'
import { parseExportJson, validateSunsetHorizonExport } from './importExportValidation'

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

function makeSpot(
  id: string,
  name: string,
  updatedAt: string,
): SunsetHorizonExport['data']['spots'][0] {
  return {
    id,
    name,
    latitude: 48.85,
    longitude: 2.35,
    createdAt: '2026-01-01T12:00:00.000Z',
    updatedAt,
  }
}

function makeExport(
  partial?: Partial<SunsetHorizonExport['data']>,
): SunsetHorizonExport {
  return {
    schemaVersion: EXPORT_SCHEMA_VERSION,
    exportedAt: '2026-05-21T10:00:00.000Z',
    appName: EXPORT_APP_NAME,
    data: {
      spots: [makeSpot('spot-1', 'Paris', '2026-05-20T12:00:00.000Z')],
      calculationSettings: { ...DEFAULT_CALCULATION_SETTINGS },
      calculationHistory: [],
      ...partial,
    },
  }
}

describe('importExport', () => {
  let memoryStorage: Storage

  beforeEach(() => {
    memoryStorage = createMemoryStorage()
    vi.stubGlobal('localStorage', memoryStorage)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('builds a valid export payload', () => {
    saveSpot({ name: 'Test', latitude: 48, longitude: 2 })
    const payload = buildExportPayload()
    expect(payload.schemaVersion).toBe(1)
    expect(payload.appName).toBe(EXPORT_APP_NAME)
    expect(payload.data.spots).toHaveLength(1)
    expect(serializeExportPayload(payload)).toContain('"spots"')
  })

  it('builds export filename with date', () => {
    expect(
      buildExportFilename(new Date(2026, 4, 21)),
    ).toBe('sunset-horizon-export-2026-05-21.json')
  })

  it('parses a valid export JSON', () => {
    const exported = makeExport()
    const parsed = parseExportJson(JSON.stringify(exported))
    expect(parsed.data.spots[0].name).toBe('Paris')
  })

  it('rejects invalid JSON', () => {
    expect(() => parseExportJson('{')).toThrow(ImportExportError)
    try {
      parseExportJson('{')
    } catch (err) {
      expect((err as ImportExportError).code).toBe('INVALID_JSON')
    }
  })

  it('rejects unsupported schema version', () => {
    const exported = { ...makeExport(), schemaVersion: 99 }
    expect(() => parseExportJson(JSON.stringify(exported))).toThrow(
      ImportExportError,
    )
    try {
      parseExportJson(JSON.stringify(exported))
    } catch (err) {
      expect((err as ImportExportError).code).toBe('UNSUPPORTED_VERSION')
    }
  })

  it('rejects invalid spot coordinates', () => {
    const exported = makeExport({
      spots: [makeSpot('a', 'Bad', '2026-05-20T12:00:00.000Z')],
    })
    exported.data.spots[0].latitude = 999
    expect(() => validateSunsetHorizonExport(exported)).toThrow(ImportExportError)
  })

  it('rejects invalid calculation settings structure', () => {
    const exported = makeExport()
    ;(exported.data as { calculationSettings: unknown }).calculationSettings =
      'invalid'
    expect(() => validateSunsetHorizonExport(exported)).toThrow(ImportExportError)
  })

  it('rejects history referencing unknown spot', () => {
    const exported = makeExport({
      calculationHistory: [
        {
          id: 'h1',
          spotId: 'missing',
          observationDate: '2026-05-21',
          computedAt: '2026-05-21T18:00:00.000Z',
          officialSunsetIso: '2026-05-21T19:00:00.000Z',
          terrainSunsetIso: '2026-05-21T19:30:00.000Z',
          deltaMinutes: 30,
          sunsetAzimuthDeg: 270,
          horizonAngleDeg: 2,
          blockingDistanceM: 1000,
          blockingElevationM: 200,
          terrainSource: 'ign-geoplateforme',
          uncertaintyMinutes: 3,
          warnings: [],
          settingsSnapshot: { ...DEFAULT_CALCULATION_SETTINGS },
        },
      ],
    })
    expect(() => validateSunsetHorizonExport(exported)).toThrow(ImportExportError)
  })

  it('merges spots keeping newer updatedAt', () => {
    const local = [makeSpot('a', 'Local', '2026-05-21T12:00:00.000Z')]
    const imported = [makeSpot('a', 'Import', '2026-05-22T12:00:00.000Z')]
    const { merged, updated } = mergeSpotsByUpdatedAt(local, imported)
    expect(merged).toHaveLength(1)
    expect(merged[0].name).toBe('Import')
    expect(updated).toBe(1)
  })

  it('merges spots keeping local when newer', () => {
    const local = [makeSpot('a', 'Local', '2026-05-22T12:00:00.000Z')]
    const imported = [makeSpot('a', 'Import', '2026-05-21T12:00:00.000Z')]
    const { merged } = mergeSpotsByUpdatedAt(local, imported)
    expect(merged[0].name).toBe('Local')
  })

  it('merges history by computedAt', () => {
    const spotIds = new Set(['spot-1'])
    const local = [
      {
        id: 'h1',
        spotId: 'spot-1',
        observationDate: '2026-05-21',
        computedAt: '2026-05-21T10:00:00.000Z',
        officialSunsetIso: '2026-05-21T19:00:00.000Z',
        terrainSunsetIso: '2026-05-21T19:30:00.000Z',
        deltaMinutes: 30,
        sunsetAzimuthDeg: 270,
        horizonAngleDeg: 2,
        blockingDistanceM: 1000,
        blockingElevationM: 200,
        terrainSource: 'ign',
        uncertaintyMinutes: 3,
        warnings: [],
        settingsSnapshot: { ...DEFAULT_CALCULATION_SETTINGS },
      },
    ]
    const imported = [
      {
        ...local[0],
        computedAt: '2026-05-21T20:00:00.000Z',
        deltaMinutes: 45,
      },
    ]
    const { merged, updated } = mergeHistoryByComputedAt(
      local,
      imported,
      spotIds,
    )
    expect(merged).toHaveLength(1)
    expect(merged[0].deltaMinutes).toBe(45)
    expect(updated).toBe(1)
  })

  it('applies merge import without removing local-only spots', () => {
    saveSpot({ name: 'Local only', latitude: 48, longitude: 2 })
    const localSpot = getSavedSpots()[0]

    const exported = makeExport({
      spots: [makeSpot('imported', 'Import', '2026-05-22T12:00:00.000Z')],
      calculationHistory: [],
    })

    applyImportData(exported, 'merge')
    const spots = getSavedSpots()
    expect(spots).toHaveLength(2)
    expect(spots.some((s) => s.id === localSpot.id)).toBe(true)
    expect(spots.some((s) => s.id === 'imported')).toBe(true)
  })

  it('applies replace import overwriting local data', () => {
    saveSpot({ name: 'Old', latitude: 48, longitude: 2 })

    const exported = makeExport({
      spots: [makeSpot('new-only', 'New', '2026-05-22T12:00:00.000Z')],
    })

    applyImportData(exported, 'replace')
    const spots = getSavedSpots()
    expect(spots).toHaveLength(1)
    expect(spots[0].id).toBe('new-only')
    expect(loadCalculationSettings().precisionMode).toBe(
      exported.data.calculationSettings.precisionMode,
    )
  })

  it('round-trips export through parse', () => {
    saveSpot({ name: 'Round', latitude: 43, longitude: 1 })
    const payload = buildExportPayload()
    const text = serializeExportPayload(payload)
    const parsed = parseExportJson(text)
    expect(parsed.data.spots[0].name).toBe('Round')
  })

  it('stores data in expected localStorage keys after replace', () => {
    const exported = makeExport()
    applyImportData(exported, 'replace')
    expect(memoryStorage.getItem(SAVED_SPOTS_STORAGE_KEY)).toBeTruthy()
    expect(memoryStorage.getItem(CALCULATION_SETTINGS_STORAGE_KEY)).toBeTruthy()
    expect(memoryStorage.getItem(CALCULATION_HISTORY_STORAGE_KEY)).toBeTruthy()
    expect(getHistoryEntries()).toHaveLength(0)
  })
})
