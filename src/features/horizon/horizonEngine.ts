import { radToDeg } from '@/lib/geo'
import type {
  TerrainDataSource,
  TerrainProfileResult,
} from '@/features/terrain/terrainTypes'
import type { HorizonProfile, TerrainSample } from './horizonTypes'
import { MIN_BLOCKING_DISTANCE_M } from './horizonTypes'

export function computeApparentAngleDeg(
  observerElevM: number,
  pointElevM: number,
  distanceM: number,
): number {
  if (distanceM <= 0) {
    return 0
  }
  const deltaM = pointElevM - observerElevM
  return radToDeg(Math.atan(deltaM / distanceM))
}

export function buildTerrainSamples(
  profile: TerrainProfileResult,
): TerrainSample[] {
  const observerElevM = profile.observer.elevationM

  return profile.points.map((point) => ({
    point: {
      lat: point.lat,
      lon: point.lon,
      elevation: point.elevationM,
    },
    distanceM: point.distanceM,
    elevationM: point.elevationM,
    apparentAngleDeg: computeApparentAngleDeg(
      observerElevM,
      point.elevationM,
      point.distanceM,
    ),
  }))
}

export function hasBlockingCandidates(samples: TerrainSample[]): boolean {
  return samples.some((s) => s.distanceM >= MIN_BLOCKING_DISTANCE_M)
}

export function findBlockingSample(
  samples: TerrainSample[],
): TerrainSample | null {
  const candidates = samples.filter(
    (s) => s.distanceM >= MIN_BLOCKING_DISTANCE_M,
  )
  if (candidates.length === 0) {
    return null
  }

  return candidates.reduce((best, current) =>
    current.apparentAngleDeg > best.apparentAngleDeg ? current : best,
  )
}

export function buildHorizonProfile(
  profile: TerrainProfileResult,
): HorizonProfile {
  const samples = buildTerrainSamples(profile)
  const blockingSample = findBlockingSample(samples)

  return {
    observer: {
      lat: profile.observer.lat,
      lon: profile.observer.lon,
      elevation: profile.observer.elevationM,
    },
    azimuthDeg: profile.azimuthDeg,
    samples,
    blockingSample,
    horizonAngleDeg: blockingSample?.apparentAngleDeg ?? 0,
    source: profile.source,
  }
}

export function estimateUncertaintyMinutes(
  source: TerrainDataSource | 'fallback',
): number {
  if (source === 'mock' || source === 'fallback') {
    return 5
  }
  return 3
}
