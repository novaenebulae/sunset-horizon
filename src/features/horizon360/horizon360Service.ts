import { buildHorizonProfile } from '@/features/horizon/horizonEngine'
import type { CalculationSettings } from '@/features/settings/calculationSettingsTypes'
import { settingsToTerrainParams } from '@/features/settings/defaultCalculationSettings'
import { toTerrainError } from '@/features/terrain/terrainErrors'
import { fetchTerrainProfile } from '@/features/terrain/terrainProfile'
import type { TerrainProviderId } from '@/features/terrain/terrainTypes'
import {
  AZIMUTH_STEP_BY_MODE,
  MIN_AZIMUTH_STEP_DEG,
  type Horizon360CacheStats,
  type Horizon360Result,
  type Horizon360Sample,
} from './horizon360Types'

export function getAzimuthStepDeg(settings: CalculationSettings): number {
  const step = AZIMUTH_STEP_BY_MODE[settings.precisionMode]
  return Math.max(step, MIN_AZIMUTH_STEP_DEG)
}

export function generateAzimuthSamples(stepDeg: number): number[] {
  const azimuths: number[] = []
  for (let deg = 0; deg < 360; deg += stepDeg) {
    azimuths.push(deg)
  }
  return azimuths
}

export function normalizeAzimuthDeg(azimuthDeg: number): number {
  const normalized = azimuthDeg % 360
  return normalized < 0 ? normalized + 360 : normalized
}

/** Signed shortest delta from center azimuth, in [-180, 180]. 0 = aligned with center. */
export function azimuthDeltaFromCenter(
  azimuthDeg: number,
  centerAzimuthDeg: number,
): number {
  let delta = normalizeAzimuthDeg(azimuthDeg) - normalizeAzimuthDeg(centerAzimuthDeg)
  if (delta > 180) {
    delta -= 360
  } else if (delta < -180) {
    delta += 360
  }
  return delta
}

export function azimuthFromCenterDelta(
  centerAzimuthDeg: number,
  deltaDeg: number,
): number {
  return normalizeAzimuthDeg(centerAzimuthDeg + deltaDeg)
}

export function computeCenteredAzimuthDomain(
  deltas: number[],
  minHalfSpanDeg = 45,
): [number, number] {
  if (deltas.length === 0) {
    return [-minHalfSpanDeg, minHalfSpanDeg]
  }
  let maxAbs = 0
  for (const delta of deltas) {
    maxAbs = Math.max(maxAbs, Math.abs(delta))
  }
  const halfSpan = Math.max(maxAbs + 5, minHalfSpanDeg)
  return [-halfSpan, halfSpan]
}

export function findNearestAzimuthIndex(
  azimuths: number[],
  targetDeg: number | null | undefined,
): number | null {
  if (targetDeg === null || targetDeg === undefined || azimuths.length === 0) {
    return null
  }
  const target = normalizeAzimuthDeg(targetDeg)
  let bestIndex = 0
  let bestDelta = Infinity

  for (let i = 0; i < azimuths.length; i++) {
    const a = normalizeAzimuthDeg(azimuths[i])
    const delta = Math.min(Math.abs(a - target), 360 - Math.abs(a - target))
    if (delta < bestDelta) {
      bestDelta = delta
      bestIndex = i
    }
  }

  return bestIndex
}

function emptyCacheStats(): Horizon360CacheStats {
  return { cacheHits: 0, cacheMisses: 0, errors: 0 }
}

function recordFetchSource(
  stats: Horizon360CacheStats,
  fetchSource: import('@/features/terrain/terrainTypes').TerrainProfileFetchSource,
  status: Horizon360Sample['status'],
): void {
  if (status === 'error') {
    stats.errors += 1
    return
  }
  if (fetchSource === 'cache') {
    stats.cacheHits += 1
  } else {
    stats.cacheMisses += 1
  }
}

export async function computeOneAzimuth(
  lat: number,
  lon: number,
  azimuthDeg: number,
  settings: CalculationSettings,
  provider: TerrainProviderId,
): Promise<Horizon360Sample> {
  const terrainParams = settingsToTerrainParams(settings)

  try {
    const { profile, fetchSource } = await fetchTerrainProfile({
      observer: { lat, lon },
      azimuthDeg,
      provider,
      ...terrainParams,
    })

    if (profile.points.length < 2) {
      return {
        azimuthDeg,
        status: 'insufficient',
        profileFetchSource: fetchSource,
        error: 'Profil terrain insuffisant.',
      }
    }

    const horizonProfile = buildHorizonProfile(profile)
    const blocking = horizonProfile.blockingSample

    return {
      azimuthDeg,
      status: 'success',
      horizonAngleDeg: horizonProfile.horizonAngleDeg,
      blockingDistanceM: blocking?.distanceM ?? null,
      blockingElevationM: blocking?.elevationM ?? null,
      profileFetchSource: fetchSource,
    }
  } catch (err) {
    const terrainErr = toTerrainError(err)
    return {
      azimuthDeg,
      status: 'error',
      error: terrainErr.message,
    }
  }
}

export type ComputeHorizon360Params = {
  lat: number
  lon: number
  settings: CalculationSettings
  provider?: TerrainProviderId
  signal?: AbortSignal
  onProgress?: (current: number, total: number, sample: Horizon360Sample) => void
}

export async function computeHorizon360(
  params: ComputeHorizon360Params,
): Promise<Horizon360Result> {
  const provider = params.provider ?? 'ign'
  const azimuthStepDeg = getAzimuthStepDeg(params.settings)
  const azimuths = generateAzimuthSamples(azimuthStepDeg)
  const samples: Horizon360Sample[] = []
  const cacheStats = emptyCacheStats()

  for (let i = 0; i < azimuths.length; i++) {
    if (params.signal?.aborted) {
      return {
        samples,
        azimuthStepDeg,
        cacheStats,
        cancelled: true,
      }
    }

    const sample = await computeOneAzimuth(
      params.lat,
      params.lon,
      azimuths[i],
      params.settings,
      provider,
    )

    if (sample.profileFetchSource) {
      recordFetchSource(cacheStats, sample.profileFetchSource, sample.status)
    } else if (sample.status === 'error') {
      cacheStats.errors += 1
    }

    samples.push(sample)
    params.onProgress?.(i + 1, azimuths.length, sample)
  }

  return {
    samples,
    azimuthStepDeg,
    cacheStats,
    cancelled: false,
  }
}

export function buildHorizon360Warnings(
  samples: Horizon360Sample[],
): string[] {
  const failed = samples.filter((s) => s.status !== 'success').length
  if (failed === 0) {
    return []
  }
  return [
    `${failed} direction${failed !== 1 ? 's' : ''} sur ${samples.length} n'ont pas pu être calculées.`,
  ]
}
