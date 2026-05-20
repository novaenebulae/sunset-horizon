import { describe, expect, it } from 'vitest'
import { haversineDistanceM } from './distance'
import { destinationPoint, initialBearingDeg } from './destination'

describe('destinationPoint', () => {
  it('moves 1 km north from origin', () => {
    const origin = { lat: 48.0, lon: 2.0 }
    const dest = destinationPoint(origin, 0, 1000)
    expect(dest.lat).toBeGreaterThan(origin.lat)
    expect(dest.lon).toBeCloseTo(origin.lon, 2)
    expect(haversineDistanceM(origin, dest)).toBeCloseTo(1000, -1)
  })

  it('moves 1 km east from origin', () => {
    const origin = { lat: 48.0, lon: 2.0 }
    const dest = destinationPoint(origin, 90, 1000)
    expect(dest.lon).toBeGreaterThan(origin.lon)
    expect(haversineDistanceM(origin, dest)).toBeCloseTo(1000, -1)
  })
})

describe('initialBearingDeg', () => {
  it('returns ~0° for northward travel', () => {
    const from = { lat: 48.0, lon: 2.0 }
    const to = { lat: 49.0, lon: 2.0 }
    expect(initialBearingDeg(from, to)).toBeCloseTo(0, 0)
  })

  it('returns ~90° for eastward travel', () => {
    const from = { lat: 48.0, lon: 2.0 }
    const to = { lat: 48.0, lon: 3.0 }
    expect(initialBearingDeg(from, to)).toBeCloseTo(90, 0)
  })
})
