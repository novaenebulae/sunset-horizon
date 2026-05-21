import { describe, expect, it } from 'vitest'
import {
  buildSampledLine,
  fetchTerrainProfile,
  getObserverElevation,
} from './terrainProfile'

const OBSERVER = { lat: 48.8566, lon: 2.3522 }

describe('terrainProfile', () => {
  it('buildSampledLine starts at observer and reaches max distance', () => {
    const line = buildSampledLine(OBSERVER, 270, 2000, 500)
    expect(line[0]).toEqual(OBSERVER)
    expect(line.length).toBe(5)
  })

  it('getObserverElevation returns mock elevation', async () => {
    const result = await getObserverElevation(OBSERVER.lat, OBSERVER.lon, 'mock')
    expect(result.source).toBe('mock')
    expect(result.elevationM).toBe(400)
  })

  it('fetchTerrainProfile mock has increasing distances', async () => {
    const profile = await fetchTerrainProfile({
      observer: OBSERVER,
      azimuthDeg: 270,
      maxDistanceM: 10_000,
      stepM: 1000,
      provider: 'mock',
    })

    expect(profile.source).toBe('mock')
    expect(profile.points.length).toBeGreaterThan(1)
    expect(profile.points[0].distanceM).toBe(0)
    expect(profile.points.at(-1)?.distanceM).toBe(10_000)
    const maxElevation = Math.max(...profile.points.map((p) => p.elevationM))
    expect(maxElevation).toBeGreaterThan(500)
  })
})
