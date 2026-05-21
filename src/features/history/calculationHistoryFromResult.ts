import type { SunsetResult } from '@/features/horizon/horizonTypes'
import type { CalculationSettings } from '@/features/settings/calculationSettingsTypes'
import { validateCalculationSettings } from '@/features/settings/calculationSettingsValidation'
import type { CalculationHistoryEntry } from './calculationHistoryTypes'

let idCounter = 0

function createHistoryEntryId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  idCounter += 1
  return `history-${Date.now()}-${idCounter}`
}

function observationDateToIso(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export type BuildHistoryEntryParams = {
  spotId: string
  observationDate: Date
  result: SunsetResult
  settings: CalculationSettings
  computedAt?: string
}

export function buildHistoryEntryFromResult(
  params: BuildHistoryEntryParams,
): CalculationHistoryEntry {
  const { spotId, observationDate, result, settings } = params
  const blocking = result.horizonProfile.blockingSample

  return {
    id: createHistoryEntryId(),
    spotId,
    observationDate: observationDateToIso(observationDate),
    computedAt: params.computedAt ?? new Date().toISOString(),
    officialSunsetIso: result.officialSunset.toISOString(),
    terrainSunsetIso: result.terrainSunset?.toISOString() ?? null,
    deltaMinutes: result.deltaMinutes,
    sunsetAzimuthDeg: result.sunsetAzimuthDeg,
    horizonAngleDeg: result.horizonProfile.horizonAngleDeg,
    blockingDistanceM: blocking?.distanceM ?? null,
    blockingElevationM: blocking?.elevationM ?? null,
    terrainSource: String(result.horizonProfile.source),
    uncertaintyMinutes: result.uncertaintyMinutes,
    warnings: [...result.warnings],
    settingsSnapshot: validateCalculationSettings(settings),
  }
}
