import { useEffect, useState } from 'react'
import { WarningBanner } from '@/components/WarningBanner'
import type { CalculationSettings } from '@/features/settings/calculationSettingsTypes'
import type { TerrainProviderId } from '@/features/terrain/terrainTypes'
import type {
  SpotComparisonSortDirection,
  SpotComparisonSortKey,
} from './comparisonTypes'
import { SpotComparisonCard } from './SpotComparisonCard'
import { SpotComparisonSummary } from './SpotComparisonSummary'
import { SpotComparisonTable } from './SpotComparisonTable'
import { useSpotComparison } from './useSpotComparison'

type SpotComparisonPanelProps = {
  observationDate: Date
  calculationSettings: CalculationSettings
  terrainProvider: TerrainProviderId
}

const SORT_OPTIONS: { key: SpotComparisonSortKey; label: string }[] = [
  { key: 'terrainSunset', label: 'Heure corrigée' },
  { key: 'name', label: 'Nom' },
  { key: 'delta', label: 'Delta' },
  { key: 'status', label: 'Statut' },
]

function formatCoordShort(lat: number, lon: number): string {
  return `${lat.toFixed(3)}°, ${lon.toFixed(3)}°`
}

export function SpotComparisonPanel({
  observationDate,
  calculationSettings,
  terrainProvider,
}: SpotComparisonPanelProps) {
  const [sectionOpen, setSectionOpen] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)')
    const syncOpen = () => setSectionOpen(media.matches)
    syncOpen()
    media.addEventListener('change', syncOpen)
    return () => media.removeEventListener('change', syncOpen)
  }, [])

  const {
    spots,
    selectedSpotIds,
    rows,
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
    saveSuccessfulToHistory,
    historyStatus,
    historyError,
    dismissHistoryStatus,
    dismissHistoryError,
    precisionLabel,
    refractionEnabled,
    maxDistanceM,
    sampleStepM,
    successfulCount,
    errorCount,
    insufficientCount,
    canCompare,
    hasResults,
    dismissError,
  } = useSpotComparison({
    observationDate,
    calculationSettings,
    terrainProvider,
  })

  const handleSortChange = (key: SpotComparisonSortKey) => {
    if (key === sortKey) {
      setSortDirection(
        (d: SpotComparisonSortDirection) => (d === 'asc' ? 'desc' : 'asc'),
      )
    } else {
      setSortKey(key)
      setSortDirection(key === 'name' || key === 'status' ? 'asc' : 'desc')
    }
  }

  if (spots.length === 0) {
    return (
      <details
        className="rounded-xl border border-border bg-surface"
        open={sectionOpen}
        onToggle={(e) => setSectionOpen(e.currentTarget.open)}
      >
        <summary className="cursor-pointer list-none px-6 py-4 marker:content-none [&::-webkit-details-marker]:hidden">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
            Comparer des spots
          </h2>
        </summary>
        <div className="border-t border-border px-6 pb-6 pt-4">
          <p className="text-sm text-text-secondary">
            Enregistrez au moins deux spots dans la section Spots sauvegardés
            ci-dessus pour les comparer sur la même date.
          </p>
        </div>
      </details>
    )
  }

  return (
    <details
      className="rounded-xl border border-border bg-surface"
      open={sectionOpen}
      onToggle={(e) => setSectionOpen(e.currentTarget.open)}
    >
      <summary className="cursor-pointer list-none px-6 py-4 marker:content-none [&::-webkit-details-marker]:hidden">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
          Comparer des spots
        </h2>
      </summary>

      <div className="space-y-4 border-t border-border px-6 pb-6 pt-4">
        {error && (
          <WarningBanner message={error} onDismiss={dismissError} />
        )}

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-text-primary">
            Spots à comparer ({selectedSpotIds.length}/{spots.length})
          </legend>
          <ul className="max-h-48 space-y-2 overflow-y-auto">
            {spots.map((spot) => (
              <li key={spot.id}>
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border px-3 py-2 hover:bg-surface-elevated/50">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={selectedSpotIds.includes(spot.id)}
                    onChange={() => toggleSpot(spot.id)}
                    disabled={isRunning}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-text-primary">
                      {spot.name}
                    </span>
                    <span className="text-xs text-text-secondary">
                      {formatCoordShort(spot.latitude, spot.longitude)}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              className="text-xs text-accent-horizon hover:underline"
              onClick={selectAll}
              disabled={isRunning}
            >
              Tout sélectionner
            </button>
            <button
              type="button"
              className="text-xs text-text-secondary hover:underline"
              onClick={clearSelection}
              disabled={isRunning}
            >
              Effacer
            </button>
          </div>
        </fieldset>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-lg bg-accent-horizon px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
            onClick={() => void runComparison()}
            disabled={!canCompare}
          >
            {isRunning ? 'Comparaison…' : 'Comparer'}
          </button>
        </div>

        {hasResults && (
          <>
            <SpotComparisonSummary
              observationDate={observationDate}
              precisionLabel={precisionLabel}
              refractionEnabled={refractionEnabled}
              maxDistanceM={maxDistanceM}
              sampleStepM={sampleStepM}
              rows={rows}
              successfulCount={successfulCount}
              errorCount={errorCount}
              insufficientCount={insufficientCount}
            />

            <div className="flex flex-wrap items-center gap-2">
              <label className="text-sm text-text-secondary" htmlFor="comparison-sort">
                Trier par
              </label>
              <select
                id="comparison-sort"
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-text-primary"
                value={sortKey}
                onChange={(e) =>
                  handleSortChange(e.target.value as SpotComparisonSortKey)
                }
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="rounded-lg border border-border px-3 py-1.5 text-sm text-text-secondary"
                onClick={() =>
                  setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
                }
                aria-label="Inverser l'ordre de tri"
              >
                {sortDirection === 'asc' ? '↑' : '↓'}
              </button>
            </div>

            <div className="space-y-3 max-lg:block lg:hidden">
              {rows.map((row) => (
                <SpotComparisonCard key={row.spotId} row={row} />
              ))}
            </div>

            <div className="hidden lg:block">
              <SpotComparisonTable rows={rows} />
            </div>

            {successfulCount > 0 && (
              <div className="space-y-2">
                <button
                  type="button"
                  className="rounded-lg border border-border px-4 py-2 text-sm text-text-primary hover:bg-surface-elevated"
                  onClick={saveSuccessfulToHistory}
                  disabled={isRunning}
                >
                  Enregistrer les résultats réussis dans l&apos;historique
                </button>
                {historyStatus && (
                  <p className="text-sm text-accent-horizon">{historyStatus}</p>
                )}
                {historyError && (
                  <WarningBanner
                    message={historyError}
                    onDismiss={dismissHistoryError}
                  />
                )}
                {historyStatus && (
                  <button
                    type="button"
                    className="text-xs text-text-secondary hover:underline"
                    onClick={dismissHistoryStatus}
                  >
                    Fermer
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </details>
  )
}
