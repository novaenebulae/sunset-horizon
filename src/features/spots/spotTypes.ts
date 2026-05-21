export const SAVED_SPOTS_STORAGE_KEY = 'sunset-horizon:saved-spots:v1'
export const SAVED_SPOTS_SCHEMA_VERSION = 1 as const

export type SavedSpotComputedResult = {
  officialSunsetIso?: string
  terrainSunsetIso?: string | null
  deltaMinutes?: number | null
  sunsetAzimuthDeg?: number
  horizonAngleDeg?: number
  blockingDistanceM?: number
  blockingElevationM?: number
  uncertaintyMinutes?: number
}

export type SavedSpot = {
  id: string
  name: string
  latitude: number
  longitude: number
  elevationM?: number
  createdAt: string
  updatedAt: string
  lastComputedAt?: string
  lastComputedResult?: SavedSpotComputedResult
}

export type SavedSpotsStoragePayload = {
  schemaVersion: typeof SAVED_SPOTS_SCHEMA_VERSION
  spots: SavedSpot[]
}

export type SaveSpotInput = {
  name?: string
  latitude: number
  longitude: number
  elevationM?: number
  lastComputedAt?: string
  lastComputedResult?: SavedSpotComputedResult
}

export type UpdateSpotPatch = Partial<
  Pick<
    SavedSpot,
    | 'name'
    | 'latitude'
    | 'longitude'
    | 'elevationM'
    | 'lastComputedAt'
    | 'lastComputedResult'
  >
>

export type SpotStorageErrorCode =
  | 'STORAGE_UNAVAILABLE'
  | 'INVALID_COORDINATES'
  | 'INVALID_NAME'
  | 'SPOT_NOT_FOUND'
  | 'VALIDATION_ERROR'

export class SpotStorageError extends Error {
  readonly code: SpotStorageErrorCode

  constructor(code: SpotStorageErrorCode, message: string) {
    super(message)
    this.name = 'SpotStorageError'
    this.code = code
  }
}
