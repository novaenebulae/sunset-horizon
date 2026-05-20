import SunCalc from 'suncalc'
import { normalizeDegrees, radToDeg } from '@/lib/geo'
import { applyRefraction } from './refraction'
import type {
  OfficialSunsetResult,
  SolarServiceOptions,
  SolarWindowOptions,
  SunPosition,
  SunsetSample,
} from './types'

export const SUNSET_WINDOW_BEFORE_MS = 120 * 60 * 1000
export const SUNSET_WINDOW_AFTER_MS = 30 * 60 * 1000
export const DEFAULT_SAMPLE_STEP_MS = 60 * 1000

function observationDayReference(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0)
}

function sunCalcAzimuthToDeg(azimuthRad: number): number {
  return normalizeDegrees(radToDeg(azimuthRad) + 180)
}

export function getOfficialSunset(
  lat: number,
  lon: number,
  date: Date,
): OfficialSunsetResult {
  const times = SunCalc.getTimes(observationDayReference(date), lat, lon)

  if (!times.sunset || Number.isNaN(times.sunset.getTime())) {
    throw new Error(
      'Aucun coucher de soleil pour cette date et ce lieu (nuit polaire ou jour polaire).',
    )
  }

  if (
    times.sunrise &&
    !Number.isNaN(times.sunrise.getTime()) &&
    times.sunset.getTime() <= times.sunrise.getTime()
  ) {
    throw new Error(
      'Aucun coucher de soleil pour cette date et ce lieu (nuit polaire ou jour polaire).',
    )
  }

  return { at: times.sunset }
}

export function getSunPosition(
  lat: number,
  lon: number,
  at: Date,
  options: SolarServiceOptions = {},
): SunPosition {
  const { applyRefraction: useRefraction = true } = options
  const position = SunCalc.getPosition(at, lat, lon)
  const altitudeDeg = applyRefraction(
    radToDeg(position.altitude),
    useRefraction,
  )

  return {
    altitudeDeg,
    azimuthDeg: sunCalcAzimuthToDeg(position.azimuth),
  }
}

export function getSunsetAzimuthDeg(
  lat: number,
  lon: number,
  date: Date,
  options: SolarServiceOptions = {},
): number {
  const { at } = getOfficialSunset(lat, lon, date)
  return getSunPosition(lat, lon, at, options).azimuthDeg
}

export function sampleAroundOfficialSunset(
  lat: number,
  lon: number,
  date: Date,
  options: SolarWindowOptions = {},
): SunsetSample[] {
  const {
    applyRefraction: useRefraction = true,
    stepMs = DEFAULT_SAMPLE_STEP_MS,
    windowBeforeMs = SUNSET_WINDOW_BEFORE_MS,
    windowAfterMs = SUNSET_WINDOW_AFTER_MS,
  } = options

  const { at: sunset } = getOfficialSunset(lat, lon, date)
  const startMs = sunset.getTime() - windowBeforeMs
  const endMs = sunset.getTime() + windowAfterMs
  const samples: SunsetSample[] = []

  for (let t = startMs; t <= endMs; t += stepMs) {
    const at = new Date(t)
    const position = getSunPosition(lat, lon, at, {
      applyRefraction: useRefraction,
    })
    samples.push({
      at,
      altitudeDeg: position.altitudeDeg,
      azimuthDeg: position.azimuthDeg,
    })
  }

  return samples
}
