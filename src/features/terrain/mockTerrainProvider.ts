import { destinationPoint, haversineDistanceM } from '@/lib/geo'
import type { LatLon } from '@/lib/geo'
import type {
  ElevationPoint,
  ObserverElevationResult,
  TerrainProfileResult,
} from './terrainTypes'

const MOCK_OBSERVER_ELEVATION_M = 400

export function getMockObserverElevation(): ObserverElevationResult {
  return {
    elevationM: MOCK_OBSERVER_ELEVATION_M,
    source: 'mock',
  }
}

export function buildMockTerrainProfile(
  observer: LatLon,
  azimuthDeg: number,
  maxDistanceM: number,
  stepM: number,
): TerrainProfileResult {
  const points: ElevationPoint[] = []

  for (let distanceM = 0; distanceM <= maxDistanceM; distanceM += stepM) {
    const point =
      distanceM === 0
        ? { lat: observer.lat, lon: observer.lon }
        : destinationPoint(observer, azimuthDeg, distanceM)

    const baseElevation = MOCK_OBSERVER_ELEVATION_M - 20
    const hill =
      distanceM > 0
        ? 350 * Math.exp(-((distanceM - 8_000) ** 2) / (2 * 2_500 ** 2))
        : 0

    points.push({
      lat: point.lat,
      lon: point.lon,
      elevationM: Math.round((baseElevation + hill) * 10) / 10,
      distanceM,
    })
  }

  return {
    observer: {
      ...observer,
      elevationM: MOCK_OBSERVER_ELEVATION_M,
    },
    azimuthDeg,
    points,
    source: 'mock',
  }
}

export function attachDistances(
  observer: LatLon,
  samples: Array<{ lat: number; lon: number; elevationM: number }>,
): ElevationPoint[] {
  return samples.map((sample) => ({
    ...sample,
    distanceM: haversineDistanceM(observer, sample),
  }))
}
