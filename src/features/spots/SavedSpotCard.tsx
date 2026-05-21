import type { SavedSpot } from './spotTypes'

type SavedSpotCardProps = {
  spot: SavedSpot
  onLoad: (spot: SavedSpot) => void
  onDelete: (spot: SavedSpot) => void
}

function formatCoord(value: number, decimals: number): string {
  return value.toFixed(decimals)
}

function formatDelta(delta: number | null | undefined): string | null {
  if (delta === null || delta === undefined || !Number.isFinite(delta)) {
    return null
  }
  const sign = delta >= 0 ? '+' : ''
  return `${sign}${delta.toFixed(1)} min`
}

function formatLastComputed(iso: string | undefined): string | null {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleString(undefined, {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

export function SavedSpotCard({ spot, onLoad, onDelete }: SavedSpotCardProps) {
  const deltaLabel = formatDelta(spot.lastComputedResult?.deltaMinutes)
  const lastComputedLabel = formatLastComputed(spot.lastComputedAt)

  const handleDelete = () => {
    const confirmed = window.confirm(
      `Supprimer le spot « ${spot.name} » ? Cette action est irréversible.`,
    )
    if (confirmed) {
      onDelete(spot)
    }
  }

  return (
    <article className="rounded-lg border border-border bg-bg/50 p-4">
      <h3 className="text-sm font-semibold text-text-primary">{spot.name}</h3>
      <dl className="mt-2 space-y-1 text-xs text-text-secondary">
        <div className="flex flex-wrap gap-x-2">
          <dt className="sr-only">Coordonnées</dt>
          <dd>
            {formatCoord(spot.latitude, 4)}°, {formatCoord(spot.longitude, 4)}°
          </dd>
        </div>
        {spot.elevationM !== undefined && (
          <div>
            <dt className="inline">Altitude :</dt>{' '}
            <dd className="inline">{Math.round(spot.elevationM)} m</dd>
          </div>
        )}
        {lastComputedLabel && (
          <div>
            <dt className="inline">Dernier calcul :</dt>{' '}
            <dd className="inline">{lastComputedLabel}</dd>
          </div>
        )}
        {deltaLabel && (
          <div>
            <dt className="inline">Décalage :</dt>{' '}
            <dd className="inline text-accent-sun">{deltaLabel}</dd>
          </div>
        )}
      </dl>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onLoad(spot)}
          className="rounded-lg border border-accent-horizon/50 px-3 py-1.5 text-xs font-medium text-accent-horizon transition-colors hover:bg-accent-horizon/10"
        >
          Charger
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="rounded-lg border border-error/40 px-3 py-1.5 text-xs font-medium text-error transition-colors hover:bg-error/10"
        >
          Supprimer
        </button>
      </div>
    </article>
  )
}
