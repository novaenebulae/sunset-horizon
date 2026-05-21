import { AddressSearch } from '@/features/geocoding'
import type { AddressSearchResult } from '@/features/geocoding'
import { WarningBanner } from '@/components/WarningBanner'
import type { ObserverState } from './types'

type LocationToolbarProps = {
  state: ObserverState
  hasPosition: boolean
  isLoading: boolean
  onRequestGps: () => void
  onClearError: () => void
  onAddressSelect: (result: AddressSearchResult) => void
}

export function LocationToolbar({
  state,
  hasPosition,
  isLoading,
  onRequestGps,
  onClearError,
  onAddressSelect,
}: LocationToolbarProps) {
  const showIdleHint = state.status === 'idle' && !hasPosition

  return (
    <section className="space-y-4" aria-label="Choix du point d'observation">
      {showIdleHint && (
        <p className="text-sm text-text-secondary">
          Choisissez un point sur la carte, utilisez votre position actuelle ou
          recherchez une adresse.
        </p>
      )}

      {state.status === 'error' && (
        <WarningBanner message={state.message} onDismiss={onClearError} />
      )}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
        <button
          type="button"
          onClick={onRequestGps}
          disabled={isLoading}
          className="order-1 w-full shrink-0 rounded-lg bg-accent-sun px-4 py-3 text-sm font-semibold text-bg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 lg:order-2 lg:w-auto lg:min-w-[10.5rem]"
        >
          {isLoading ? 'Localisation en cours…' : 'Me localiser'}
        </button>

        <div className="order-2 min-w-0 flex-1 lg:order-1">
          <AddressSearch onSelect={onAddressSelect} disabled={isLoading} />
        </div>
      </div>
    </section>
  )
}
