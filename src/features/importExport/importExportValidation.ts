import { validateCalculationSettings } from '@/features/settings/calculationSettingsValidation'
import type { CalculationHistoryEntry } from '@/features/history/calculationHistoryTypes'
import type { SavedSpot } from '@/features/spots/spotTypes'
import {
  EXPORT_APP_NAME,
  EXPORT_SCHEMA_VERSION,
  ImportExportError,
  type SunsetHorizonExport,
} from './exportTypes'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isValidIsoDate(value: string): boolean {
  const time = Date.parse(value)
  return Number.isFinite(time)
}

function assertValidCoordinates(latitude: number, longitude: number): void {
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new ImportExportError(
      'INVALID_SPOT',
      'Coordonnées invalides dans un spot importé.',
    )
  }
}

function parseSpotStrict(raw: unknown, index: number): SavedSpot {
  if (!isRecord(raw)) {
    throw new ImportExportError(
      'INVALID_SPOT',
      `Spot invalide à l'index ${index}.`,
    )
  }

  const id = typeof raw.id === 'string' ? raw.id.trim() : ''
  const name = typeof raw.name === 'string' ? raw.name.trim() : ''
  const latitude = raw.latitude
  const longitude = raw.longitude
  const createdAt = typeof raw.createdAt === 'string' ? raw.createdAt : ''
  const updatedAt = typeof raw.updatedAt === 'string' ? raw.updatedAt : ''

  if (!id || !name) {
    throw new ImportExportError(
      'INVALID_SPOT',
      `Spot « ${name || id || index} » : id ou nom manquant.`,
    )
  }

  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    throw new ImportExportError(
      'INVALID_SPOT',
      `Spot « ${name} » : coordonnées invalides.`,
    )
  }

  assertValidCoordinates(latitude, longitude)

  if (!isValidIsoDate(createdAt) || !isValidIsoDate(updatedAt)) {
    throw new ImportExportError(
      'INVALID_SPOT',
      `Spot « ${name} » : dates createdAt/updatedAt invalides.`,
    )
  }

  const spot: SavedSpot = {
    id,
    name,
    latitude,
    longitude,
    createdAt,
    updatedAt,
  }

  if (typeof raw.elevationM === 'number' && Number.isFinite(raw.elevationM)) {
    spot.elevationM = raw.elevationM
  }
  if (typeof raw.lastComputedAt === 'string' && isValidIsoDate(raw.lastComputedAt)) {
    spot.lastComputedAt = raw.lastComputedAt
  }
  if (isRecord(raw.lastComputedResult)) {
    spot.lastComputedResult = raw.lastComputedResult as SavedSpot['lastComputedResult']
  }

  return spot
}

function parseStringArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) {
    return []
  }
  return raw.filter((item): item is string => typeof item === 'string')
}

function parseHistoryEntryStrict(
  raw: unknown,
  index: number,
): CalculationHistoryEntry {
  if (!isRecord(raw)) {
    throw new ImportExportError(
      'INVALID_HISTORY',
      `Entrée d'historique invalide à l'index ${index}.`,
    )
  }

  const id = typeof raw.id === 'string' ? raw.id.trim() : ''
  const spotId = typeof raw.spotId === 'string' ? raw.spotId.trim() : ''
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
    throw new ImportExportError(
      'INVALID_HISTORY',
      `Entrée d'historique invalide à l'index ${index}.`,
    )
  }

  if (
    !isValidIsoDate(observationDate) ||
    !isValidIsoDate(computedAt) ||
    !isValidIsoDate(officialSunsetIso)
  ) {
    throw new ImportExportError(
      'INVALID_HISTORY',
      `Entrée d'historique « ${id} » : dates invalides.`,
    )
  }

  const terrainSunsetIso =
    raw.terrainSunsetIso === null
      ? null
      : typeof raw.terrainSunsetIso === 'string' &&
          isValidIsoDate(raw.terrainSunsetIso)
        ? raw.terrainSunsetIso
        : null

  const deltaMinutes =
    raw.deltaMinutes === null
      ? null
      : typeof raw.deltaMinutes === 'number' && Number.isFinite(raw.deltaMinutes)
        ? raw.deltaMinutes
        : null

  const parseNullableNumber = (value: unknown): number | null => {
    if (value === null) return null
    return typeof value === 'number' && Number.isFinite(value) ? value : null
  }

  if (!isRecord(raw.settingsSnapshot)) {
    throw new ImportExportError(
      'INVALID_SETTINGS',
      `Entrée d'historique « ${id} » : réglages invalides.`,
    )
  }
  const settingsSnapshot = validateCalculationSettings(raw.settingsSnapshot)

  return {
    id,
    spotId,
    observationDate,
    computedAt,
    officialSunsetIso,
    terrainSunsetIso,
    deltaMinutes,
    sunsetAzimuthDeg,
    horizonAngleDeg: parseNullableNumber(raw.horizonAngleDeg),
    blockingDistanceM: parseNullableNumber(raw.blockingDistanceM),
    blockingElevationM: parseNullableNumber(raw.blockingElevationM),
    terrainSource,
    uncertaintyMinutes: parseNullableNumber(raw.uncertaintyMinutes),
    warnings: parseStringArray(raw.warnings),
    settingsSnapshot,
  }
}

