import type { CalculationSettings } from '@/features/settings/calculationSettingsTypes'

export const CALCULATION_HISTORY_STORAGE_KEY =
  'sunset-horizon:calculation-history:v1'
export const CALCULATION_HISTORY_SCHEMA_VERSION = 1 as const
export const MAX_HISTORY_ENTRIES_PER_SPOT = 20

export type CalculationHistoryEntry = {
  id: string
  spotId: string
  observationDate: string
  computedAt: string
  officialSunsetIso: string
  terrainSunsetIso: string | null
  deltaMinutes: number | null
  sunsetAzimuthDeg: number
  horizonAngleDeg: number | null
  blockingDistanceM: number | null
  blockingElevationM: number | null
  terrainSource: string
  uncertaintyMinutes: number | null
  warnings: string[]
  settingsSnapshot: CalculationSettings
}

export type CalculationHistoryStoragePayload = {
  schemaVersion: typeof CALCULATION_HISTORY_SCHEMA_VERSION
  entries: CalculationHistoryEntry[]
}

export type AddHistoryEntryInput = Omit<
  CalculationHistoryEntry,
  'id' | 'computedAt'
> & {
  computedAt?: string
}

export type HistoryStorageErrorCode =
  | 'STORAGE_UNAVAILABLE'
  | 'ENTRY_NOT_FOUND'
  | 'VALIDATION_ERROR'

export class HistoryStorageError extends Error {
  readonly code: HistoryStorageErrorCode

  constructor(code: HistoryStorageErrorCode, message: string) {
    super(message)
    this.name = 'HistoryStorageError'
    this.code = code
  }
}
