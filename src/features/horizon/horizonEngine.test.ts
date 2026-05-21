import { describe, expect, it } from 'vitest'
import type { TerrainProfileResult } from '@/features/terrain/terrainTypes'
import {
  buildHorizonProfile,
  buildTerrainSamples,
  computeApparentAngleDeg,
  findBlockingSample,
} from './horizonEngine'

const OBSERVER = { lat: 48.8566, lon: 2.3522, elevationM: 400 }

function syntheticProfile(
  points: Array<{ distanceM: number; elevationM: number }>,
): TerrainProfileResult {
  return {
    observer: OBSERVER,
    azimuthDeg: 270,
    source: 'mock',
    points: points.map((p) => ({
      lat: OBSERVER.lat,
      lon: OBSERVER.lon,
      distanceM: p.distanceM,
      elevationM: p.elevationM,
    })),
  }
}

describe('horizonEngine', () => {
  it('computes apparent angle for a known slope', () => {
    const angle = computeApparentAngleDeg(400, 750, 1000)
    expect(angle).toBeCloseTo(19.29, 1)
  })

  it('returns zero apparent angle at distance zero', () => {
    expect(computeApparentAngleDeg(400, 800, 0)).toBe(0)
  })

  it('identifies blocking sample on a hill at 8 km', () => {
    const profile = syntheticProfile([
      { distanceM: 0, elevationM: 400 },
      { distanceM: 2000, elevationM: 420 },
      { distanceM: 8000, elevationM: 750 },
      { distanceM: 15000, elevationM: 450 },
    ])

    const samples = buildTerrainSamples(profile)
    const blocking = findBlockingSample(samples)

    expect(blocking).not.toBeNull()
    expect(blocking?.distanceM).toBe(8000)
    expect(blocking?.apparentAngleDeg).toBeGreaterThan(2)
  })

  it('sets horizonAngleDeg to blocking sample angle', () => {
    const profile = syntheticProfile([
      { distanceM: 0, elevationM: 400 },
      { distanceM: 8000, elevationM: 750 },
    ])

    const horizon = buildHorizonProfile(profile)
    expect(horizon.horizonAngleDeg).toBe(horizon.blockingSample?.apparentAngleDeg)
    expect(horizon.horizonAngleDeg).toBeGreaterThan(0)
  })

  it('returns zero horizon angle when profile has only observer point', () => {
    const profile = syntheticProfile([{ distanceM: 0, elevationM: 400 }])
    const horizon = buildHorizonProfile(profile)
    expect(horizon.blockingSample).toBeNull()
    expect(horizon.horizonAngleDeg).toBe(0)
  })
})
