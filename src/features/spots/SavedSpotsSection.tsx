import { useEffect, useMemo, useState } from 'react'
import { WarningBanner } from '@/components/WarningBanner'
import { useCalculationHistory } from '@/features/history/useCalculationHistory'
import type { CalculationSettings } from '@/features/settings/calculationSettingsTypes'
import type { ObserverPosition } from '@/features/map/types'
import type { SunsetResult } from '@/features/horizon/horizonTypes'
import type { HorizonSunsetState } from '@/features/horizon/hooks/useHorizonSunset'
import { buildDefaultSpotName } from './spotStorage'
import { SavedSpotForm } from './SavedSpotForm'
import { SavedSpotList } from './SavedSpotList'
import { useSavedSpots } from './hooks/useSavedSpots'

type SavedSpotsSectionProps = {
  position: ObserverPosition | null
  observationDate: Date
  calculationSettings: CalculationSettings
  horizonState: HorizonSunsetState
  horizonResult: SunsetResult | null
  lastAddressLabel?: string | null
  onLoadSpot: (lat: number, lon: number) => void
}

export function SavedSpotsSection({
  position,
  observationDate,
  calculationSettings,
  horizonState,
  horizonResult,
  lastAddressLabel,
  onLoadSpot,
}: SavedSpotsSectionProps) {
  const [showForm, setShowForm] = useState(false)
  const [sectionOpen, setSectionOpen] = useState(false)
  const [historySpotId, setHistorySpotId] = useState('')

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)')
    const syncOpen = () => setSectionOpen(media.matches)
    syncOpen()
    media.addEventListener('change', syncOpen)
    return () => media.removeEventListener('change', syncOpen)
  }, [])

  const {
    spots,
    error: spotsError,
    statusMessage: spotsStatus,
    storageAvailable: spotsStorageAvailable,
    saveCurrentSpot,
    deleteSpot,
    dismissStatus: dismissSpotsStatus,
    dismissError: dismissSpotsError,
  } = useSavedSpots()

  const spotIds = useMemo(() => spots.map((s) => s.id), [spots])

  const {
    error: historyError,
    statusMessage: historyStatus,
    storageAvailable: historyStorageAvailable,
    getEntriesForSpot,
    saveResultToSpot,
    deleteEntry,
    clearSpotHistory,
    dismissStatus: dismissHistoryStatus,
    dismissError: dismissHistoryError,
  } = useCalculationHistory(spotIds)

  useEffect(() => {
    if (spots.length === 0) {
      setHistorySpotId('')
      return
    }
    if (!spots.some((s) => s.id === historySpotId)) {
      setHistorySpotId(spots[0].id)
    }
  }, [spots, historySpotId])

  const defaultSpotName = useMemo(() => {
    if (!position) return ''
    return buildDefaultSpotName({
      lat: position.lat,
      lon: position.lon,
      addressLabel: lastAddressLabel,
    })
  }, [position, lastAddressLabel])

  const observerElevationM =
    horizonResult?.horizonProfile.observer.elevation ?? undefined

  const canSaveToHistory =
    horizonState === 'success' &&
    horizonResult?.terrainSunset !== null &&
    spots.length > 0 &&
    historySpotId !== '' &&
    historyStorageAvailable

  const handleSave = (name: string) => {
    if (!position) return
    const saved = saveCurrentSpot({
      name,
      position,
      elevationM: observerElevationM,
      horizonResult,
      horizonState,
      addressLabel: lastAddressLabel,
    })
    if (saved) {
      setShowForm(false)
      setHistorySpotId(saved.id)
    }
  }

  const handleSaveToHistory = () => {
    if (!horizonResult || !historySpotId) return
    dismissHistoryError()
    saveResultToSpot({
      spotId: historySpotId,
      observationDate,
      result: horizonResult,
      settings: calculationSettings,
    })
  }

  const handleLoad = (spot: { latitude: number; longitude: number }) => {
    onLoadSpot(spot.latitude, spot.longitude)
    dismissSpotsStatus()
    dismissHistoryStatus()
  }

  const handleDeleteSpot = (spot: { id: string }) => {
    deleteSpot(spot.id)
  }

  const handleClearSpotHistory = (spot: { id: string; name: string }) => {
    clearSpotHistory(spot.id)
  }

  useEffect(() => {
    if (!spotsStatus) return
    const timer = window.setTimeout(dismissSpotsStatus, 4000)
    return () => window.clearTimeout(timer)
  }, [spotsStatus, dismissSpotsStatus])

  useEffect(() => {
    if (!historyStatus) return
    const timer = window.setTimeout(dismissHistoryStatus, 4000)
    return () => window.clearTimeout(timer)
  }, [historyStatus, dismissHistoryStatus])

  return (
    <details
      className="group rounded-xl border border-border bg-surface"
      open={sectionOpen}
      onToggle={(event) => {
        if (window.matchMedia('(min-width: 1024px)').matches) return
        setSectionOpen(event.currentTarget.open)
      }}
    >
      <summary className="cursor-pointer list-none px-6 py-4 marker:content-none [&::-webkit-details-marker]:hidden lg:cursor-default lg:pointer-events-none">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
              Spots sauvegardés
            </h2>
            <span
              className="text-xs text-text-secondary lg:hidden"
              aria-hidden
            >
              {spots.length > 0 ? `${spots.length}` : '—'}
            </span>
          </div>
          {position && !showForm && (
            <button
              type="button"
              disabled={!spotsStorageAvailable}
              onClick={(event) => {
                event.preventDefault()
                setShowForm(true)
              }}
              className="pointer-events-auto hidden shrink-0 rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-bg disabled:cursor-not-allowed disabled:opacity-50 lg:inline-flex"
            >
              Enregistrer ce spot
            </button>
          )}
        </div>
      </summary>

      <div className="space-y-4 border-t border-border px-6 pb-6 pt-4 lg:px-8">
        {!spotsStorageAvailable && (
          <WarningBanner message="Le stockage local du navigateur est indisponible. Les spots ne peuvent pas être enregistrés." />
        )}

        {spotsStatus && (
          <div
            role="status"
            className="rounded-lg border border-accent-horizon/30 bg-accent-horizon/10 px-4 py-3 text-sm text-accent-horizon"
          >
            <p>{spotsStatus}</p>
            <button
              type="button"
              onClick={dismissSpotsStatus}
              className="mt-2 text-xs font-medium underline hover:no-underline"
            >
              Fermer
            </button>
          </div>
        )}

        {historyStatus && (
          <div
            role="status"
            className="rounded-lg border border-accent-horizon/30 bg-accent-horizon/10 px-4 py-3 text-sm text-accent-horizon"
          >
            <p>{historyStatus}</p>
            <button
              type="button"
              onClick={dismissHistoryStatus}
              className="mt-2 text-xs font-medium underline hover:no-underline"
            >
              Fermer
            </button>
          </div>
        )}

        {historyError && (
          <WarningBanner
            message={historyError}
            onDismiss={dismissHistoryError}
          />
        )}

        {!position ? (
          <p className="text-sm text-text-secondary">
            Choisissez un point d&apos;observation pour enregistrer un spot.
          </p>
        ) : showForm ? (
          <SavedSpotForm
            defaultName={defaultSpotName}
            onSave={handleSave}
            onCancel={() => setShowForm(false)}
          />
        ) : (
          <button
            type="button"
            disabled={!spotsStorageAvailable}
            onClick={() => setShowForm(true)}
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-bg disabled:cursor-not-allowed disabled:opacity-50 lg:hidden"
          >
            Enregistrer ce spot
          </button>
        )}

        <SavedSpotList
          spots={spots}
          error={spotsError}
          onDismissError={dismissSpotsError}
          getHistoryForSpot={getEntriesForSpot}
          onLoad={handleLoad}
          onDelete={handleDeleteSpot}
          onDeleteHistoryEntry={(entry) => deleteEntry(entry.id)}
          onClearSpotHistory={handleClearSpotHistory}
        />

        {horizonState === 'success' && horizonResult?.terrainSunset && (
          <div className="space-y-2 rounded-lg border border-border/80 bg-bg/30 p-4 lg:p-5">
            <p className="text-xs font-medium text-text-primary">
              Historique des calculs
            </p>
            {spots.length === 0 ? (
              <p className="text-xs text-text-secondary">
                Enregistrez d&apos;abord un spot pour y associer ce résultat.
              </p>
            ) : (
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:gap-4">
                <label className="block min-w-0 flex-1 text-xs text-text-secondary">
                  <span className="mb-1 block font-medium">Spot cible</span>
                  <select
                    value={historySpotId}
                    onChange={(event) => setHistorySpotId(event.target.value)}
                    className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary"
                    aria-label="Spot pour l'historique"
                  >
                    {spots.map((spot) => (
                      <option key={spot.id} value={spot.id}>
                        {spot.name}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  disabled={!canSaveToHistory}
                  onClick={handleSaveToHistory}
                  className="w-full shrink-0 rounded-lg border border-accent-horizon/50 px-4 py-2 text-sm font-medium text-accent-horizon transition-colors hover:bg-accent-horizon/10 disabled:cursor-not-allowed disabled:opacity-50 lg:w-auto"
                >
                  Enregistrer ce résultat dans l&apos;historique
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </details>
  )
}
