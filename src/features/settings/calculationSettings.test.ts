import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_MAX_DISTANCE_M, DEFAULT_STEP_M } from '@/features/terrain/terrainTypes'
import {
  CALCULATION_SETTINGS_PRESETS,
  DEFAULT_CALCULATION_SETTINGS,
  getPresetSettings,
  settingsToHorizonOptions,
  settingsToTerrainParams,
} from './defaultCalculationSettings'
import { validateCalculationSettings } from './calculationSettingsValidation'
import {
  CALCULATION_SETTINGS_STORAGE_KEY,
  SettingsStorageError,
} from './calculationSettingsTypes'
import {
  loadCalculationSettings,
  migrateStoragePayload,
  readStoragePayload,
  saveCalculationSettings,
} from './calculationSettingsStorage'

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

describe('defaultCalculationSettings', () => {
  it('balanced preset matches Normal mode defaults', () => {
    const balanced = CALCULATION_SETTINGS_PRESETS.balanced
    expect(balanced.maxDistanceM).toBe(DEFAULT_MAX_DISTANCE_M)
    expect(balanced.sampleStepM).toBe(DEFAULT_STEP_M)
    expect(balanced.timeStepSeconds).toBe(15)
    expect(balanced.refinementStepSeconds).toBe(15)
  })

  it('getPresetSettings returns a copy', () => {
    const fast = getPresetSettings('fast')
    fast.maxDistanceM = 0
    expect(getPresetSettings('fast').maxDistanceM).toBe(15_000)
  })

  it('maps settings to horizon and terrain params', () => {
    const settings = getPresetSettings('precise')
    expect(settingsToTerrainParams(settings)).toEqual({
      maxDistanceM: 30_000,
      stepM: 50,
    })
    expect(settingsToHorizonOptions(settings)).toEqual({
      applyRefraction: true,
      stepMs: 1_000,
      refineStepMs: 5_000,
    })
  })
})

describe('validateCalculationSettings', () => {
  it('accepts a valid object', () => {
    const result = validateCalculationSettings({
      precisionMode: 'fast',
      maxDistanceM: 12_000,
      sampleStepM: 200,
      timeStepSeconds: 90,
      refinementStepSeconds: 45,
      refractionEnabled: false,
    })
    expect(result.precisionMode).toBe('fast')
    expect(result.maxDistanceM).toBe(12_000)
    expect(result.refractionEnabled).toBe(false)
  })

  it('falls back to balanced on invalid input', () => {
    expect(validateCalculationSettings(null)).toEqual(
      DEFAULT_CALCULATION_SETTINGS,
    )
    expect(validateCalculationSettings('bad')).toEqual(
      DEFAULT_CALCULATION_SETTINGS,
    )
  })

  it('clamps maxDistanceM to allowed range', () => {
    expect(
      validateCalculationSettings({ maxDistanceM: 500 }).maxDistanceM,
    ).toBe(1_000)
    expect(
      validateCalculationSettings({ maxDistanceM: 999_999 }).maxDistanceM,
    ).toBe(80_000)
  })

  it('clamps sample step to allowed range', () => {
    expect(
      validateCalculationSettings({ sampleStepM: 1 }).sampleStepM,
    ).toBe(25)
    expect(
      validateCalculationSettings({ sampleStepM: 5000 }).sampleStepM,
    ).toBe(1_000)
  })

  it('ensures refinement step does not exceed time step', () => {
    const result = validateCalculationSettings({
      timeStepSeconds: 20,
      refinementStepSeconds: 120,
    })
    expect(result.refinementStepSeconds).toBeLessThanOrEqual(
      result.timeStepSeconds,
    )
  })
})

describe('calculationSettingsStorage', () => {
  let memoryStorage: Storage

  beforeEach(() => {
    memoryStorage = createMemoryStorage()
    vi.stubGlobal('localStorage', memoryStorage)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns default settings when storage is empty', () => {
    expect(loadCalculationSettings()).toEqual(DEFAULT_CALCULATION_SETTINGS)
  })

  it('persists and reloads settings', () => {
    const custom = getPresetSettings('fast')
    saveCalculationSettings(custom)
    expect(loadCalculationSettings()).toEqual(custom)
  })

  it('returns default payload for corrupted JSON', () => {
    memoryStorage.setItem(CALCULATION_SETTINGS_STORAGE_KEY, '{bad-json')
    expect(readStoragePayload().settings).toEqual(DEFAULT_CALCULATION_SETTINGS)
  })

  it('migrates unknown schema version to defaults', () => {
    memoryStorage.setItem(
      CALCULATION_SETTINGS_STORAGE_KEY,
      JSON.stringify({ schemaVersion: 99, settings: { precisionMode: 'fast' } }),
    )
    expect(loadCalculationSettings()).toEqual(DEFAULT_CALCULATION_SETTINGS)
  })

  it('migrateStoragePayload validates partial legacy data', () => {
    const migrated = migrateStoragePayload({
      precisionMode: 'precise',
      maxDistanceM: 50_000,
    })
    expect(migrated.settings.precisionMode).toBe('precise')
    expect(migrated.settings.maxDistanceM).toBe(50_000)
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

    expect(() => saveCalculationSettings(getPresetSettings('fast'))).toThrow(
      SettingsStorageError,
    )
  })

  it('returns defaults when localStorage is undefined', () => {
    vi.stubGlobal('localStorage', undefined)
    expect(loadCalculationSettings()).toEqual(DEFAULT_CALCULATION_SETTINGS)
  })
})
