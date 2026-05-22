import type { PrecisionMode } from '@/features/settings/calculationSettingsTypes'
import type { TerrainProfileFetchSource } from '@/features/terrain/terrainTypes'

export type Horizon360SampleStatus = 'success' | 'insufficient' | 'error'

export type Horizon360Sample = {
  azimuthDeg: number
  status: Horizon360SampleStatus
  horizonAngleDeg?: number
  blockingDistanceM?: number | null
  blockingElevationM?: number | null
  profileFetchSource?: TerrainProfileFetchSource
  error?: string
}

export type Horizon360CacheStats = {
  cacheHits: number
  cacheMisses: number
  errors: number
}

export type Horizon360Result = {
  samples: Horizon360Sample[]
  azimuthStepDeg: number
  cacheStats: Horizon360CacheStats
  cancelled: boolean
}

export type Horizon360State =
  | 'idle'
  | 'running'
  | 'success'
  | 'partial'
  | 'cancelled'
  | 'error'

export const MIN_AZIMUTH_STEP_DEG = 10

export const AZIMUTH_STEP_BY_MODE: Record<PrecisionMode, number> = {
  fast: 30,
  balanced: 15,
  precise: 10,
}
