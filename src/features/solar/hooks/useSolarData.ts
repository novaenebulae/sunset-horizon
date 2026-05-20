import { useMemo } from 'react'
import type { ObserverPosition } from '@/features/map/types'
import {
  getOfficialSunset,
  getSunsetAzimuthDeg,
  sampleAroundOfficialSunset,
} from '../solarService'
import type { OfficialSunsetResult, SunsetSample } from '../types'

export type SolarDataResult = {
  isReady: boolean
  officialSunset: OfficialSunsetResult | null
  sunsetAzimuthDeg: number | null
  samples: SunsetSample[]
  error: string | null
}

type UseSolarDataParams = {
  position: ObserverPosition | null
  observationDate: Date
  applyRefraction?: boolean
}

export function useSolarData({
  position,
  observationDate,
  applyRefraction = true,
}: UseSolarDataParams): SolarDataResult {
  return useMemo(() => {
    if (!position) {
      return {
        isReady: false,
        officialSunset: null,
        sunsetAzimuthDeg: null,
        samples: [],
        error: null,
      }
    }

    try {
      const options = { applyRefraction }
      const officialSunset = getOfficialSunset(
        position.lat,
        position.lon,
        observationDate,
      )
      const sunsetAzimuthDeg = getSunsetAzimuthDeg(
        position.lat,
        position.lon,
        observationDate,
        options,
      )
      const samples = sampleAroundOfficialSunset(
        position.lat,
        position.lon,
        observationDate,
        options,
      )

      return {
        isReady: true,
        officialSunset,
        sunsetAzimuthDeg,
        samples,
        error: null,
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Calcul solaire impossible.'
      return {
        isReady: false,
        officialSunset: null,
        sunsetAzimuthDeg: null,
        samples: [],
        error: message,
      }
    }
  }, [
    position?.lat,
    position?.lon,
    observationDate.getTime(),
    applyRefraction,
  ])
}
