import { validateCalculationSettings } from '@/features/settings/calculationSettingsValidation'
import { buildHistoryEntryFromResult } from './calculationHistoryFromResult'
import type { BuildHistoryEntryParams } from './calculationHistoryFromResult'
import {
  CALCULATION_HISTORY_SCHEMA_VERSION,
  CALCULATION_HISTORY_STORAGE_KEY,
  HistoryStorageError,
  MAX_HISTORY_ENTRIES_PER_SPOT,
  type AddHistoryEntryInput,
  type CalculationHistoryEntry,
  type CalculationHistoryStoragePayload,
} from './calculationHistoryTypes'

function getStorage(): Storage | null {
  try {
    if (typeof localStorage === 'undefined') {
      return null
    }
    const probeKey = '__sunset_horizon_history_probe__'
    localStorage.setItem(probeKey, '1')
    localStorage.removeItem(probeKey)
    return localStorage
  } catch {
    return null
  }
}

export function isHistoryStorageAvailable(): boolean {
  return getStorage() !== null
}

function emptyPayload(): CalculationHistoryStoragePayload {
  return {
    schemaVersion: CALCULATION_HISTORY_SCHEMA_VERSION,
    entries: [],
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function parseStringArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) {
    return []
  }
  return raw.filter((item): item is string => typeof item === 'string')
}

function parseHistoryEntry(raw: unknown): CalculationHistoryEntry | null {
  if (!isRecord(raw)) {
    return null
  }

  const id = typeof raw.id === 'string' ? raw.id : ''
  const spotId = typeof raw.spotId === 'string' ? raw.spotId : ''
  const observationDate =
    typeof raw.observationDate === 'string' ? raw.observationDate : ''
  const computedAt = typeof raw.computedAt === 'string' ? raw.computedAt : ''
  const officialSunsetIso =
    typeof raw.officialSunsetIso === 'string' ? raw.officialSunsetIso : ''
  const sunsetAzimuthDeg = raw.sunsetAzimuthDeg
  const terrainSource =
    typeof raw.terrainSource === 'string' ? raw.terrainSource : ''

  if (
    !id ||
    !spotId ||
    !observationDate ||
    !computedAt ||
    !officialSunsetIso ||
    typeof sunsetAzimuthDeg !== 'number' ||
    !Number.isFinite(sunsetAzimuthDeg) ||
    !terrainSource
  ) {
    return null
  }

  const terrainSunsetIso =
    raw.terrainSunsetIso === null
      ? null
      : typeof raw.terrainSunsetIso === 'string'
        ? raw.terrainSunsetIso
        : null

  const deltaMinutes =
    raw.deltaMinutes === null
      ? null
      : typeof raw.deltaMinutes === 'number' && Number.isFinite(raw.deltaMinutes)
        ? raw.deltaMinutes
        : null

  const horizonAngleDeg =
    raw.horizonAngleDeg === null
      ? null
      : typeof raw.horizonAngleDeg === 'number' &&
          Number.isFinite(raw.horizonAngleDeg)
        ? raw.horizonAngleDeg
        : null

  const blockingDistanceM =
    raw.blockingDistanceM === null
      ? null
      : typeof raw.blockingDistanceM === 'number' &&
          Number.isFinite(raw.blockingDistanceM)
        ? raw.blockingDistanceM
        : null

  const blockingElevationM =
    raw.blockingElevationM === null
      ? null
      : typeof raw.blockingElevationM === 'number' &&
          Number.isFinite(raw.blockingElevationM)
        ? raw.blockingElevationM
        : null

  const uncertaintyMinutes =
    raw.uncertaintyMinutes === null
      ? null
      : typeof raw.uncertaintyMinutes === 'number' &&
          Number.isFinite(raw.uncertaintyMinutes)
        ? raw.uncertaintyMinutes
        : null

  return {
    id,
    spotId,
    observationDate,
    computedAt,
    officialSunsetIso,
    terrainSunsetIso,
    deltaMinutes,
    sunsetAzimuthDeg,
    horizonAngleDeg,
    blockingDistanceM,
    blockingElevationM,
    terrainSource,
    uncertaintyMinutes,
    warnings: parseStringArray(raw.warnings),
    settingsSnapshot: validateCalculationSettings(raw.settingsSnapshot),
  }
}

