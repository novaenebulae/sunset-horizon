import type { LatLon } from '@/lib/geo'

export type TerrainDataSource = 'mock' | 'ign-geoplateforme'

export type TerrainProviderId = 'mock' | 'ign'

export type ElevationPoint = {
  lat: number
  lon: number
  elevationM: number
  distanceM: number
}

export type ObserverElevationResult = {
  elevationM: number
  source: TerrainDataSource
}

export type TerrainProfileResult = {
  observer: LatLon & { elevationM: number }
  azimuthDeg: number
  points: ElevationPoint[]
  source: TerrainDataSource
}

export type FetchTerrainProfileParams = {
  observer: LatLon
  azimuthDeg: number
  maxDistanceM?: number
  stepM?: number
  provider: TerrainProviderId
}

export const DEFAULT_MAX_DISTANCE_M = 30_000
export const DEFAULT_STEP_M = 500
export const MAX_PROFILE_POINTS = 60
