import { useCallback, useEffect, useState } from 'react'
import type { ObserverPosition } from '@/features/map/types'
import type { SunsetResult } from '@/features/horizon/horizonTypes'
import type { HorizonSunsetState } from '@/features/horizon/hooks/useHorizonSunset'
import { spotComputedSnapshotFromResult } from '../spotComputedSnapshot'
import { SpotStorageError, type SavedSpot } from '../spotTypes'
import { clearHistoryForSpot } from '@/features/history/calculationHistoryStorage'
import {
  buildDefaultSpotName,
  getSavedSpots,
  isLocalStorageAvailable,
  removeSpot,
  saveSpot,
} from '../spotStorage'

export type SaveCurrentSpotParams = {
  name?: string
  position: ObserverPosition
  elevationM?: number
  horizonResult?: SunsetResult | null
  horizonState?: HorizonSunsetState
  addressLabel?: string | null
}

export function useSavedSpots() {
  const [spots, setSpots] = useState<SavedSpot[]>([])
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [storageAvailable, setStorageAvailable] = useState(true)

  const refreshSpots = useCallback(() => {
    setStorageAvailable(isLocalStorageAvailable())
    try {
      setSpots(getSavedSpots())
      setError(null)
    } catch (err) {
      setSpots([])
      setError(
        err instanceof SpotStorageError
          ? err.message
          : 'Impossible de charger les spots sauvegardés.',
      )
    }
  }, [])

  useEffect(() => {
    refreshSpots()
  }, [refreshSpots])

  const saveCurrentSpot = useCallback(
    (params: SaveCurrentSpotParams) => {
      setError(null)
      setStatusMessage(null)

      if (!isLocalStorageAvailable()) {
        setError('Le stockage local du navigateur est indisponible.')
        return null
      }

      const defaultName = buildDefaultSpotName({
        lat: params.position.lat,
        lon: params.position.lon,
        addressLabel: params.addressLabel,
      })

      const input: Parameters<typeof saveSpot>[0] = {
        name: params.name?.trim() ? params.name : defaultName,
        latitude: params.position.lat,
        longitude: params.position.lon,
      }

      if (params.elevationM !== undefined && Number.isFinite(params.elevationM)) {
        input.elevationM = params.elevationM
      }

      if (params.horizonState === 'success' && params.horizonResult) {
        input.lastComputedAt = new Date().toISOString()
        input.lastComputedResult = spotComputedSnapshotFromResult(
          params.horizonResult,
        )
      }

      try {
        const saved = saveSpot(input)
        refreshSpots()
        setStatusMessage(`Spot « ${saved.name} » enregistré.`)
        return saved
      } catch (err) {
        const message =
          err instanceof SpotStorageError
            ? err.message
            : 'Impossible d\'enregistrer ce spot.'
        setError(message)
        return null
      }
    },
    [refreshSpots],
  )

  const deleteSpot = useCallback(
    (id: string) => {
      setError(null)
      setStatusMessage(null)

      if (!isLocalStorageAvailable()) {
        setError('Le stockage local du navigateur est indisponible.')
        return false
      }

      try {
        removeSpot(id)
        clearHistoryForSpot(id)
        refreshSpots()
        setStatusMessage('Spot supprimé.')
        return true
      } catch (err) {
        const message =
          err instanceof SpotStorageError
            ? err.message
            : 'Impossible de supprimer ce spot.'
        setError(message)
        return false
      }
    },
    [refreshSpots],
  )

  const dismissStatus = useCallback(() => {
    setStatusMessage(null)
  }, [])

  const dismissError = useCallback(() => {
    setError(null)
  }, [])

  return {
    spots,
    error,
    statusMessage,
    storageAvailable,
    saveCurrentSpot,
    deleteSpot,
    refreshSpots,
    dismissStatus,
    dismissError,
  }
}
