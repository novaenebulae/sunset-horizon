import { notifyLocalDataChanged } from '@/lib/storage/localDataNotify'
import {
  SAVED_SPOTS_SCHEMA_VERSION,
  SAVED_SPOTS_STORAGE_KEY,
  SpotStorageError,
  type SaveSpotInput,
  type SavedSpot,
  type SavedSpotsStoragePayload,
  type UpdateSpotPatch,
} from './spotTypes'

let idCounter = 0

function createSpotId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  idCounter += 1
  return `spot-${Date.now()}-${idCounter}`
}

export function buildDefaultSpotName(params: {
  lat: number
  lon: number
  addressLabel?: string | null
}): string {
  const label = params.addressLabel?.trim()
  if (label) {
    return label
  }
  return `Spot ${params.lat.toFixed(4)}, ${params.lon.toFixed(4)}`
}

function normalizeSpotName(
  name: string | undefined,
  lat: number,
  lon: number,
): string {
  const trimmed = name?.trim() ?? ''
  if (trimmed.length > 0) {
    return trimmed
  }
  return buildDefaultSpotName({ lat, lon })
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
    throw new SpotStorageError(
      'INVALID_COORDINATES',
      'Coordonnées invalides : latitude entre -90 et 90, longitude entre -180 et 180.',
    )
  }
}

function nowIso(): string {
  return new Date().toISOString()
}

function getStorage(): Storage | null {
  try {
    if (typeof localStorage === 'undefined') {
      return null
    }
    const probeKey = '__sunset_horizon_storage_probe__'
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

function emptyPayload(): SavedSpotsStoragePayload {
  return { schemaVersion: SAVED_SPOTS_SCHEMA_VERSION, spots: [] }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function parseSpotEntry(raw: unknown): SavedSpot | null {
  if (!isRecord(raw)) {
    return null
  }

  const id = typeof raw.id === 'string' ? raw.id : ''
  const name = typeof raw.name === 'string' ? raw.name.trim() : ''
  const latitude = raw.latitude
  const longitude = raw.longitude
  const createdAt = typeof raw.createdAt === 'string' ? raw.createdAt : ''
  const updatedAt = typeof raw.updatedAt === 'string' ? raw.updatedAt : ''

  if (
    !id ||
    !name ||
    typeof latitude !== 'number' ||
    typeof longitude !== 'number' ||
    !createdAt ||
    !updatedAt
  ) {
    return null
  }

  try {
    assertValidCoordinates(latitude, longitude)
  } catch {
    return null
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
  if (typeof raw.lastComputedAt === 'string') {
    spot.lastComputedAt = raw.lastComputedAt
  }
  if (isRecord(raw.lastComputedResult)) {
    spot.lastComputedResult = raw.lastComputedResult as SavedSpot['lastComputedResult']
  }

  return spot
}

export function migrateStoragePayload(raw: unknown): SavedSpotsStoragePayload {
  if (!isRecord(raw)) {
    return emptyPayload()
  }

  const version = raw.schemaVersion
  if (version !== SAVED_SPOTS_SCHEMA_VERSION && version !== undefined) {
    return emptyPayload()
  }

  const rawSpots = raw.spots
  if (!Array.isArray(rawSpots)) {
    if (Array.isArray(raw) && version === undefined) {
      const legacySpots = raw
        .map(parseSpotEntry)
        .filter((spot): spot is SavedSpot => spot !== null)
      return { schemaVersion: SAVED_SPOTS_SCHEMA_VERSION, spots: legacySpots }
    }
    return emptyPayload()
  }

  const spots = rawSpots
    .map(parseSpotEntry)
    .filter((spot): spot is SavedSpot => spot !== null)

  return { schemaVersion: SAVED_SPOTS_SCHEMA_VERSION, spots }
}

export function readStoragePayload(): SavedSpotsStoragePayload {
  const storage = getStorage()
  if (!storage) {
    return emptyPayload()
  }

  try {
    const raw = storage.getItem(SAVED_SPOTS_STORAGE_KEY)
    if (raw === null || raw === '') {
      return emptyPayload()
    }
    const parsed: unknown = JSON.parse(raw)
    return migrateStoragePayload(parsed)
  } catch {
    return emptyPayload()
  }
}

export function writeStoragePayload(payload: SavedSpotsStoragePayload): void {
  const storage = getStorage()
  if (!storage) {
    throw new SpotStorageError(
      'STORAGE_UNAVAILABLE',
      'Le stockage local du navigateur est indisponible.',
    )
  }

  try {
    storage.setItem(SAVED_SPOTS_STORAGE_KEY, JSON.stringify(payload))
    notifyLocalDataChanged('spots')
  } catch {
    throw new SpotStorageError(
      'STORAGE_UNAVAILABLE',
      'Impossible d\'enregistrer les spots dans le navigateur.',
    )
  }
}

export function getSavedSpots(): SavedSpot[] {
  return readStoragePayload().spots
}

export function saveSpot(input: SaveSpotInput): SavedSpot {
  assertValidCoordinates(input.latitude, input.longitude)

  const timestamp = nowIso()
  const spot: SavedSpot = {
    id: createSpotId(),
    name: normalizeSpotName(input.name, input.latitude, input.longitude),
    latitude: input.latitude,
    longitude: input.longitude,
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  if (input.elevationM !== undefined && Number.isFinite(input.elevationM)) {
    spot.elevationM = input.elevationM
  }
  if (input.lastComputedAt) {
    spot.lastComputedAt = input.lastComputedAt
  }
  if (input.lastComputedResult) {
    spot.lastComputedResult = input.lastComputedResult
  }

  const payload = readStoragePayload()
  payload.spots.push(spot)
  writeStoragePayload(payload)

  return spot
}

export function updateSpot(id: string, patch: UpdateSpotPatch): SavedSpot {
  const payload = readStoragePayload()
  const index = payload.spots.findIndex((spot) => spot.id === id)
  if (index === -1) {
    throw new SpotStorageError('SPOT_NOT_FOUND', 'Spot introuvable.')
  }

  const existing = payload.spots[index]
  const latitude = patch.latitude ?? existing.latitude
  const longitude = patch.longitude ?? existing.longitude
  assertValidCoordinates(latitude, longitude)

  const updated: SavedSpot = {
    ...existing,
    ...patch,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: nowIso(),
    latitude,
    longitude,
  }

  if (patch.name !== undefined) {
    updated.name = normalizeSpotName(patch.name, latitude, longitude)
  }

  payload.spots[index] = updated
  writeStoragePayload(payload)

  return updated
}

export function removeSpot(id: string): void {
  const payload = readStoragePayload()
  const nextSpots = payload.spots.filter((spot) => spot.id !== id)
  if (nextSpots.length === payload.spots.length) {
    throw new SpotStorageError('SPOT_NOT_FOUND', 'Spot introuvable.')
  }
  writeStoragePayload({ ...payload, spots: nextSpots })
}

export function clearSavedSpots(): void {
  writeStoragePayload(emptyPayload())
}
