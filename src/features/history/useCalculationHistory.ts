import { useCallback, useEffect, useState } from 'react'
import type { SunsetResult } from '@/features/horizon/horizonTypes'
import type { CalculationSettings } from '@/features/settings/calculationSettingsTypes'
import type { CalculationHistoryEntry } from './calculationHistoryTypes'
import {
  addHistoryEntryFromResult,
  clearHistoryForSpot,
  clearOrphanEntries,
  getHistoryEntries,
  getHistoryForSpot,
  isHistoryStorageAvailable,
  removeHistoryEntry,
} from './calculationHistoryStorage'
import { HistoryStorageError } from './calculationHistoryTypes'

export type SaveResultToSpotParams = {
  spotId: string
  observationDate: Date
  result: SunsetResult
  settings: CalculationSettings
}

export function useCalculationHistory(validSpotIds: string[] = []) {
  const [entries, setEntries] = useState<CalculationHistoryEntry[]>([])
  const [storageAvailable, setStorageAvailable] = useState(
    isHistoryStorageAvailable(),
  )
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const refreshHistory = useCallback(() => {
    setStorageAvailable(isHistoryStorageAvailable())
    try {
      if (validSpotIds.length > 0) {
        clearOrphanEntries(validSpotIds)
      }
      setEntries(getHistoryEntries())
      setError(null)
    } catch (err) {
      setEntries([])
      setError(
        err instanceof HistoryStorageError
          ? err.message
          : 'Impossible de charger l\'historique.',
      )
    }
  }, [validSpotIds.join(',')])

  useEffect(() => {
    refreshHistory()
  }, [refreshHistory])

  const getEntriesForSpot = useCallback(
    (spotId: string) => getHistoryForSpot(spotId),
    [entries],
  )

  const saveResultToSpot = useCallback(
    (params: SaveResultToSpotParams) => {
      setError(null)
      setStatusMessage(null)

      if (!params.result.terrainSunset) {
        setError(
          'Impossible d\'enregistrer : aucun coucher corrigé n\'a été calculé.',
        )
        return null
      }

      if (!isHistoryStorageAvailable()) {
        setError('Le stockage local du navigateur est indisponible.')
        return null
      }

      try {
        const entry = addHistoryEntryFromResult(params)
        refreshHistory()
        setStatusMessage('Résultat enregistré dans l\'historique du spot.')
        return entry
      } catch (err) {
        const message =
          err instanceof HistoryStorageError
            ? err.message
            : 'Impossible d\'enregistrer ce résultat.'
        setError(message)
        return null
      }
    },
    [refreshHistory],
  )

  const deleteEntry = useCallback(
    (id: string) => {
      setError(null)
      setStatusMessage(null)

      if (!isHistoryStorageAvailable()) {
        setError('Le stockage local du navigateur est indisponible.')
        return false
      }

      try {
        removeHistoryEntry(id)
        refreshHistory()
        setStatusMessage('Entrée supprimée.')
        return true
      } catch (err) {
        setError(
          err instanceof HistoryStorageError
            ? err.message
            : 'Impossible de supprimer cette entrée.',
        )
        return false
      }
    },
    [refreshHistory],
  )

  const clearSpotHistory = useCallback(
    (spotId: string) => {
      setError(null)
      setStatusMessage(null)

      if (!isHistoryStorageAvailable()) {
        setError('Le stockage local du navigateur est indisponible.')
        return false
      }

      try {
        clearHistoryForSpot(spotId)
        refreshHistory()
        setStatusMessage('Historique du spot effacé.')
        return true
      } catch (err) {
        setError(
          err instanceof HistoryStorageError
            ? err.message
            : 'Impossible d\'effacer l\'historique.',
        )
        return false
      }
    },
    [refreshHistory],
  )

  const dismissStatus = useCallback(() => setStatusMessage(null), [])
  const dismissError = useCallback(() => setError(null), [])

  return {
    entries,
    storageAvailable,
    error,
    statusMessage,
    getEntriesForSpot,
    saveResultToSpot,
    deleteEntry,
    clearSpotHistory,
    refreshHistory,
    dismissStatus,
    dismissError,
  }
}
