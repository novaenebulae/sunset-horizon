import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { SunsetResult } from '@/features/horizon/horizonTypes'
import type { SavedSpot } from '@/features/spots/spotTypes'
import type { SpotComparisonRow } from './comparisonTypes'
import {
  compareOneSpot,
  compareSpots,
  markBestSpot,
  pickBestSpotIds,
  runWithConcurrency,
  sortComparisonRows,
} from './comparisonService'

vi.mock('@/features/solar/solarService', () => ({
  getSunsetAzimuthDeg: vi.fn(() => 270),
}))

vi.mock('@/features/terrain/terrainProfile', () => ({
  fetchTerrainProfile: vi.fn(),
}))

vi.mock('@/features/horizon/crossing', () => ({
  computeCorrectedSunset: vi.fn(),
}))

import { fetchTerrainProfile } from '@/features/terrain/terrainProfile'
import { computeCorrectedSunset } from '@/features/horizon/crossing'

const baseSpot: Pick<SavedSpot, 'id' | 'name' | 'latitude' | 'longitude'> = {
  id: 'spot-a',
  name: 'Spot A',
  latitude: 48.85,
  longitude: 2.35,
}

const settings = {
  precisionMode: 'balanced' as const,
  maxDistanceM: 20_000,
  sampleStepM: 200,
  timeStepSeconds: 60,
  refinementStepSeconds: 10,
  refractionEnabled: true,
  terrainDebugEnabled: false,
  terrainCachePanelEnabled: false,
}

function makeSunsetResult(terrainAt: Date): SunsetResult {
  return {
    officialSunset: new Date('2026-05-21T18:00:00'),
    terrainSunset: terrainAt,
    deltaMinutes: 5,
    sunsetAzimuthDeg: 270,
    horizonProfile: {
      observer: { lat: 48.85, lon: 2.35, elevation: 100 },
      azimuthDeg: 270,
      samples: [],
      blockingSample: {
        point: { lat: 48.86, lon: 2.35, elevation: 200 },
        distanceM: 1500,
        elevationM: 200,
        apparentAngleDeg: 2,
      },
      horizonAngleDeg: 2,
      source: 'ign-geoplateforme',
    },
    uncertaintyMinutes: 3,
    warnings: [],
  }
}

function row(
  partial: Partial<SpotComparisonRow> & Pick<SpotComparisonRow, 'spotId' | 'name'>,
): SpotComparisonRow {
  return {
    latitude: 0,
    longitude: 0,
    status: 'success',
    ...partial,
  }
}

describe('pickBestSpotIds / markBestSpot', () => {
  it('picks the latest terrainSunset', () => {
    const rows: SpotComparisonRow[] = [
      row({
        spotId: 'a',
        name: 'A',
        terrainSunset: new Date('2026-05-21T19:00:00'),
      }),
      row({
        spotId: 'b',
        name: 'B',
        terrainSunset: new Date('2026-05-21T19:30:00'),
      }),
    ]
    expect(pickBestSpotIds(rows)).toEqual(new Set(['b']))
    const marked = markBestSpot(rows)
    expect(marked.find((r) => r.spotId === 'b')?.isBest).toBe(true)
    expect(marked.find((r) => r.spotId === 'a')?.isBest).toBe(false)
  })

  it('marks all tied best spots', () => {
    const t = new Date('2026-05-21T19:30:00')
    const rows: SpotComparisonRow[] = [
      row({ spotId: 'a', name: 'A', terrainSunset: t }),
      row({ spotId: 'b', name: 'B', terrainSunset: t }),
    ]
    expect(pickBestSpotIds(rows)).toEqual(new Set(['a', 'b']))
    const marked = markBestSpot(rows)
    expect(marked.filter((r) => r.isBest)).toHaveLength(2)
  })

  it('returns empty when no success', () => {
    const rows: SpotComparisonRow[] = [
      row({ spotId: 'a', name: 'A', status: 'error' }),
    ]
    expect(pickBestSpotIds(rows).size).toBe(0)
    expect(markBestSpot(rows).every((r) => !r.isBest)).toBe(true)
  })
})

