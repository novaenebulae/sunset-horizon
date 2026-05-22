import { describe, expect, it } from 'vitest'
import { destinationPoint, haversineDistanceM } from '@/lib/geo'
import {
  buildTerrainProfileCacheKey,
  getObserverCacheBucket,
} from './cacheKey'
import { CACHE_KEY_POSITION_GRID_M } from './cacheSettings'
import { TERRAIN_PROFILE_ALGORITHM_VERSION } from './cacheTypes'

const BASE_OBSERVER = { lat: 48.643098, lon: 6.189897 }

const BASE_INPUT = {
  observer: BASE_OBSERVER,
  azimuthDeg: 246.04,
  maxDistanceM: 30_000,
  stepM: 150,
  provider: 'ign' as const,
}

function observerOffsetM(distanceM: number, azimuthDeg = 0) {
  return destinationPoint(BASE_OBSERVER, azimuthDeg, distanceM)
}

describe('buildTerrainProfileCacheKey', () => {
  it('reuses cache key for observers ~45 m apart (~50 m zone, not ~30 m)', () => {
    const near45m = observerOffsetM(45)
    expect(haversineDistanceM(BASE_OBSERVER, near45m)).toBeGreaterThan(40)
    expect(haversineDistanceM(BASE_OBSERVER, near45m)).toBeLessThan(50)

    const keyA = buildTerrainProfileCacheKey(BASE_INPUT)
    const keyB = buildTerrainProfileCacheKey({
      ...BASE_INPUT,
      observer: near45m,
    })
    expect(keyA).toBe(keyB)
    expect(keyA).toContain(`algo=${TERRAIN_PROFILE_ALGORITHM_VERSION}`)
  })

  it('uses a new cache key when separation is large (~200 m north)', () => {
    const far200m = observerOffsetM(200)
    const baseBucket = getObserverCacheBucket(
      BASE_OBSERVER.lat,
      BASE_OBSERVER.lon,
    )
    const farBucket = getObserverCacheBucket(far200m.lat, far200m.lon)
    expect(farBucket.bucketY).not.toBe(baseBucket.bucketY)
    expect(buildTerrainProfileCacheKey(BASE_INPUT)).not.toBe(
      buildTerrainProfileCacheKey({ ...BASE_INPUT, observer: far200m }),
    )
  })

  it('differs when azimuth changes beyond rounding', () => {
    const base = buildTerrainProfileCacheKey(BASE_INPUT)
    const other = buildTerrainProfileCacheKey({
      ...BASE_INPUT,
      azimuthDeg: 247.2,
    })
    expect(base).not.toBe(other)
  })

  it('differs when max distance or step changes', () => {
    const base = buildTerrainProfileCacheKey(BASE_INPUT)
    expect(
      buildTerrainProfileCacheKey({ ...BASE_INPUT, maxDistanceM: 15_000 }),
    ).not.toBe(base)
    expect(
      buildTerrainProfileCacheKey({ ...BASE_INPUT, stepM: 50 }),
    ).not.toBe(base)
  })

  it('targets ~50 m match zone constant', () => {
    expect(CACHE_KEY_POSITION_GRID_M).toBe(50)
  })
})
