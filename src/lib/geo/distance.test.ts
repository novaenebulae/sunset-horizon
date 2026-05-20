import { describe, expect, it } from 'vitest'
import { haversineDistanceM } from './distance'

describe('haversineDistanceM', () => {
  it('returns 0 for identical points', () => {
    const point = { lat: 48.8566, lon: 2.3522 }
    expect(haversineDistanceM(point, point)).toBe(0)
  })

  it('computes Paris–Lyon distance within 5 km', () => {
    const paris = { lat: 48.8566, lon: 2.3522 }
    const lyon = { lat: 45.764, lon: 4.8357 }
    const distance = haversineDistanceM(paris, lyon)
    expect(distance).toBeGreaterThan(390_000)
    expect(distance).toBeLessThan(400_000)
  })
})