describe('sortComparisonRows', () => {
  const rows: SpotComparisonRow[] = [
    row({
      spotId: 'b',
      name: 'Bravo',
      status: 'error',
      terrainSunset: new Date('2026-05-21T19:00:00'),
      deltaMinutes: 10,
    }),
    row({
      spotId: 'a',
      name: 'Alpha',
      status: 'success',
      terrainSunset: new Date('2026-05-21T20:00:00'),
      deltaMinutes: 2,
    }),
  ]

  it('sorts by name', () => {
    const sorted = sortComparisonRows(rows, 'name', 'asc')
    expect(sorted.map((r) => r.name)).toEqual(['Alpha', 'Bravo'])
  })

  it('sorts by terrainSunset desc', () => {
    const sorted = sortComparisonRows(rows, 'terrainSunset', 'desc')
    expect(sorted[0].spotId).toBe('a')
  })

  it('sorts by delta', () => {
    const sorted = sortComparisonRows(rows, 'delta', 'asc')
    expect(sorted[0].deltaMinutes).toBe(2)
  })

  it('sorts by status', () => {
    const sorted = sortComparisonRows(rows, 'status', 'asc')
    expect(sorted[0].status).toBe('success')
  })
})

describe('runWithConcurrency', () => {
  it('limits active workers', async () => {
    let active = 0
    let maxActive = 0
    const tasks = Array.from({ length: 5 }, (_, i) => async () => {
      active += 1
      maxActive = Math.max(maxActive, active)
      await new Promise((r) => setTimeout(r, 20))
      active -= 1
      return i
    })
    const results = await runWithConcurrency(tasks, 2)
    expect(results).toEqual([0, 1, 2, 3, 4])
    expect(maxActive).toBeLessThanOrEqual(2)
  })
})

describe('compareOneSpot / compareSpots', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns insufficient when profile has fewer than 2 points', async () => {
    vi.mocked(fetchTerrainProfile).mockResolvedValue({
      profile: {
        observer: { lat: 48.85, lon: 2.35, elevationM: 100 },
        azimuthDeg: 270,
        points: [{ lat: 48.85, lon: 2.35, elevationM: 100, distanceM: 0 }],
        source: 'ign-geoplateforme',
      },
      fetchSource: 'ign-geoplateforme',
    })

    const result = await compareOneSpot({
      spot: baseSpot,
      observationDate: new Date('2026-05-21'),
      settings,
    })
    expect(result.status).toBe('insufficient')
  })

  it('returns success with mapped fields', async () => {
    const terrainAt = new Date('2026-05-21T19:45:00')
    vi.mocked(fetchTerrainProfile).mockResolvedValue({
      profile: {
        observer: { lat: 48.85, lon: 2.35, elevationM: 100 },
        azimuthDeg: 270,
        points: [
          { lat: 48.85, lon: 2.35, elevationM: 100, distanceM: 0 },
          { lat: 48.86, lon: 2.35, elevationM: 150, distanceM: 500 },
        ],
        source: 'ign-geoplateforme',
      },
      fetchSource: 'cache',
    })
    vi.mocked(computeCorrectedSunset).mockReturnValue(makeSunsetResult(terrainAt))

    const result = await compareOneSpot({
      spot: baseSpot,
      observationDate: new Date('2026-05-21'),
      settings,
    })
    expect(result.status).toBe('success')
    expect(result.terrainSunset).toEqual(terrainAt)
    expect(result.blockingDistanceM).toBe(1500)
    expect(result.profileFetchSource).toBe('cache')
  })

  it('isolates errors per spot in compareSpots', async () => {
    const spotB = { ...baseSpot, id: 'spot-b', name: 'Spot B' }
    vi.mocked(fetchTerrainProfile)
      .mockRejectedValueOnce(new Error('IGN down'))
      .mockResolvedValueOnce({
        profile: {
          observer: { lat: 48.85, lon: 2.35, elevationM: 100 },
          azimuthDeg: 270,
          points: [
            { lat: 48.85, lon: 2.35, elevationM: 100, distanceM: 0 },
            { lat: 48.86, lon: 2.35, elevationM: 150, distanceM: 500 },
          ],
          source: 'ign-geoplateforme',
        },
        fetchSource: 'ign-geoplateforme',
      })
    vi.mocked(computeCorrectedSunset).mockReturnValue(
      makeSunsetResult(new Date('2026-05-21T19:00:00')),
    )

    const rows = await compareSpots([baseSpot, spotB], {
      observationDate: new Date('2026-05-21'),
      settings,
      concurrency: 2,
    })
    expect(rows).toHaveLength(2)
    expect(rows.find((r) => r.spotId === 'spot-a')?.status).toBe('error')
    expect(rows.find((r) => r.spotId === 'spot-b')?.status).toBe('success')
  })

  it('returns empty array for empty spot list', async () => {
    const rows = await compareSpots([], {
      observationDate: new Date('2026-05-21'),
      settings,
    })
    expect(rows).toEqual([])
  })
})
