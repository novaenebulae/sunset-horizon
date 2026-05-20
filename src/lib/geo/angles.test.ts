import { describe, expect, it } from 'vitest'
import { degToRad, normalizeDegrees, radToDeg } from './angles'

describe('angles', () => {
  it('degToRad converts 180° to π', () => {
    expect(degToRad(180)).toBeCloseTo(Math.PI)
  })

  it('radToDeg converts π to 180°', () => {
    expect(radToDeg(Math.PI)).toBeCloseTo(180)
  })

  it('normalizeDegrees wraps negative angles', () => {
    expect(normalizeDegrees(-90)).toBeCloseTo(270)
  })

  it('normalizeDegrees wraps angles above 360', () => {
    expect(normalizeDegrees(450)).toBeCloseTo(90)
  })
})
