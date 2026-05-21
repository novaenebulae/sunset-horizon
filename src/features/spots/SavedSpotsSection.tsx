import { useEffect, useMemo, useState } from 'react'
import { WarningBanner } from '@/components/WarningBanner'
import type { ObserverPosition } from '@/features/map/types'
import type { SunsetResult } from '@/features/horizon/horizonTypes'
import type { HorizonSunsetState } from '@/features/horizon/hooks/useHorizonSunset'
import { buildDefaultSpotName } from './spotStorage'
import { SavedSpotForm } from './SavedSpotForm'
import { SavedSpotList } from './SavedSpotList'
import { useSavedSpots } from './hooks/useSavedSpots'
import type { SavedSpot } from './spotTypes'

type SavedSpotsSectionProps = {
  position: ObserverPosition | null
  horizonState: HorizonSunsetState
  horizonResult: SunsetResult | null
  lastAddressLabel?: string | null
  onLoadSpot: (lat: number, lon: number) => void
}

export function SavedSpotsSection({
  position,
  horizonState,
  horizonResult,
  lastAddressLabel,
  onLoadSpot,
}: SavedSpotsSectionProps) {
  const [showForm, setShowForm] = useState(false)
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
    error,
    statusMessage,
    storageAvailable,
    saveCurrentSpot,
    deleteSpot,
    dismissStatus,
    dismissError,
  } = useSavedSpots()

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
    }
  }

  const handleLoad = (spot: SavedSpot) => {
    onLoadSpot(spot.latitude, spot.longitude)
    dismissStatus()
  }

  const handleDelete = (spot: SavedSpot) => {
    deleteSpot(spot.id)
  }

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
        <div className="flex items-center justify-between gap-2">
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
      </summary>

      <div className="space-y-4 border-t border-border px-6 pb-6 pt-4">
        {!storageAvailable && (
          <WarningBanner message="Le stockage local du navigateur est indisponible. Les spots ne peuvent pas être enregistrés." />
        )}

        {statusMessage && (
          <p
            role="status"
            className="rounded-lg border border-accent-horizon/30 bg-accent-horizon/10 px-4 py-3 text-sm text-accent-horizon"
          >
            {statusMessage}
          </p>
        )}

        {!position ? (
          <p className="text-sm text-text-secondary">
            Choisissez un point d&apos;observation pour enregistrer un spot.
          </p>
        ) : (
          <>
            {!showForm ? (
              <button
                type="button"
                disabled={!storageAvailable}
                onClick={() => setShowForm(true)}
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-bg disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                Enregistrer ce spot
              </button>
            ) : (
              <SavedSpotForm
                defaultName={defaultSpotName}
                onSave={handleSave}
                onCancel={() => setShowForm(false)}
              />
            )}
          </>
        )}

        <SavedSpotList
          spots={spots}
          error={error}
          onDismissError={dismissError}
          onLoad={handleLoad}
          onDelete={handleDelete}
        />
      </div>
    </details>
  )
}
