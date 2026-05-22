import { describe, expect, it, vi, beforeEach } from 'vitest'
import { DEFAULT_CALCULATION_SETTINGS } from '@/features/settings/defaultCalculationSettings'
import {
  azimuthDeltaFromCenter,
  azimuthFromCenterDelta,
  computeCenteredAzimuthDomain,
  computeHorizon360,
  findNearestAzimuthIndex,
  generateAzimuthSamples,
  getAzimuthStepDeg,
} from './horizon360Service'

vi.mock('@/features/terrain/terrainProfile', () => ({
  fetchTerrainProfile: vi.fn(),
}))

import { fetchTerrainProfile } from '@/features/terrain/terrainProfile'

const baseProfile = {
  observer: { lat: 48.85, lon: 2.35, elevationM: 100 },
  azimuthDeg: 0,
  points: [
    { lat: 48.85, lon: 2.35, elevationM: 100, distanceM: 0 },
    { lat: 48.86, lon: 2.35, elevationM: 200, distanceM: 500 },
  ],
  source: 'ign-geoplateforme' as const,
}

describe('horizon360Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getAzimuthStepDeg follows precision mode', () => {
    expect(getAzimuthStepDeg({ ...DEFAULT_CALCULATION_SETTINGS, precisionMode: 'fast' })).toBe(30)
    expect(getAzimuthStepDeg({ ...DEFAULT_CALCULATION_SETTINGS, precisionMode: 'balanced' })).toBe(15)
    expect(getAzimuthStepDeg({ ...DEFAULT_CALCULATION_SETTINGS, precisionMode: 'precise' })).toBe(10)
  })

  it('generateAzimuthSamples produces 24 directions at 15°', () => {
    const azimuths = generateAzimuthSamples(15)
    expect(azimuths).toHaveLength(24)
    expect(azimuths[0]).toBe(0)
    expect(azimuths[23]).toBe(345)
  })

  it('azimuthDeltaFromCenter wraps correctly', () => {
    expect(azimuthDeltaFromCenter(10, 350)).toBe(20)
    expect(azimuthDeltaFromCenter(350, 10)).toBe(-20)
    expect(azimuthDeltaFromCenter(270, 270)).toBe(0)
  })

  it('computeCenteredAzimuthDomain is symmetric around sunset', () => {
    const domain = computeCenteredAzimuthDomain([-80, -10, 0, 15, 70])
    expect(domain[0]).toBe(-domain[1])
    expect(domain[0]).toBeLessThanOrEqual(-80)
  })

  it('azimuthFromCenterDelta inverts delta', () => {
    expect(azimuthFromCenterDelta(270, 15)).toBe(285)
    expect(azimuthFromCenterDelta(270, -15)).toBe(255)
  })

  it('findNearestAzimuthIndex picks closest azimuth to sunset', () => {
    const azimuths = generateAzimuthSamples(15)
    const index = findNearestAzimuthIndex(azimuths, 272)
    expect(index).not.toBeNull()
    expect(azimuths[index!]).toBe(270)
  })

  it('returns partial results when some azimuths fail', async () => {
    vi.mocked(fetchTerrainProfile)
      .mockRejectedValueOnce(new Error('IGN down'))
      .mockResolvedValue({
        profile: baseProfile,
        fetchSource: 'ign-geoplateforme',
      })

    const result = await computeHorizon360({
      lat: 48.85,
      lon: 2.35,
      settings: { ...DEFAULT_CALCULATION_SETTINGS, precisionMode: 'fast' },
    })

    expect(result.samples.length).toBeGreaterThan(1)
    expect(result.samples.some((s) => s.status === 'error')).toBe(true)
    expect(result.samples.some((s) => s.status === 'success')).toBe(true)
    expect(result.cacheStats.errors).toBeGreaterThan(0)
  })

  it('continues on insufficient profile', async () => {
    vi.mocked(fetchTerrainProfile)
      .mockResolvedValueOnce({
        profile: {
          ...baseProfile,
          points: [{ lat: 48.85, lon: 2.35, elevationM: 100, distanceM: 0 }],
        },
        fetchSource: 'ign-geoplateforme',
      })
      .mockResolvedValue({
        profile: baseProfile,
        fetchSource: 'cache',
      })

    const result = await computeHorizon360({
      lat: 48.85,
      lon: 2.35,
      settings: { ...DEFAULT_CALCULATION_SETTINGS, precisionMode: 'fast' },
    })

    expect(result.samples.some((s) => s.status === 'insufficient')).toBe(true)
    expect(result.samples.some((s) => s.status === 'success')).toBe(true)
    expect(result.cacheStats.cacheHits).toBeGreaterThan(0)
  })

  it('stops early when aborted', async () => {
    vi.mocked(fetchTerrainProfile).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(
            () =>
              resolve({
                profile: baseProfile,
                fetchSource: 'ign-geoplateforme',
              }),
            5,
          )
        }),
    )

    const controller = new AbortController()
    const promise = computeHorizon360({
      lat: 48.85,
      lon: 2.35,
      settings: { ...DEFAULT_CALCULATION_SETTINGS, precisionMode: 'fast' },
      signal: controller.signal,
    })

    controller.abort()

    const result = await promise
    expect(result.cancelled).toBe(true)
    expect(result.samples.length).toBeLessThan(12)
  })
})
