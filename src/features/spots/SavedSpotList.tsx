import { WarningBanner } from '@/components/WarningBanner'
import type { CalculationHistoryEntry } from '@/features/history/calculationHistoryTypes'
import type { SavedSpot } from './spotTypes'
import { SavedSpotCard } from './SavedSpotCard'

type SavedSpotListProps = {
  spots: SavedSpot[]
  error: string | null
  onDismissError?: () => void
  getHistoryForSpot: (spotId: string) => CalculationHistoryEntry[]
  onLoad: (spot: SavedSpot) => void
  onDelete: (spot: SavedSpot) => void
  onDeleteHistoryEntry: (entry: CalculationHistoryEntry) => void
  onClearSpotHistory: (spot: SavedSpot) => void
}

export function SavedSpotList({
  spots,
  error,
  onDismissError,
  getHistoryForSpot,
  onLoad,
  onDelete,
  onDeleteHistoryEntry,
  onClearSpotHistory,
}: SavedSpotListProps) {
  if (spots.length === 0 && !error) {
    return (
      <p className="text-sm text-text-secondary">
        Aucun spot enregistré pour le moment.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {error && (
        <WarningBanner message={error} onDismiss={onDismissError} />
      )}
      {spots.length === 0 ? (
        <p className="text-sm text-text-secondary">
          Aucun spot enregistré pour le moment.
        </p>
      ) : (
        <ul className="space-y-3" aria-label="Liste des spots">
          {spots.map((spot) => (
            <li key={spot.id}>
              <SavedSpotCard
                spot={spot}
                historyEntries={getHistoryForSpot(spot.id)}
                onLoad={onLoad}
                onDelete={onDelete}
                onDeleteHistoryEntry={onDeleteHistoryEntry}
                onClearSpotHistory={onClearSpotHistory}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
