import { destinationPoint } from '@/lib/geo'
import type { LatLon } from '@/lib/geo'
import type { TerrainSample } from '@/features/horizon/horizonTypes'
import { DEFAULT_MAX_DISTANCE_M } from '@/features/terrain/terrainTypes'

export function azimuthLineEnd(
  observer: LatLon,
  azimuthDeg: number,
  samples: TerrainSample[],
): LatLon {
  const maxDistanceM =
    samples.length > 0
      ? Math.max(...samples.map((s) => s.distanceM), DEFAULT_MAX_DISTANCE_M)
      : DEFAULT_MAX_DISTANCE_M

  return destinationPoint(observer, azimuthDeg, maxDistanceM)
}

export function blockingPointCoords(
  blocking: TerrainSample,
): [number, number] {
  return [blocking.point.lat, blocking.point.lon]
}
