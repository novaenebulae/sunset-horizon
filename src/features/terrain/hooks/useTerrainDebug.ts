import { useCallback, useEffect, useState } from 'react'
import type { ObserverPosition } from '@/features/map/types'
import type { CalculationSettings } from '@/features/settings/calculationSettingsTypes'
import { settingsToTerrainParams } from '@/features/settings/defaultCalculationSettings'
import { fetchTerrainProfile, getObserverElevation } from '../terrainProfile'
import { toTerrainError } from '../terrainErrors'
import type {
  ObserverElevationResult,
  TerrainProfileResult,
  TerrainProviderId,
} from '../terrainTypes'

const DEFAULT_AZIMUTH_DEG = 270

type UseTerrainDebugParams = {
  position: ObserverPosition | null
  sunsetAzimuthDeg: number | null
  provider: TerrainProviderId
  calculationSettings: CalculationSettings
  onProviderChange: (provider: TerrainProviderId) => void
  onProfileLoaded?: (profile: TerrainProfileResult) => void
}

export function useTerrainDebug({
  position,
  sunsetAzimuthDeg,
  provider,
  calculationSettings,
  onProviderChange,
  onProfileLoaded,
}: UseTerrainDebugParams) {
  const terrainParams = settingsToTerrainParams(calculationSettings)
  const [observerElevation, setObserverElevation] =
    useState<ObserverElevationResult | null>(null)
  const [profile, setProfile] = useState<TerrainProfileResult | null>(null)
  const [isLoadingElevation, setIsLoadingElevation] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const azimuthDeg = sunsetAzimuthDeg ?? DEFAULT_AZIMUTH_DEG

  const loadObserverElevation = useCallback(async () => {
    if (!position) {
      setObserverElevation(null)
      return
    }

    setIsLoadingElevation(true)
    setError(null)

    try {
      const result = await getObserverElevation(
        position.lat,
        position.lon,
        provider,
      )
      setObserverElevation(result)
    } catch (err) {
      const terrainErr = toTerrainError(err)
      setError(terrainErr.message)
      setObserverElevation(null)
    } finally {
      setIsLoadingElevation(false)
    }
  }, [position?.lat, position?.lon, provider])

  useEffect(() => {
    setProfile(null)
    void loadObserverElevation()
  }, [loadObserverElevation])

  const loadProfile = useCallback(async () => {
    if (!position) return

    setIsLoadingProfile(true)
    setError(null)

    try {
      const { profile: result } = await fetchTerrainProfile({
        observer: { lat: position.lat, lon: position.lon },
        azimuthDeg,
        provider,
        ...terrainParams,
      })
      setProfile(result)
      onProfileLoaded?.(result)
      if (result.observer.elevationM !== undefined) {
        setObserverElevation({
          elevationM: result.observer.elevationM,
          source: result.source,
        })
      }
    } catch (err) {
      const terrainErr = toTerrainError(err)
      setError(terrainErr.message)
      setProfile(null)
    } finally {
      setIsLoadingProfile(false)
    }
  }, [
    position?.lat,
    position?.lon,
    azimuthDeg,
    provider,
    calculationSettings.maxDistanceM,
    calculationSettings.sampleStepM,
    onProfileLoaded,
  ])

  const clearError = useCallback(() => setError(null), [])

  return {
    provider,
    setProvider: onProviderChange,
    observerElevation,
    profile,
    azimuthDeg,
    isLoadingElevation,
    isLoadingProfile,
    error,
    clearError,
    loadProfile,
    hasPosition: position !== null,
  }
}
