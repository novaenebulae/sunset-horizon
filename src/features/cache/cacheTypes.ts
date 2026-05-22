import type { LatLon } from '@/lib/geo'
import type { TerrainProfileResult, TerrainProviderId } from '@/features/terrain/terrainTypes'

export const TERRAIN_CACHE_SCHEMA_VERSION = 1

/**
 * Bump when profile normalization or sampling logic changes
 * (IGN no-data handling, invalid elevation threshold, etc.).
 */
export const TERRAIN_PROFILE_ALGORITHM_VERSION = 'terrain-profile-v1'

export type TerrainProfileCacheKeyInput = {
  observer: LatLon
  azimuthDeg: number
  maxDistanceM: number
  stepM: number
  provider: TerrainProviderId
  algorithmVersion?: string
}

export type TerrainProfileCacheEntry = {
  key: string
  profile: TerrainProfileResult
  createdAt: string
  cacheVersion: number
  algorithmVersion: string
}

export type TerrainProfileCacheStats = {
  available: boolean
  entryCount: number
  approximateBytes: number
}
