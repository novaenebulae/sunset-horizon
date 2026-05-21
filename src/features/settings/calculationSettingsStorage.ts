import { validateCalculationSettings } from './calculationSettingsValidation'
import {
  CALCULATION_SETTINGS_SCHEMA_VERSION,
  CALCULATION_SETTINGS_STORAGE_KEY,
  SettingsStorageError,
  type CalculationSettings,
  type CalculationSettingsStoragePayload,
} from './calculationSettingsTypes'
import { DEFAULT_CALCULATION_SETTINGS } from './defaultCalculationSettings'

function getStorage(): Storage | null {
  try {
    if (typeof localStorage === 'undefined') {
      return null
    }
    const probeKey = '__sunset_horizon_settings_probe__'
    localStorage.setItem(probeKey, '1')
    localStorage.removeItem(probeKey)
    return localStorage
  } catch {
    return null
  }
}

export function isLocalStorageAvailable(): boolean {
  return getStorage() !== null
}

function defaultPayload(): CalculationSettingsStoragePayload {
  return {
    schemaVersion: CALCULATION_SETTINGS_SCHEMA_VERSION,
    settings: { ...DEFAULT_CALCULATION_SETTINGS },
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function migrateStoragePayload(
  raw: unknown,
): CalculationSettingsStoragePayload {
  if (!isRecord(raw)) {
    return defaultPayload()
  }

  if (
    raw.schemaVersion !== CALCULATION_SETTINGS_SCHEMA_VERSION &&
    raw.schemaVersion !== undefined
  ) {
    return defaultPayload()
  }

  const settings = validateCalculationSettings(raw.settings ?? raw)
  return {
    schemaVersion: CALCULATION_SETTINGS_SCHEMA_VERSION,
    settings,
  }
}

export function readStoragePayload(): CalculationSettingsStoragePayload {
  const storage = getStorage()
  if (!storage) {
    return defaultPayload()
  }

  try {
    const raw = storage.getItem(CALCULATION_SETTINGS_STORAGE_KEY)
    if (raw === null || raw === '') {
      return defaultPayload()
    }
    const parsed: unknown = JSON.parse(raw)
    return migrateStoragePayload(parsed)
  } catch {
    return defaultPayload()
  }
}

export function writeStoragePayload(
  payload: CalculationSettingsStoragePayload,
): void {
  const storage = getStorage()
  if (!storage) {
    throw new SettingsStorageError(
      'STORAGE_UNAVAILABLE',
      'Le stockage local du navigateur est indisponible.',
    )
  }

  try {
    storage.setItem(CALCULATION_SETTINGS_STORAGE_KEY, JSON.stringify(payload))
  } catch {
    throw new SettingsStorageError(
      'STORAGE_UNAVAILABLE',
      'Impossible d\'enregistrer les réglages dans le navigateur.',
    )
  }
}

export function loadCalculationSettings(): CalculationSettings {
  return readStoragePayload().settings
}

export function saveCalculationSettings(settings: CalculationSettings): void {
  writeStoragePayload({
    schemaVersion: CALCULATION_SETTINGS_SCHEMA_VERSION,
    settings: validateCalculationSettings(settings),
  })
}
