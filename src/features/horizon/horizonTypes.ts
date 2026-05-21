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
  refineStepMs?: number
}

export const DEFAULT_REFINE_STEP_MS = 10_000

export type ComputeCorrectedSunsetParams = {
  lat: number
  lon: number
  date: Date
  profile: import('@/features/terrain/terrainTypes').TerrainProfileResult
  options?: HorizonEngineOptions
}
