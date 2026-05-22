import type { CalculationHistoryEntry } from '@/features/history/calculationHistoryTypes'
import type { CalculationSettings } from '@/features/settings/calculationSettingsTypes'
import type { SavedSpot } from '@/features/spots/spotTypes'

export const EXPORT_SCHEMA_VERSION = 1 as const
export const EXPORT_APP_NAME = 'Sunset Horizon' as const

export type SunsetHorizonExport = {
  schemaVersion: typeof EXPORT_SCHEMA_VERSION
  exportedAt: string
  appName: typeof EXPORT_APP_NAME
  data: {
    spots: SavedSpot[]
    calculationSettings: CalculationSettings
    calculationHistory: CalculationHistoryEntry[]
  }
}

export type ImportMode = 'merge' | 'replace'

export type ImportSummary = {
  mode: ImportMode
  importSpots: number
  importHistory: number
  localSpots: number
  localHistory: number
  spotsAdded: number
  spotsUpdated: number
  spotsUnchanged: number
  historyAdded: number
  historyUpdated: number
  historyUnchanged: number
  historyOrphansSkipped: number
  settingsReplaced: boolean
}

export type ImportExportErrorCode =
  | 'INVALID_JSON'
  | 'INVALID_STRUCTURE'
  | 'UNSUPPORTED_VERSION'
  | 'INVALID_SPOT'
  | 'INVALID_SETTINGS'
  | 'INVALID_HISTORY'
  | 'STORAGE_UNAVAILABLE'

export class ImportExportError extends Error {
  readonly code: ImportExportErrorCode

  constructor(code: ImportExportErrorCode, message: string) {
    super(message)
    this.name = 'ImportExportError'
    this.code = code
  }
}
