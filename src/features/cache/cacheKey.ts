import type { TerrainProfileCacheKeyInput } from './cacheTypes'
import { TERRAIN_PROFILE_ALGORITHM_VERSION } from './cacheTypes'
import {
  CACHE_KEY_AZIMUTH_DECIMALS,
  CACHE_KEY_METERS_PER_DEGREE_LAT,
  CACHE_KEY_POSITION_GRID_M,
  CACHE_KEY_PREFIX,
} from './cacheSettings'

export type ObserverCacheBucket = {
  bucketY: number
  bucketX: number
}

/** Snap period (m) for round lattice — 4× match zone ≈ ~50 m practical reuse. */
const SNAP_PERIOD_M = CACHE_KEY_POSITION_GRID_M * 4

/**
 * Lattice index for observer grouping (~50 m reuse zone with round snap).
 */
export function getObserverCacheBucket(
  latDeg: number,
  lonDeg: number,
): ObserverCacheBucket {
  const snapM = SNAP_PERIOD_M
  const latRad = (latDeg * Math.PI) / 180
  const metersPerDegLon =
    CACHE_KEY_METERS_PER_DEGREE_LAT * Math.cos(latRad)

  const yM = latDeg * CACHE_KEY_METERS_PER_DEGREE_LAT
  const xM = lonDeg * metersPerDegLon

  return {
    bucketY: Math.round(yM / snapM),
    bucketX: Math.round(xM / snapM),
  }
}

function roundAzimuth(azimuthDeg: number): string {
  const normalized = ((azimuthDeg % 360) + 360) % 360
  return normalized.toFixed(CACHE_KEY_AZIMUTH_DECIMALS)
}

export function buildTerrainProfileCacheKey(
  input: TerrainProfileCacheKeyInput,
): string {
  const algorithmVersion =
    input.algorithmVersion ?? TERRAIN_PROFILE_ALGORITHM_VERSION
  const { bucketY, bucketX } = getObserverCacheBucket(
    input.observer.lat,
    input.observer.lon,
  )
  const az = roundAzimuth(input.azimuthDeg)
  const max = Math.round(input.maxDistanceM)
  const step = Math.round(input.stepM)

  return `${CACHE_KEY_PREFIX}:${input.provider}:bucket=${bucketY}:${bucketX}:az=${az}:max=${max}:step=${step}:algo=${algorithmVersion}`
}

export function snapObserverToCacheGridM(
  latDeg: number,
  lonDeg: number,
): { lat: number; lon: number } {
  const snapM = SNAP_PERIOD_M
  const latRad = (latDeg * Math.PI) / 180
  const metersPerDegLon =
    CACHE_KEY_METERS_PER_DEGREE_LAT * Math.cos(latRad)
  const bucket = getObserverCacheBucket(latDeg, lonDeg)
  return {
    lat: (bucket.bucketY * snapM) / CACHE_KEY_METERS_PER_DEGREE_LAT,
    lon: (bucket.bucketX * snapM) / metersPerDegLon,
  }
}
