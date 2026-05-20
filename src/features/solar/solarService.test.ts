import SunCalc from 'suncalc'
import { describe, expect, it } from 'vitest'
import {
  DEFAULT_SAMPLE_STEP_MS,
  getOfficialSunset,
  getSunPosition,
  getSunsetAzimuthDeg,
  sampleAroundOfficialSunset,
  SUNSET_WINDOW_AFTER_MS,
  SUNSET_WINDOW_BEFORE_MS,
} from './solarService'

const PARIS = { lat: 48.8566, lon: 2.3522 }
const SUMMER_SOLSTICE = new Date(2024, 5, 21, 12, 0, 0, 0)

describe('solarService', () => {
  it('computes official sunset for Paris on summer solstice (UTC)', () => {
    const { at } = getOfficialSunset(PARIS.lat, PARIS.lon, SUMMER_SOLSTICE)
    const utcHours = at.getUTCHours()
    const utcMinutes = at.getUTCMinutes()
    const totalMinutes = utcHours * 60 + utcMinutes
    expect(totalMinutes).toBeGreaterThan(18 * 60 + 30)
    expect(totalMinutes).toBeLessThan(21 * 60)
  })

  it('returns high altitude at solar noon', () => {
    const times = SunCalc.getTimes(SUMMER_SOLSTICE, PARIS.lat, PARIS.lon)
    const position = getSunPosition(PARIS.lat, PARIS.lon, times.solarNoon, {
      applyRefraction: false,
    })
    expect(position.altitudeDeg).toBeGreaterThan(60)
  })

  it('returns azimuth between 0 and 360 at sunset', () => {
    const azimuth = getSunsetAzimuthDeg(PARIS.lat, PARIS.lon, SUMMER_SOLSTICE)
    expect(azimuth).toBeGreaterThanOrEqual(0)
    expect(azimuth).toBeLessThan(360)
    expect(azimuth).toBeGreaterThan(200)
    expect(azimuth).toBeLessThan(330)
  })

  it('samples window around official sunset', () => {
    const samples = sampleAroundOfficialSunset(
      PARIS.lat,
      PARIS.lon,
      SUMMER_SOLSTICE,
    )
    const expectedCount =
      Math.floor(
        (SUNSET_WINDOW_BEFORE_MS + SUNSET_WINDOW_AFTER_MS) /
          DEFAULT_SAMPLE_STEP_MS,
      ) + 1
    expect(samples.length).toBe(expectedCount)
    expect(samples[0].altitudeDeg).toBeDefined()
    expect(samples.at(-1)?.azimuthDeg).toBeGreaterThanOrEqual(0)
  })

  it('increases apparent altitude with refraction near horizon', () => {
    const { at } = getOfficialSunset(PARIS.lat, PARIS.lon, SUMMER_SOLSTICE)
    const without = getSunPosition(PARIS.lat, PARIS.lon, at, {
      applyRefraction: false,
    })
    const withRefraction = getSunPosition(PARIS.lat, PARIS.lon, at, {
      applyRefraction: true,
    })
    expect(withRefraction.altitudeDeg).toBeGreaterThan(without.altitudeDeg)
  })
})
