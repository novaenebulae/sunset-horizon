import type { SunsetResult } from '@/features/horizon/horizonTypes'
import type { SavedSpot } from '@/features/spots/spotTypes'
import type { TerrainProfileFetchSource } from '@/features/terrain/terrainTypes'

export type SpotComparisonStatus =
  | 'idle'
  | 'loading'
  | 'success'
  | 'insufficient'
  | 'error'

export type SpotComparisonSortKey = 'name' | 'terrainSunset' | 'delta' | 'status'

export type SpotComparisonSortDirection = 'asc' | 'desc'

export type SpotComparisonRow = {
  spotId: string
  name: string
  latitude: number
  longitude: number
  status: SpotComparisonStatus
  error?: string
  officialSunset?: Date
  terrainSunset?: Date | null
  deltaMinutes?: number | null
  sunsetAzimuthDeg?: number
  horizonAngleDeg?: number
  blockingDistanceM?: number | null
  blockingElevationM?: number | null
  terrainSource?: string
  profileFetchSource?: TerrainProfileFetchSource
  uncertaintyMinutes?: number
  warnings?: string[]
  result?: SunsetResult
  isBest?: boolean
}

export type CompareSpotInput = {
  spot: Pick<SavedSpot, 'id' | 'name' | 'latitude' | 'longitude'>
  observationDate: Date
  settings: import('@/features/settings/calculationSettingsTypes').CalculationSettings
  provider?: import('@/features/terrain/terrainTypes').TerrainProviderId
}

export const DEFAULT_COMPARE_CONCURRENCY = 2
