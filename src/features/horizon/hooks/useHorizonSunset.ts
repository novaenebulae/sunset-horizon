import { useEffect, useRef, useState } from 'react'
import type { ObserverPosition } from '@/features/map/types'
import { fetchTerrainProfile } from '@/features/terrain/terrainProfile'
import { toTerrainError } from '@/features/terrain/terrainErrors'
import type {
  TerrainProfileResult,
  TerrainProviderId,
} from '@/features/terrain/terrainTypes'
import { computeCorrectedSunset } from '../crossing'
import type { SunsetResult } from '../horizonTypes'

export type HorizonSunsetState =
  | 'idle'
  | 'ready'
  | 'loading'
  | 'success'
  | 'error'
  | 'insufficient'

export type UseHorizonSunsetResult = {
  state: HorizonSunsetState
  result: SunsetResult | null
  error: string | null
  provider: TerrainProviderId
}

type UseHorizonSunsetParams = {
  position: ObserverPosition | null
  observationDate: Date
  sunsetAzimuthDeg: number | null
  applyRefraction?: boolean
  provider?: TerrainProviderId
  profileOverride?: TerrainProfileResult | null
  debounceMs?: number
}

const DEFAULT_AZIMUTH_DEG = 270
const DEFAULT_DEBOUNCE_MS = 400

function applySunsetResult(
  sunsetResult: SunsetResult,
  setState: (s: HorizonSunsetState) => void,
  setResult: (r: SunsetResult | null) => void,
  setError: (e: string | null) => void,
) {
  if (sunsetResult.terrainSunset === null) {
    setState('insufficient')
    setResult(sunsetResult)
    setError(
      sunsetResult.warnings[0] ??
        'Impossible de déterminer le coucher corrigé.',
    )
    return
  }

  setState('success')
  setResult(sunsetResult)
  setError(null)
}

export function useHorizonSunset({
  position,
  observationDate,
  sunsetAzimuthDeg,
  applyRefraction = true,
  provider = 'mock',
  profileOverride = null,
  debounceMs = DEFAULT_DEBOUNCE_MS,
}: UseHorizonSunsetParams): UseHorizonSunsetResult {
  const [state, setState] = useState<HorizonSunsetState>('idle')
  const [result, setResult] = useState<SunsetResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const requestIdRef = useRef(0)

  useEffect(() => {
    if (!position) {
      setState('idle')
      setResult(null)
      setError(null)
      return
    }

    if (sunsetAzimuthDeg === null) {
      setState('ready')
      setResult(null)
      setError(null)
      return
    }

    setState('loading')
    setError(null)

    const requestId = ++requestIdRef.current
    const azimuthDeg = sunsetAzimuthDeg ?? DEFAULT_AZIMUTH_DEG

    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          let profile: TerrainProfileResult

          if (profileOverride) {
            profile = profileOverride
          } else {
            profile = await fetchTerrainProfile({
              observer: { lat: position.lat, lon: position.lon },
              azimuthDeg,
              provider,
            })
          }

          if (requestId !== requestIdRef.current) return

          if (profile.points.length < 2) {
            setState('insufficient')
            setResult(null)
            setError('Profil terrain insuffisant pour le calcul.')
            return
          }

          const sunsetResult = computeCorrectedSunset({
            lat: position.lat,
            lon: position.lon,
            date: observationDate,
            profile,
            options: { applyRefraction },
          })

          if (requestId !== requestIdRef.current) return

          applySunsetResult(sunsetResult, setState, setResult, setError)
        } catch (err) {
          if (requestId !== requestIdRef.current) return
          const terrainErr = toTerrainError(err)
          setState('error')
          setResult(null)
          setError(terrainErr.message)
        }
      })()
    }, debounceMs)

    return () => {
      window.clearTimeout(timer)
    }
  }, [
    position?.lat,
    position?.lon,
    observationDate.getTime(),
    sunsetAzimuthDeg,
    applyRefraction,
    provider,
    profileOverride,
    debounceMs,
  ])

  return { state, result, error, provider }
}
