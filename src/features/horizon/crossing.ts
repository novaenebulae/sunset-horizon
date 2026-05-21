import {
  DEFAULT_SAMPLE_STEP_MS,
  getOfficialSunset,
  getSunPosition,
  getSunsetAzimuthDeg,
  sampleAroundOfficialSunset,
  SUNSET_WINDOW_AFTER_MS,
  SUNSET_WINDOW_BEFORE_MS,
} from '@/features/solar/solarService'
import type { SunsetSample } from '@/features/solar/types'
import {
  buildHorizonProfile,
  estimateUncertaintyMinutes,
} from './horizonEngine'
import type {
  ComputeCorrectedSunsetParams,
  CrossingBracket,
  HorizonEngineOptions,
  SunsetResult,
} from './horizonTypes'
import { DEFAULT_REFINE_STEP_MS } from './horizonTypes'

export function findCrossingBracket(
  samples: SunsetSample[],
  horizonAngleDeg: number,
): CrossingBracket | null {
  if (samples.length < 2) {
    return null
  }

  let before: SunsetSample | null = null
  let after: SunsetSample | null = null

  for (const sample of samples) {
    if (sample.altitudeDeg > horizonAngleDeg) {
      before = sample
    } else if (before !== null) {
      after = sample
      break
    }
  }

  if (before === null || after === null) {
    return null
  }

  return {
    before: { at: before.at, altitudeDeg: before.altitudeDeg },
    after: { at: after.at, altitudeDeg: after.altitudeDeg },
  }
}

function findCrossingBackward(
  lat: number,
  lon: number,
  windowStart: Date,
  horizonAngleDeg: number,
  options: HorizonEngineOptions,
): Date | null {
  const { applyRefraction = true } = options
  const stepMs = DEFAULT_SAMPLE_STEP_MS
  let firstBelow = windowStart

  for (
    let t = windowStart.getTime() - stepMs;
    t >= windowStart.getTime() - SUNSET_WINDOW_BEFORE_MS;
    t -= stepMs
  ) {
    const at = new Date(t)
    const { altitudeDeg } = getSunPosition(lat, lon, at, { applyRefraction })

    if (altitudeDeg > horizonAngleDeg) {
      return refineCrossingByBisection(
        lat,
        lon,
        at,
        firstBelow,
        horizonAngleDeg,
        options,
      )
    }
    firstBelow = at
  }

  return null
}

function findCrossingForward(
  lat: number,
  lon: number,
  windowEnd: Date,
  horizonAngleDeg: number,
  options: HorizonEngineOptions,
): Date | null {
  const { applyRefraction = true } = options
  const stepMs = DEFAULT_SAMPLE_STEP_MS
  let lastAbove = windowEnd

  for (
    let t = windowEnd.getTime() + stepMs;
    t <= windowEnd.getTime() + SUNSET_WINDOW_AFTER_MS;
    t += stepMs
  ) {
    const at = new Date(t)
    const { altitudeDeg } = getSunPosition(lat, lon, at, { applyRefraction })

    if (altitudeDeg <= horizonAngleDeg) {
      return refineCrossingByBisection(
        lat,
        lon,
        lastAbove,
        at,
        horizonAngleDeg,
        options,
      )
    }
    lastAbove = at
  }

  return null
}

export function refineCrossingByBisection(
  lat: number,
  lon: number,
  tBefore: Date,
  tAfter: Date,
  horizonAngleDeg: number,
  options: HorizonEngineOptions = {},
): Date {
  const { applyRefraction = true, refineStepMs = DEFAULT_REFINE_STEP_MS } =
    options

  let low = tBefore.getTime()
  let high = tAfter.getTime()

  while (high - low > refineStepMs) {
    const mid = Math.floor((low + high) / 2)
    const { altitudeDeg } = getSunPosition(lat, lon, new Date(mid), {
      applyRefraction,
    })

    if (altitudeDeg > horizonAngleDeg) {
      low = mid
    } else {
      high = mid
    }
  }

  return new Date(high)
}

export function findTerrainSunsetCrossing(
  lat: number,
  lon: number,
  date: Date,
  horizonAngleDeg: number,
  options: HorizonEngineOptions = {},
): { at: Date } | { warning: string } {
  const samples = sampleAroundOfficialSunset(lat, lon, date, options)
  const bracket = findCrossingBracket(samples, horizonAngleDeg)

  if (!bracket) {
    const first = samples[0]
    const last = samples.at(-1)
    const branch =
      first && first.altitudeDeg <= horizonAngleDeg
        ? 'already_below'
        : last && last.altitudeDeg > horizonAngleDeg
          ? 'stays_above'
          : 'no_crossing'

    if (branch === 'already_below') {
      const backward = findCrossingBackward(
        lat,
        lon,
        first!.at,
        horizonAngleDeg,
        options,
      )
      if (backward) {
        return { at: backward }
      }
      return {
        warning:
          'Le soleil est déjà sous l\'horizon effectif au début de la fenêtre de recherche.',
      }
    }
    if (branch === 'stays_above') {
      const forward = findCrossingForward(
        lat,
        lon,
        last!.at,
        horizonAngleDeg,
        options,
      )
      if (forward) {
        return { at: forward }
      }
      return {
        warning:
          'Le soleil reste au-dessus de l\'horizon effectif sur toute la fenêtre de recherche.',
      }
    }
    return { warning: 'Aucun croisement soleil / horizon trouvé.' }
  }

  const at = refineCrossingByBisection(
    lat,
    lon,
    bracket.before.at,
    bracket.after.at,
    horizonAngleDeg,
    options,
  )

  return { at }
}

export function computeDeltaMinutes(
  officialSunset: Date,
  terrainSunset: Date,
): number {
  return (terrainSunset.getTime() - officialSunset.getTime()) / 60_000
}

export function computeCorrectedSunset(
  params: ComputeCorrectedSunsetParams,
): SunsetResult {
  const { lat, lon, date, profile, options = {} } = params
  const horizonProfile = buildHorizonProfile(profile)
  const { at: officialSunset } = getOfficialSunset(lat, lon, date)
  const sunsetAzimuthDeg = getSunsetAzimuthDeg(lat, lon, date, options)
  const warnings: string[] = []

  if (horizonProfile.samples.filter((s) => s.distanceM > 0).length === 0) {
    warnings.push('Profil terrain insuffisant pour calculer l\'horizon effectif.')
    return {
      officialSunset,
      terrainSunset: null,
      deltaMinutes: null,
      sunsetAzimuthDeg,
      horizonProfile,
      uncertaintyMinutes: estimateUncertaintyMinutes(horizonProfile.source),
      warnings,
    }
  }

  const crossing = findTerrainSunsetCrossing(
    lat,
    lon,
    date,
    horizonProfile.horizonAngleDeg,
    options,
  )

  if ('warning' in crossing) {
    warnings.push(crossing.warning)
    return {
      officialSunset,
      terrainSunset: null,
      deltaMinutes: null,
      sunsetAzimuthDeg,
      horizonProfile,
      uncertaintyMinutes: estimateUncertaintyMinutes(horizonProfile.source),
      warnings,
    }
  }

  const terrainSunset = crossing.at
  const deltaMinutes = computeDeltaMinutes(officialSunset, terrainSunset)

  return {
    officialSunset,
    terrainSunset,
    deltaMinutes,
    sunsetAzimuthDeg,
    horizonProfile,
    uncertaintyMinutes: estimateUncertaintyMinutes(horizonProfile.source),
    warnings,
  }
}