export function migrateHistoryPayload(
  raw: unknown,
): CalculationHistoryStoragePayload {
  if (!isRecord(raw)) {
    return emptyPayload()
  }

  if (
    raw.schemaVersion !== CALCULATION_HISTORY_SCHEMA_VERSION &&
    raw.schemaVersion !== undefined
  ) {
    return emptyPayload()
  }

  const rawEntries = raw.entries
  if (!Array.isArray(rawEntries)) {
    return emptyPayload()
  }

  const entries = rawEntries
    .map(parseHistoryEntry)
    .filter((entry): entry is CalculationHistoryEntry => entry !== null)

  return {
    schemaVersion: CALCULATION_HISTORY_SCHEMA_VERSION,
    entries,
  }
}

export function readHistoryPayload(): CalculationHistoryStoragePayload {
  const storage = getStorage()
  if (!storage) {
    return emptyPayload()
  }

  try {
    const raw = storage.getItem(CALCULATION_HISTORY_STORAGE_KEY)
    if (raw === null || raw === '') {
      return emptyPayload()
    }
    const parsed: unknown = JSON.parse(raw)
    return migrateHistoryPayload(parsed)
  } catch {
    return emptyPayload()
  }
}

export function writeHistoryPayload(
  payload: CalculationHistoryStoragePayload,
): void {
  const storage = getStorage()
  if (!storage) {
    throw new HistoryStorageError(
      'STORAGE_UNAVAILABLE',
      'Le stockage local du navigateur est indisponible.',
    )
  }

  try {
    storage.setItem(CALCULATION_HISTORY_STORAGE_KEY, JSON.stringify(payload))
  } catch {
    throw new HistoryStorageError(
      'STORAGE_UNAVAILABLE',
      'Impossible d\'enregistrer l\'historique dans le navigateur.',
    )
  }
}

export function getHistoryEntries(): CalculationHistoryEntry[] {
  return readHistoryPayload().entries
}

export function getHistoryForSpot(spotId: string): CalculationHistoryEntry[] {
  return getHistoryEntries()
    .filter((entry) => entry.spotId === spotId)
    .sort(
      (a, b) =>
        new Date(b.computedAt).getTime() - new Date(a.computedAt).getTime(),
    )
}

function trimEntriesForSpot(
  entries: CalculationHistoryEntry[],
  spotId: string,
): CalculationHistoryEntry[] {
  const forSpot = entries
    .filter((e) => e.spotId === spotId)
    .sort(
      (a, b) =>
        new Date(b.computedAt).getTime() - new Date(a.computedAt).getTime(),
    )
    .slice(0, MAX_HISTORY_ENTRIES_PER_SPOT)

  const others = entries.filter((e) => e.spotId !== spotId)
  return [...others, ...forSpot]
}

export function addHistoryEntryFromResult(
  params: BuildHistoryEntryParams,
): CalculationHistoryEntry {
  const entry = buildHistoryEntryFromResult(params)
  const payload = readHistoryPayload()
  payload.entries = trimEntriesForSpot(
    [entry, ...payload.entries],
    entry.spotId,
  )
  writeHistoryPayload(payload)
  return entry
}

export function addHistoryEntry(input: AddHistoryEntryInput): CalculationHistoryEntry {
  const entry: CalculationHistoryEntry = {
    ...input,
    id:
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `history-${Date.now()}`,
    computedAt: input.computedAt ?? new Date().toISOString(),
    settingsSnapshot: validateCalculationSettings(input.settingsSnapshot),
    warnings: [...input.warnings],
  }

  const payload = readHistoryPayload()
  payload.entries = trimEntriesForSpot([entry, ...payload.entries], entry.spotId)
  writeHistoryPayload(payload)
  return entry
}

export function removeHistoryEntry(id: string): void {
  const payload = readHistoryPayload()
  const next = payload.entries.filter((entry) => entry.id !== id)
  if (next.length === payload.entries.length) {
    throw new HistoryStorageError('ENTRY_NOT_FOUND', 'Entrée d\'historique introuvable.')
  }
  writeHistoryPayload({ ...payload, entries: next })
}

export function clearHistoryForSpot(spotId: string): void {
  const payload = readHistoryPayload()
  writeHistoryPayload({
    ...payload,
    entries: payload.entries.filter((entry) => entry.spotId !== spotId),
  })
}

export function clearOrphanEntries(validSpotIds: string[]): void {
  const valid = new Set(validSpotIds)
  const payload = readHistoryPayload()
  const next = payload.entries.filter((entry) => valid.has(entry.spotId))
  if (next.length !== payload.entries.length) {
    writeHistoryPayload({ ...payload, entries: next })
  }
}
