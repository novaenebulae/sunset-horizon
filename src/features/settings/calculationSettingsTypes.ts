export const CALCULATION_SETTINGS_STORAGE_KEY =
  'sunset-horizon:calculation-settings:v1'
export const CALCULATION_SETTINGS_SCHEMA_VERSION = 1 as const

export type PrecisionMode = 'fast' | 'balanced' | 'precise'

export type CalculationSettings = {
  precisionMode: PrecisionMode
  maxDistanceM: number
  sampleStepM: number
  timeStepSeconds: number
  refinementStepSeconds: number
  refractionEnabled: boolean
}

export type CalculationSettingsStoragePayload = {
  schemaVersion: typeof CALCULATION_SETTINGS_SCHEMA_VERSION
  settings: CalculationSettings
}

export type SettingsStorageErrorCode = 'STORAGE_UNAVAILABLE'

export class SettingsStorageError extends Error {
  readonly code: SettingsStorageErrorCode

  constructor(code: SettingsStorageErrorCode, message: string) {
    super(message)
    this.name = 'SettingsStorageError'
    this.code = code
  }
}
