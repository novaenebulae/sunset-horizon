import { describe, expect, it } from 'vitest'
import { applyRefraction, refractionCorrectionDeg } from './refraction'

describe('refraction', () => {
  it('adds positive correction near the horizon', () => {
    expect(refractionCorrectionDeg(0)).toBeGreaterThan(0.3)
  })

  it('returns zero correction well below the horizon', () => {
    expect(refractionCorrectionDeg(-5)).toBe(0)
  })

  it('leaves altitude unchanged when disabled', () => {
    expect(applyRefraction(5, false)).toBe(5)
  })

  it('increases apparent altitude when enabled', () => {
    expect(applyRefraction(0, true)).toBeGreaterThan(0)
  })
})
