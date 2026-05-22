import { computeCorrectedSunset } from '@/features/horizon/crossing'
import type { SunsetResult } from '@/features/horizon/horizonTypes'
import {
  settingsToHorizonOptions,
  settingsToTerrainParams,
} from '@/features/settings/defaultCalculationSettings'
import { getSunsetAzimuthDeg } from '@/features/solar/solarService'
import type { SavedSpot } from '@/features/spots/spotTypes'
import { toTerrainError } from '@/features/terrain/terrainErrors'
import { fetchTerrainProfile } from '@/features/terrain/terrainProfile'
import type { TerrainProviderId } from '@/features/terrain/terrainTypes'
import type {
  CompareSpotInput,
  SpotComparisonRow,
  SpotComparisonSortDirection,
  SpotComparisonSortKey,
  SpotComparisonStatus,
} from './comparisonTypes'
import { DEFAULT_COMPARE_CONCURRENCY } from './comparisonTypes'

const STATUS_SORT_ORDER: Record<SpotComparisonStatus, number> = {
  success: 0,
  insufficient: 1,
  loading: 2,
  error: 3,
  idle: 4,
}

export function createLoadingRow(
  spot: Pick<SavedSpot, 'id' | 'name' | 'latitude' | 'longitude'>,
): SpotComparisonRow {
  return {
    spotId: spot.id,
    name: spot.name,
    latitude: spot.latitude,
    longitude: spot.longitude,
    status: 'loading',
  }
}

function mapResultToRow(
  spot: Pick<SavedSpot, 'id' | 'name' | 'latitude' | 'longitude'>,
  status: SpotComparisonStatus,
  partial: Partial<SpotComparisonRow> & {
    result?: SunsetResult
  },
): SpotComparisonRow {
  const result = partial.result
  const blocking = result?.horizonProfile.blockingSample

  return {
    spotId: spot.id,
    name: spot.name,
    latitude: spot.latitude,
    longitude: spot.longitude,
    status,
    error: partial.error,
    officialSunset: result?.officialSunset,
    terrainSunset: result?.terrainSunset ?? undefined,
    deltaMinutes: result?.deltaMinutes ?? undefined,
    sunsetAzimuthDeg: result?.sunsetAzimuthDeg,
    horizonAngleDeg: result?.horizonProfile.horizonAngleDeg,
    blockingDistanceM: blocking?.distanceM ?? null,
    blockingElevationM: blocking?.elevationM ?? null,
    terrainSource: result?.horizonProfile.source,
    profileFetchSource: partial.profileFetchSource,
    uncertaintyMinutes: result?.uncertaintyMinutes,
    warnings: result?.warnings,
    result,
  }
}

export async function compareOneSpot(
  input: CompareSpotInput,
): Promise<SpotComparisonRow> {
  const { spot, observationDate, settings, provider = 'ign' } = input
  const horizonOptions = settingsToHorizonOptions(settings)
  const terrainParams = settingsToTerrainParams(settings)

  try {
    const azimuthDeg = getSunsetAzimuthDeg(spot.latitude, spot.longitude, observationDate, {
      applyRefraction: settings.refractionEnabled,
    })

    const { profile, fetchSource } = await fetchTerrainProfile({
      observer: { lat: spot.latitude, lon: spot.longitude },
      azimuthDeg,
      provider,
      ...terrainParams,
    })

    if (profile.points.length < 2) {
      return mapResultToRow(spot, 'insufficient', {
        error: 'Profil terrain insuffisant pour le calcul.',
        profileFetchSource: fetchSource,
      })
    }

    const sunsetResult = computeCorrectedSunset({
      lat: spot.latitude,
      lon: spot.longitude,
      date: observationDate,
      profile,
      options: horizonOptions,
    })

    if (sunsetResult.terrainSunset === null) {
      return mapResultToRow(spot, 'insufficient', {
        result: sunsetResult,
        profileFetchSource: fetchSource,
        error:
          sunsetResult.warnings[0] ??
          'Impossible de déterminer le coucher corrigé.',
      })
    }

    return mapResultToRow(spot, 'success', {
      result: sunsetResult,
      profileFetchSource: fetchSource,
    })
  } catch (err) {
    const terrainErr = toTerrainError(err)
    return mapResultToRow(spot, 'error', {
      error: terrainErr.message,
    })
  }
}

