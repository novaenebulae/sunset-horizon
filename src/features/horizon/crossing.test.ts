import { describe, expect, it } from 'vitest'
import { getOfficialSunset } from '@/features/solar/solarService'
import type { TerrainProfileResult } from '@/features/terrain/terrainTypes'
import type { SunsetSample } from '@/features/solar/types'
import {
  computeCorrectedSunset,
  computeDeltaMinutes,
  findCrossingBracket,
  findTerrainSunsetCrossing,
  refineCrossingByBisection,
} from './crossing'

const PARIS = { lat: 48.8566, lon: 2.3522 }
const SUMMER_SOLSTICE = new Date(2024, 5, 21, 12, 0, 0, 0)

function flatProfile(): TerrainProfileResult {
  return {
    observer: { ...PARIS, elevationM: 0 },
    azimuthDeg: 270,
    source: 'mock',
    points: [
      { lat: PARIS.lat, lon: PARIS.lon, elevationM: 0, distanceM: 0 },
      { lat: PARIS.lat, lon: PARIS.lon, elevationM: 0, distanceM: 5000 },
      { lat: PARIS.lat, lon: PARIS.lon, elevationM: 0, distanceM: 10000 },
    ],
  }
}

function makeSamples(
  entries: Array<{ offsetMin: number; altitudeDeg: number }>,
  base: Date,
): SunsetSample[] {
  return entries.map(({ offsetMin, altitudeDeg }) => ({
    at: new Date(base.getTime() + offsetMin * 60_000),
    altitudeDeg,
    azimuthDeg: 270,
  }))
}

describe('crossing', () => {
  it('finds bracket when altitude crosses horizon', () => {
    const base = new Date(2024, 5, 21, 18, 0, 0, 0)
    const samples = makeSamples(
      [
        { offsetMin: 0, altitudeDeg: 5 },
        { offsetMin: 10, altitudeDeg: 2 },
        { offsetMin: 20, altitudeDeg: -1 },
      ],
      base,
    )

    const bracket = findCrossingBracket(samples, 0)
    expect(bracket).not.toBeNull()
    expect(bracket?.before.altitudeDeg).toBeGreaterThan(0)
    expect(bracket?.after.altitudeDeg).toBeLessThanOrEqual(0)
  })

  it('returns null when no crossing in samples', () => {
    const base = new Date(2024, 5, 21, 18, 0, 0, 0)
    const samples = makeSamples(
      [
        { offsetMin: 0, altitudeDeg: 5 },
        { offsetMin: 10, altitudeDeg: 3 },
      ],
      base,
    )
    expect(findCrossingBracket(samples, 0)).toBeNull()
  })

  it('refines crossing time between bracket bounds', () => {
    const tBefore = new Date(2024, 5, 21, 19, 0, 0, 0)
    const tAfter = new Date(2024, 5, 21, 21, 0, 0, 0)
    const at = refineCrossingByBisection(
      PARIS.lat,
      PARIS.lon,
      tBefore,
      tAfter,
      0,
      { refineStepMs: 10_000 },
    )

    expect(at.getTime()).toBeGreaterThan(tBefore.getTime())
    expect(at.getTime()).toBeLessThanOrEqual(tAfter.getTime())
  })

  it('computes delta in minutes', () => {
    const official = new Date(2024, 5, 21, 21, 0, 0, 0)
    const terrain = new Date(2024, 5, 21, 21, 12, 0, 0)
    expect(computeDeltaMinutes(official, terrain)).toBeCloseTo(12, 1)
  })

  it('finds terrain sunset when sun is already below horizon at window start', () => {
    const result = findTerrainSunsetCrossing(
      PARIS.lat,
      PARIS.lon,
      SUMMER_SOLSTICE,
      8,
    )
    expect('at' in result).toBe(true)
    if ('at' in result) {
      expect(result.at.getTime()).toBeLessThan(
        getOfficialSunset(PARIS.lat, PARIS.lon, SUMMER_SOLSTICE).at.getTime(),
      )
    }
  })

  it('terrain sunset is near official for flat horizon profile', () => {
    const result = computeCorrectedSunset({
      lat: PARIS.lat,
      lon: PARIS.lon,
      date: SUMMER_SOLSTICE,
      profile: flatProfile(),
    })

    expect(result.terrainSunset).not.toBeNull()
    expect(result.deltaMinutes).not.toBeNull()
    expect(Math.abs(result.deltaMinutes!)).toBeLessThan(5)
  })
})
