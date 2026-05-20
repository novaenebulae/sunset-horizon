import { WarningBanner } from '@/components/WarningBanner'
import type { ObserverPosition, ObserverState } from './types'

type LocationControlsProps = {
  state: ObserverState
  position: ObserverPosition | null
  isLoading: boolean
  onRequestGps: () => void
  onClearError: () => void
}

function formatCoord(value: number): string {
  return value.toFixed(5)
}

export function LocationControls({
  state,
  position,
  isLoading,
  onRequestGps,
  onClearError,
}: LocationControlsProps) {
  const showIdleHint = state.status === 'idle' && !position

  return (
    <section
      className="mt-4 space-y-4"
      aria-label="Contrôles de position"
    >
      {showIdleHint && (
        <p className="text-sm text-text-secondary">
          Choisis un point sur la carte ou utilise ta position actuelle.
        </p>
      )}

      {state.status === 'error' && (
        <WarningBanner message={state.message} onDismiss={onClearError} />
      )}

      <button
        type="button"
        onClick={onRequestGps}
        disabled={isLoading}
        className="w-full rounded-lg bg-accent-sun px-4 py-3 text-sm font-semibold text-bg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? 'Localisation en cours…' : 'Me localiser'}
      </button>

      {position && (
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-medium text-text">Position observateur</h2>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                position.source === 'gps'
                  ? 'bg-accent-sun/20 text-accent-sun'
                  : 'bg-accent-horizon/20 text-accent-horizon'
              }`}
            >
              {position.source === 'gps' ? 'GPS' : 'Carte'}
            </span>
          </div>

          <dl className="mt-3 space-y-2 font-mono text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-text-secondary">Latitude</dt>
              <dd className="text-text">{formatCoord(position.lat)}°</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-text-secondary">Longitude</dt>
              <dd className="text-text">{formatCoord(position.lon)}°</dd>
            </div>
            {position.accuracyM !== null && (
              <div className="flex justify-between gap-4">
                <dt className="text-text-secondary">Précision GPS</dt>
                <dd className="text-text">± {Math.round(position.accuracyM)} m</dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </section>
  )
}
