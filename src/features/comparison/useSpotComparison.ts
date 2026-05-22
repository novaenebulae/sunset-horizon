import { useCallback, useMemo, useRef, useState } from 'react'
import { useCalculationHistory } from '@/features/history/useCalculationHistory'
import type { CalculationSettings, PrecisionMode } from '@/features/settings/calculationSettingsTypes'
import { useSavedSpots } from '@/features/spots/hooks/useSavedSpots'
import type { TerrainProviderId } from '@/features/terrain/terrainTypes'
import {
  compareSpots,
  createLoadingRow,
  markBestSpot,
  sortComparisonRows,
} from './comparisonService'
import type {
  SpotComparisonRow,
  SpotComparisonSortDirection,
  SpotComparisonSortKey,
} from './comparisonTypes'

const MODE_LABELS: Record<PrecisionMode, string> = {
  fast: 'Rapide',
  balanced: 'Normal',
  precise: 'Précis',
}

export type UseSpotComparisonParams = {
  observationDate: Date
  calculationSettings: CalculationSettings
  terrainProvider: TerrainProviderId
}

export function useSpotComparison({
  observationDate,
  calculationSettings,
  terrainProvider,
}: UseSpotComparisonParams) {
  const { spots } = useSavedSpots()
  const spotIds = useMemo(() => spots.map((s) => s.id), [spots])
  const { saveResultToSpot } = useCalculationHistory(spotIds)
  const [selectedSpotIds, setSelectedSpotIds] = useState<string[]>([])
  const [rows, setRows] = useState<SpotComparisonRow[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<SpotComparisonSortKey>('terrainSunset')
  const [sortDirection, setSortDirection] =
    useState<SpotComparisonSortDirection>('desc')
  const [historyStatus, setHistoryStatus] = useState<string | null>(null)
  const [historyError, setHistoryError] = useState<string | null>(null)

  const requestIdRef = useRef(0)

  const selectedSpots = useMemo(
    () => spots.filter((s) => selectedSpotIds.includes(s.id)),
    [spots, selectedSpotIds],
  )

  const displayRows = useMemo(
    () => markBestSpot(sortComparisonRows(rows, sortKey, sortDirection)),
    [rows, sortKey, sortDirection],
  )

  const precisionLabel = MODE_LABELS[calculationSettings.precisionMode]

  const toggleSpot = useCallback((spotId: string) => {
    setSelectedSpotIds((prev) =>
      prev.includes(spotId)
        ? prev.filter((id) => id !== spotId)
        : [...prev, spotId],
    )
  }, [])

  const selectAll = useCallback(() => {
    setSelectedSpotIds(spots.map((s) => s.id))
  }, [spots])

  const clearSelection = useCallback(() => {
    setSelectedSpotIds([])
  }, [])

  const cancel = useCallback(() => {
    requestIdRef.current += 1
    setIsRunning(false)
  }, [])

  const runComparison = useCallback(async () => {
    if (selectedSpots.length < 2) {
      setError('Sélectionnez au moins deux spots pour comparer.')
      return
    }

    const requestId = ++requestIdRef.current
    setError(null)
    setHistoryStatus(null)
    setHistoryError(null)
    setIsRunning(true)

    const loadingRows = selectedSpots.map(createLoadingRow)
    setRows(loadingRows)

    try {
      const results = await compareSpots(
        selectedSpots,
        {
          observationDate,
          settings: calculationSettings,
          provider: terrainProvider,
        },
        (partialRow) => {
          if (requestId !== requestIdRef.current) return
          setRows((prev) =>
            prev.map((row) =>
              row.spotId === partialRow.spotId ? partialRow : row,
            ),
          )
        },
      )

      if (requestId !== requestIdRef.current) return
      setRows(results)
    } catch (err) {
      if (requestId !== requestIdRef.current) return
      setError(
        err instanceof Error
          ? err.message
          : 'La comparaison a échoué.',
      )
    } finally {
      if (requestId === requestIdRef.current) {
        setIsRunning(false)
      }
    }
  }, [
    selectedSpots,
    observationDate,
    calculationSettings,
    terrainProvider,
  ])

  const saveSuccessfulToHistory = useCallback(() => {
    setHistoryStatus(null)
    setHistoryError(null)

    if (!saveResultToSpot) {
      setHistoryError('Historique indisponible.')
      return
    }

    const successful = rows.filter(
      (row) =>
        row.status === 'success' &&
        row.terrainSunset != null &&
        row.result != null,
    )

    if (successful.length === 0) {
      setHistoryError('Aucun résultat réussi à enregistrer.')
      return
    }

    let saved = 0
    for (const row of successful) {
      const entry = saveResultToSpot({
        spotId: row.spotId,
        observationDate,
        result: row.result!,
        settings: calculationSettings,
      })
      if (entry) saved += 1
    }

    if (saved === 0) {
      setHistoryError('Aucun résultat n\'a pu être enregistré.')
      return
    }

    setHistoryStatus(
      saved === 1
        ? '1 résultat enregistré dans l\'historique.'
        : `${saved} résultats enregistrés dans l\'historique.`,
    )
  }, [rows, observationDate, calculationSettings, saveResultToSpot])

  const successfulCount = rows.filter((r) => r.status === 'success').length
  const errorCount = rows.filter((r) => r.status === 'error').length
  const insufficientCount = rows.filter((r) => r.status === 'insufficient').length

  return {
    spots,
    selectedSpotIds,
    selectedSpots,
    rows: displayRows,
    isRunning,
    error,
    sortKey,
    sortDirection,
    setSortKey,
    setSortDirection,
    toggleSpot,
    selectAll,
    clearSelection,
    runComparison,
    cancel,
    saveSuccessfulToHistory,
    historyStatus,
    historyError,
    dismissHistoryStatus: () => setHistoryStatus(null),
    dismissHistoryError: () => setHistoryError(null),
    dismissError: () => setError(null),
    precisionLabel,
    refractionEnabled: calculationSettings.refractionEnabled,
    maxDistanceM: calculationSettings.maxDistanceM,
    sampleStepM: calculationSettings.sampleStepM,
    successfulCount,
    errorCount,
    insufficientCount,
    canCompare: selectedSpots.length >= 2 && !isRunning,
    hasResults: rows.length > 0,
  }
}
