import { useCallback, useRef, useState } from 'react'
import type { ObserverPosition } from '@/features/map/types'
import type { CalculationSettings } from '@/features/settings/calculationSettingsTypes'
import type { TerrainProviderId } from '@/features/terrain/terrainTypes'
import {
  buildHorizon360Warnings,
  computeHorizon360,
  getAzimuthStepDeg,
} from './horizon360Service'
import type {
  Horizon360CacheStats,
  Horizon360Sample,
  Horizon360State,
} from './horizon360Types'

export type UseHorizon360Params = {
  position: ObserverPosition | null
  calculationSettings: CalculationSettings
  terrainProvider: TerrainProviderId
}

export function useHorizon360({
  position,
  calculationSettings,
  terrainProvider,
}: UseHorizon360Params) {
  const [state, setState] = useState<Horizon360State>('idle')
  const [samples, setSamples] = useState<Horizon360Sample[]>([])
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [cacheStats, setCacheStats] = useState<Horizon360CacheStats>({
    cacheHits: 0,
    cacheMisses: 0,
    errors: 0,
  })
  const [warnings, setWarnings] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const requestIdRef = useRef(0)
  const abortRef = useRef<AbortController | null>(null)

  const azimuthStepDeg = getAzimuthStepDeg(calculationSettings)

  const cancel = useCallback(() => {
    abortRef.current?.abort()
    requestIdRef.current += 1
    setState((s) => (s === 'running' ? 'cancelled' : s))
  }, [])

  const run = useCallback(async () => {
    if (!position) {
      setError('Choisissez un point d\'observation avant de lancer le calcul.')
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    const requestId = ++requestIdRef.current
    setState('running')
    setError(null)
    setWarnings([])
    setSamples([])
    setProgress({ current: 0, total: 0 })
    setCacheStats({ cacheHits: 0, cacheMisses: 0, errors: 0 })

    try {
      const result = await computeHorizon360({
        lat: position.lat,
        lon: position.lon,
        settings: calculationSettings,
        provider: terrainProvider,
        signal: controller.signal,
        onProgress: (current, total, sample) => {
          if (requestId !== requestIdRef.current) return
          setProgress({ current, total })
          setSamples((prev) => {
            const next = [...prev]
            const index = current - 1
            next[index] = sample
            return next
          })
        },
      })

      if (requestId !== requestIdRef.current) return

      setSamples(result.samples)
      setCacheStats(result.cacheStats)
      setWarnings(buildHorizon360Warnings(result.samples))

      if (result.cancelled) {
        setState('cancelled')
        return
      }

      const successCount = result.samples.filter((s) => s.status === 'success').length
      if (successCount === 0) {
        setState('error')
        setError('Aucune direction n\'a pu être calculée.')
        return
      }

      if (successCount < result.samples.length) {
        setState('partial')
      } else {
        setState('success')
      }
    } catch (err) {
      if (requestId !== requestIdRef.current) return
      setState('error')
      setError(
        err instanceof Error
          ? err.message
          : 'Le calcul horizon 360 a échoué.',
      )
    } finally {
      if (requestId === requestIdRef.current) {
        abortRef.current = null
      }
    }
  }, [position, calculationSettings, terrainProvider])

  const isRunning = state === 'running'

  return {
    state,
    samples,
    progress,
    cacheStats,
    warnings,
    error,
    azimuthStepDeg,
    isRunning,
    run,
    cancel,
    dismissError: () => setError(null),
  }
}
