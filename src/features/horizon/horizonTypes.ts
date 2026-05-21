import type { TerrainDataSource } from '@/features/terrain/terrainTypes'

export type GeoPoint = {
  lat: number
  lon: number
  elevation?: number
}

export type TerrainSample = {
  point: GeoPoint
  distanceM: number
  elevationM: number
  apparentAngleDeg: number
}

export type HorizonProfile = {
  observer: GeoPoint
  azimuthDeg: number
  samples: TerrainSample[]
  blockingSample: TerrainSample | null
  horizonAngleDeg: number
  source: TerrainDataSource | 'fallback'
}

export type SunsetResult = {
  officialSunset: Date
  terrainSunset: Date | null
  deltaMinutes: number | null
  sunsetAzimuthDeg: number
  horizonProfile: HorizonProfile
  uncertaintyMinutes: number
  warnings: string[]
}

export type CrossingBracket = {
  before: { at: Date; altitudeDeg: number }
  after: { at: Date; altitudeDeg: number }
}

export type HorizonEngineOptions = {
  applyRefraction?: boolean
  stepMs?: number
  refineStepMs?: number
}

export const DEFAULT_REFINE_STEP_MS = 10_000

/** Minimum distance for blocking-sample selection (doc: sample from 50 m). */
export const MIN_BLOCKING_DISTANCE_M = 50

export type ComputeCorrectedSunsetParams = {
  lat: number
  lon: number
  date: Date
  profile: import('@/features/terrain/terrainTypes').TerrainProfileResult
  options?: HorizonEngineOptions
}
