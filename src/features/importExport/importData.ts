import {
  CALCULATION_HISTORY_SCHEMA_VERSION,
  MAX_HISTORY_ENTRIES_PER_SPOT,
  type CalculationHistoryEntry,
} from '@/features/history/calculationHistoryTypes'
import {
  readHistoryPayload,
  writeHistoryPayload,
} from '@/features/history/calculationHistoryStorage'
import {
  CALCULATION_SETTINGS_SCHEMA_VERSION,
} from '@/features/settings/calculationSettingsTypes'
import { writeStoragePayload as writeSettingsPayload } from '@/features/settings/calculationSettingsStorage'
import {
  SAVED_SPOTS_SCHEMA_VERSION,
  type SavedSpot,
} from '@/features/spots/spotTypes'
import {
  readStoragePayload as readSpotsPayload,
  writeStoragePayload as writeSpotsPayload,
} from '@/features/spots/spotStorage'
import type { ImportMode, ImportSummary, SunsetHorizonExport } from './exportTypes'
import { ImportExportError } from './exportTypes'

function timestampMs(iso: string): number {
  const ms = Date.parse(iso)
  return Number.isFinite(ms) ? ms : 0
}

export function mergeSpotsByUpdatedAt(
  local: SavedSpot[],
  imported: SavedSpot[],
): { merged: SavedSpot[]; added: number; updated: number; unchanged: number } {
  const map = new Map<string, SavedSpot>()
  let added = 0
  let updated = 0
  let unchanged = 0

  for (const spot of local) {
    map.set(spot.id, spot)
  }

  for (const spot of imported) {
    const existing = map.get(spot.id)
    if (!existing) {
      map.set(spot.id, spot)
      added += 1
      continue
    }

    const existingMs = timestampMs(existing.updatedAt)
    const importMs = timestampMs(spot.updatedAt)

    if (importMs > existingMs) {
      map.set(spot.id, spot)
      updated += 1
    } else if (importMs === existingMs) {
      unchanged += 1
    } else {
      unchanged += 1
    }
  }

  return { merged: Array.from(map.values()), added, updated, unchanged }
}

export function mergeHistoryByComputedAt(
  local: CalculationHistoryEntry[],
  imported: CalculationHistoryEntry[],
  validSpotIds: Set<string>,
): {
  merged: CalculationHistoryEntry[]
  added: number
  updated: number
  unchanged: number
  orphansSkipped: number
} {
  const map = new Map<string, CalculationHistoryEntry>()
  let added = 0
  let updated = 0
  let unchanged = 0
  let orphansSkipped = 0

  const consider = (entry: CalculationHistoryEntry, fromImport: boolean) => {
    if (!validSpotIds.has(entry.spotId)) {
      if (fromImport) {
        orphansSkipped += 1
      }
      return
    }

    const existing = map.get(entry.id)
    if (!existing) {
      map.set(entry.id, entry)
      if (fromImport) {
        added += 1
      }
      return
    }

    const existingMs = timestampMs(existing.computedAt)
    const nextMs = timestampMs(entry.computedAt)

    if (nextMs > existingMs) {
      map.set(entry.id, entry)
      if (fromImport) {
        updated += 1
      }
    } else {
      unchanged += 1
    }
  }

  for (const entry of local) {
    consider(entry, false)
  }
  for (const entry of imported) {
    consider(entry, true)
  }

  return {
    merged: trimHistoryEntries(Array.from(map.values())),
    added,
    updated,
    unchanged,
    orphansSkipped,
  }
}

export function trimHistoryEntries(
  entries: CalculationHistoryEntry[],
): CalculationHistoryEntry[] {
  const bySpot = new Map<string, CalculationHistoryEntry[]>()

  for (const entry of entries) {
    const list = bySpot.get(entry.spotId) ?? []
    list.push(entry)
    bySpot.set(entry.spotId, list)
  }

  const trimmed: CalculationHistoryEntry[] = []
  for (const list of bySpot.values()) {
    const sorted = list.sort(
      (a, b) => timestampMs(b.computedAt) - timestampMs(a.computedAt),
    )
    trimmed.push(...sorted.slice(0, MAX_HISTORY_ENTRIES_PER_SPOT))
  }

  return trimmed
}

export function buildImportSummary(
  exported: SunsetHorizonExport,
  mode: ImportMode,
): ImportSummary {
  const localSpots = readSpotsPayload().spots
  const localHistory = readHistoryPayload().entries

  if (mode === 'replace') {
    return {
      mode,
      importSpots: exported.data.spots.length,
      importHistory: exported.data.calculationHistory.length,
      localSpots: localSpots.length,
      localHistory: localHistory.length,
      spotsAdded: exported.data.spots.length,
      spotsUpdated: 0,
      spotsUnchanged: 0,
      historyAdded: exported.data.calculationHistory.length,
      historyUpdated: 0,
      historyUnchanged: 0,
      historyOrphansSkipped: 0,
      settingsReplaced: true,
    }
  }

  const spotMerge = mergeSpotsByUpdatedAt(localSpots, exported.data.spots)
  const spotIds = new Set(spotMerge.merged.map((s) => s.id))
  const historyMerge = mergeHistoryByComputedAt(
    localHistory,
    exported.data.calculationHistory,
    spotIds,
  )

  return {
    mode,
    importSpots: exported.data.spots.length,
    importHistory: exported.data.calculationHistory.length,
    localSpots: localSpots.length,
    localHistory: localHistory.length,
    spotsAdded: spotMerge.added,
    spotsUpdated: spotMerge.updated,
    spotsUnchanged: spotMerge.unchanged,
    historyAdded: historyMerge.added,
    historyUpdated: historyMerge.updated,
    historyUnchanged: historyMerge.unchanged,
    historyOrphansSkipped: historyMerge.orphansSkipped,
    settingsReplaced: false,
  }
}

function assertStorageAvailable(): void {
  try {
    readSpotsPayload()
  } catch {
    throw new ImportExportError(
      'STORAGE_UNAVAILABLE',
      'Le stockage local du navigateur est indisponible.',
    )
  }
}

export function applyImportData(
  exported: SunsetHorizonExport,
  mode: ImportMode,
): ImportSummary {
  assertStorageAvailable()
  const summary = buildImportSummary(exported, mode)

  if (mode === 'replace') {
    writeSpotsPayload({
      schemaVersion: SAVED_SPOTS_SCHEMA_VERSION,
      spots: exported.data.spots,
    })
    writeSettingsPayload({
      schemaVersion: CALCULATION_SETTINGS_SCHEMA_VERSION,
      settings: exported.data.calculationSettings,
    })
    writeHistoryPayload({
      schemaVersion: CALCULATION_HISTORY_SCHEMA_VERSION,
      entries: trimHistoryEntries(exported.data.calculationHistory),
    })
    return summary
  }

  const localSpots = readSpotsPayload().spots
  const localHistory = readHistoryPayload().entries
  const spotMerge = mergeSpotsByUpdatedAt(localSpots, exported.data.spots)
  const spotIds = new Set(spotMerge.merged.map((s) => s.id))
  const historyMerge = mergeHistoryByComputedAt(
    localHistory,
    exported.data.calculationHistory,
    spotIds,
  )

  writeSpotsPayload({
    schemaVersion: SAVED_SPOTS_SCHEMA_VERSION,
    spots: spotMerge.merged,
  })
  writeHistoryPayload({
    schemaVersion: CALCULATION_HISTORY_SCHEMA_VERSION,
    entries: historyMerge.merged,
  })

  return summary
}