export async function runWithConcurrency<T>(
  tasks: Array<() => Promise<T>>,
  limit: number,
): Promise<T[]> {
  if (tasks.length === 0) {
    return []
  }

  const results: T[] = new Array(tasks.length)
  let nextIndex = 0

  async function worker(): Promise<void> {
    while (nextIndex < tasks.length) {
      const index = nextIndex
      nextIndex += 1
      results[index] = await tasks[index]()
    }
  }

  const workers = Array.from(
    { length: Math.min(limit, tasks.length) },
    () => worker(),
  )
  await Promise.all(workers)
  return results
}

export type CompareSpotsParams = {
  observationDate: Date
  settings: CompareSpotInput['settings']
  provider?: TerrainProviderId
  concurrency?: number
}

export async function compareSpots(
  spots: CompareSpotInput['spot'][],
  params: CompareSpotsParams,
  onProgress?: (row: SpotComparisonRow) => void,
): Promise<SpotComparisonRow[]> {
  const concurrency = params.concurrency ?? DEFAULT_COMPARE_CONCURRENCY

  const tasks = spots.map((spot) => async () => {
    const row = await compareOneSpot({
      spot,
      observationDate: params.observationDate,
      settings: params.settings,
      provider: params.provider,
    })
    onProgress?.(row)
    return row
  })

  return runWithConcurrency(tasks, concurrency)
}

export function pickBestSpotIds(rows: SpotComparisonRow[]): Set<string> {
  const successful = rows.filter(
    (row) => row.status === 'success' && row.terrainSunset != null,
  )
  if (successful.length === 0) {
    return new Set()
  }

  let latestMs = -Infinity
  for (const row of successful) {
    const ms = row.terrainSunset!.getTime()
    if (ms > latestMs) {
      latestMs = ms
    }
  }

  const bestIds = successful
    .filter((row) => row.terrainSunset!.getTime() === latestMs)
    .map((row) => row.spotId)

  return new Set(bestIds)
}

export function markBestSpot(rows: SpotComparisonRow[]): SpotComparisonRow[] {
  const bestIds = pickBestSpotIds(rows)
  return rows.map((row) => ({
    ...row,
    isBest: bestIds.has(row.spotId),
  }))
}

function compareStatus(a: SpotComparisonStatus, b: SpotComparisonStatus): number {
  return STATUS_SORT_ORDER[a] - STATUS_SORT_ORDER[b]
}

export function sortComparisonRows(
  rows: SpotComparisonRow[],
  key: SpotComparisonSortKey,
  direction: SpotComparisonSortDirection = 'asc',
): SpotComparisonRow[] {
  const sorted = [...rows].sort((a, b) => {
    let cmp = 0
    switch (key) {
      case 'name':
        cmp = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
        break
      case 'terrainSunset': {
        const aMs = a.terrainSunset?.getTime() ?? -Infinity
        const bMs = b.terrainSunset?.getTime() ?? -Infinity
        cmp = aMs - bMs
        break
      }
      case 'delta': {
        const aDelta = a.deltaMinutes ?? -Infinity
        const bDelta = b.deltaMinutes ?? -Infinity
        cmp = aDelta - bDelta
        break
      }
      case 'status':
        cmp = compareStatus(a.status, b.status)
        break
      default:
        cmp = 0
    }
    if (cmp === 0) {
      cmp = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    }
    return direction === 'asc' ? cmp : -cmp
  })
  return sorted
}