export function parseExportJson(text: string): SunsetHorizonExport {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new ImportExportError(
      'INVALID_JSON',
      'Le fichier n\'est pas un JSON valide.',
    )
  }
  return validateSunsetHorizonExport(parsed)
}

export function validateSunsetHorizonExport(raw: unknown): SunsetHorizonExport {
  if (!isRecord(raw)) {
    throw new ImportExportError(
      'INVALID_STRUCTURE',
      'Structure d\'export invalide.',
    )
  }

  if (raw.schemaVersion !== EXPORT_SCHEMA_VERSION) {
    throw new ImportExportError(
      'UNSUPPORTED_VERSION',
      `Version d'export non supportée : ${String(raw.schemaVersion)}.`,
    )
  }

  if (raw.appName !== undefined && raw.appName !== EXPORT_APP_NAME) {
    throw new ImportExportError(
      'INVALID_STRUCTURE',
      'Fichier d\'export non reconnu (appName incorrect).',
    )
  }

  const exportedAt =
    typeof raw.exportedAt === 'string' ? raw.exportedAt : ''
  if (!exportedAt || !isValidIsoDate(exportedAt)) {
    throw new ImportExportError(
      'INVALID_STRUCTURE',
      'Date d\'export invalide.',
    )
  }

  if (!isRecord(raw.data)) {
    throw new ImportExportError(
      'INVALID_STRUCTURE',
      'Section data manquante.',
    )
  }

  const rawSpots = raw.data.spots
  if (!Array.isArray(rawSpots)) {
    throw new ImportExportError(
      'INVALID_STRUCTURE',
      'Liste de spots manquante.',
    )
  }

  const spots = rawSpots.map((spot, index) => parseSpotStrict(spot, index))

  if (!isRecord(raw.data.calculationSettings)) {
    throw new ImportExportError(
      'INVALID_SETTINGS',
      'Réglages de calcul invalides dans l\'export.',
    )
  }
  const calculationSettings = validateCalculationSettings(
    raw.data.calculationSettings,
  )

  const rawHistory = raw.data.calculationHistory
  if (!Array.isArray(rawHistory)) {
    throw new ImportExportError(
      'INVALID_STRUCTURE',
      'Historique de calcul manquant.',
    )
  }

  const calculationHistory = rawHistory.map((entry, index) =>
    parseHistoryEntryStrict(entry, index),
  )

  const spotIds = new Set(spots.map((s) => s.id))
  for (const entry of calculationHistory) {
    if (!spotIds.has(entry.spotId)) {
      throw new ImportExportError(
        'INVALID_HISTORY',
        `Historique « ${entry.id} » référence un spot inconnu (${entry.spotId}).`,
      )
    }
  }

  return {
    schemaVersion: EXPORT_SCHEMA_VERSION,
    exportedAt,
    appName: EXPORT_APP_NAME,
    data: {
      spots,
      calculationSettings,
      calculationHistory,
    },
  }
}
