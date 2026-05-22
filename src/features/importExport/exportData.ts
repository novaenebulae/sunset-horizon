import { getHistoryEntries } from '@/features/history/calculationHistoryStorage'
import { loadCalculationSettings } from '@/features/settings/calculationSettingsStorage'
import { getSavedSpots } from '@/features/spots/spotStorage'
import {
  EXPORT_APP_NAME,
  EXPORT_SCHEMA_VERSION,
  type SunsetHorizonExport,
} from './exportTypes'

export function buildExportFilename(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `sunset-horizon-export-${year}-${month}-${day}.json`
}

export function buildExportPayload(): SunsetHorizonExport {
  return {
    schemaVersion: EXPORT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    appName: EXPORT_APP_NAME,
    data: {
      spots: getSavedSpots(),
      calculationSettings: loadCalculationSettings(),
      calculationHistory: getHistoryEntries(),
    },
  }
}

export function serializeExportPayload(payload: SunsetHorizonExport): string {
  return JSON.stringify(payload, null, 2)
}

export function downloadExportFile(payload: SunsetHorizonExport): void {
  const blob = new Blob([serializeExportPayload(payload)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = buildExportFilename()
  anchor.click()
  URL.revokeObjectURL(url)
}
