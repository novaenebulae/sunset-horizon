import type { SunsetResult } from '@/features/horizon/horizonTypes'
import type { SavedSpotComputedResult } from './spotTypes'

export function spotComputedSnapshotFromResult(
  result: SunsetResult,
): SavedSpotComputedResult {
  const blocking = result.horizonProfile.blockingSample

  return {
    officialSunsetIso: result.officialSunset.toISOString(),
    terrainSunsetIso: result.terrainSunset?.toISOString() ?? null,
    deltaMinutes: result.deltaMinutes,
    sunsetAzimuthDeg: result.sunsetAzimuthDeg,
    horizonAngleDeg: result.horizonProfile.horizonAngleDeg,
    blockingDistanceM: blocking?.distanceM,
    blockingElevationM: blocking?.elevationM,
    uncertaintyMinutes: result.uncertaintyMinutes,
  }
}
