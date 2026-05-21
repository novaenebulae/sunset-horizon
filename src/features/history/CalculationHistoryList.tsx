import type { CalculationHistoryEntry } from './calculationHistoryTypes'
import { CalculationHistoryItem } from './CalculationHistoryItem'

type CalculationHistoryListProps = {
  entries: CalculationHistoryEntry[]
  spotName: string
  onDeleteEntry: (entry: CalculationHistoryEntry) => void
  onClearAll: () => void
}

export function CalculationHistoryList({
  entries,
  spotName,
  onDeleteEntry,
  onClearAll,
}: CalculationHistoryListProps) {
  if (entries.length === 0) {
    return (
      <p className="text-xs text-text-secondary">
        Aucun calcul enregistré pour ce spot.
      </p>
    )
  }

  const handleClearAll = () => {
    const confirmed = window.confirm(
      `Effacer tout l'historique du spot « ${spotName} » ? Les entrées seront supprimées mais le spot sera conservé.`,
    )
    if (confirmed) {
      onClearAll()
    }
  }

  return (
    <div className="space-y-2">
      <ul className="space-y-2" aria-label={`Historique de ${spotName}`}>
        {entries.map((entry) => (
          <CalculationHistoryItem
            key={entry.id}
            entry={entry}
            onDelete={onDeleteEntry}
          />
        ))}
      </ul>
      <button
        type="button"
        onClick={handleClearAll}
        className="text-xs font-medium text-error underline hover:no-underline"
      >
        Effacer tout l&apos;historique
      </button>
    </div>
  )
}
