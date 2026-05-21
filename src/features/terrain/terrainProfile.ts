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
  ObserverElevationResult,
  TerrainProfileResult,
  TerrainProviderId,
} from './terrainTypes'
import { DEFAULT_MAX_DISTANCE_M, DEFAULT_STEP_M } from './terrainTypes'

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
): Promise<TerrainProfileResult> {
  const {
    observer,
    azimuthDeg,
    maxDistanceM = DEFAULT_MAX_DISTANCE_M,
    stepM = DEFAULT_STEP_M,
    provider,
  } = params

  if (provider === 'mock') {
    return buildMockTerrainProfile(observer, azimuthDeg, maxDistanceM, stepM)
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

    return {
      observer: {
        ...observer,
        elevationM: observerElevation.elevationM,
      },
      azimuthDeg,
      points,
      source: 'ign-geoplateforme',
    }
  } catch (error) {
    throw toTerrainError(error)
  }
}
