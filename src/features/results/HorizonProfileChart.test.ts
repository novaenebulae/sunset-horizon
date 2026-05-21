import { describe, expect, it } from 'vitest'
import { elevationAxisDomain } from './HorizonProfileChart'

describe('elevationAxisDomain', () => {
  it('cadre le domaine entre min et max avec marge', () => {
    const [min, max] = elevationAxisDomain([1200, 1500, 1300])
    expect(min).toBeLessThan(1200)
    expect(max).toBeGreaterThan(1500)
    expect(max - min).toBeLessThan(500)
  })

  it('ne part pas de zéro pour des altitudes élevées', () => {
    const [min] = elevationAxisDomain([2400, 2450, 2420])
    expect(min).toBeGreaterThan(2000)
  })

  it('gère un profil plat', () => {
    const [min, max] = elevationAxisDomain([800, 800, 800])
    expect(min).toBeLessThan(800)
    expect(max).toBeGreaterThan(800)
  })
})
