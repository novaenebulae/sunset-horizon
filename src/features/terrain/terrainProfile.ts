import { destinationPoint, haversineDistanceM } from '@/lib/geo'
import type { LatLon } from '@/lib/geo'
import {
  fetchPointElevations,
  fetchProfileForSampledLine,
} from './ignAltimetryClient'
import {
  buildMockTerrainProfile,
  getMockObserverElevation,
} from './mockTerrainProvider'
import { toTerrainError } from './terrainErrors'
import type {
  FetchTerrainProfileParams,
  FetchTerrainProfileResult,
  ObserverElevationResult,
  TerrainProfileResult,
  TerrainProviderId,
} from './terrainTypes'
import { DEFAULT_MAX_DISTANCE_M, DEFAULT_STEP_M } from './terrainTypes'
import {
  buildTerrainProfileCacheKey,
  getCachedTerrainProfile,
  setCachedTerrainProfile,
} from '@/features/cache'

export function buildSampledLine(
  observer: LatLon,
  azimuthDeg: number,
  maxDistanceM: number,
  stepM: number,
): LatLon[] {
  const points: LatLon[] = [{ lat: observer.lat, lon: observer.lon }]
  for (let distanceM = stepM; distanceM <= maxDistanceM; distanceM += stepM) {
    points.push(destinationPoint(observer, azimuthDeg, distanceM))
  }
  return points
}

export async function getObserverElevation(
  lat: number,
  lon: number,
  provider: TerrainProviderId,
): Promise<ObserverElevationResult> {
  if (provider === 'mock') {
    return getMockObserverElevation()
  }

  try {
    const [entry] = await fetchPointElevations([lon], [lat])
    return {
      elevationM: entry.z,
      source: 'ign-geoplateforme',
    }
  } catch (error) {
    throw toTerrainError(error)
  }
}

export async function fetchTerrainProfile(
  params: FetchTerrainProfileParams,
): Promise<FetchTerrainProfileResult> {
  const {
    observer,
    azimuthDeg,
    maxDistanceM = DEFAULT_MAX_DISTANCE_M,
    stepM = DEFAULT_STEP_M,
    provider,
  } = params

  if (provider === 'mock') {
    return {
      profile: buildMockTerrainProfile(
        observer,
        azimuthDeg,
        maxDistanceM,
        stepM,
      ),
      fetchSource: 'mock',
    }
  }

  const cacheKey = buildTerrainProfileCacheKey({
    observer,
    azimuthDeg,
    maxDistanceM,
    stepM,
    provider: 'ign',
  })

  const cached = await getCachedTerrainProfile(cacheKey).catch(() => null)
  if (cached) {
    return { profile: cached, fetchSource: 'cache' }
  }

  try {
    const observerElevation = await getObserverElevation(
      observer.lat,
      observer.lon,
      'ign',
    )
    const line = buildSampledLine(observer, azimuthDeg, maxDistanceM, stepM)
    const entries = await fetchProfileForSampledLine(line)

    const points = entries.map((entry) => ({
      lat: entry.lat,
      lon: entry.lon,
      elevationM: entry.z,
      distanceM: haversineDistanceM(observer, { lat: entry.lat, lon: entry.lon }),
    }))

    const profile: TerrainProfileResult = {
      observer: {
        ...observer,
        elevationM: observerElevation.elevationM,
      },
      azimuthDeg,
      points,
      source: 'ign-geoplateforme',
    }

    void setCachedTerrainProfile(cacheKey, profile).catch(() => {})

    return { profile, fetchSource: 'ign-geoplateforme' }
  } catch (error) {
    throw toTerrainError(error)
  }
}
