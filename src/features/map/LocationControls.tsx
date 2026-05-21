import type { ObserverPosition } from './types'

type LocationControlsProps = {
  position: ObserverPosition | null
}

function formatCoord(value: number): string {
  return value.toFixed(5)
}

export function LocationControls({
  position,
}: Pick<LocationControlsProps, 'position'>) {
  if (!position) {
    return null
  }

  return (
    <section
      className="space-y-4"
      aria-label="Position observateur"
    >
      <div className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-medium text-text">Position observateur</h2>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                position.source === 'gps'
                  ? 'bg-accent-sun/20 text-accent-sun'
                  : position.source === 'address'
                    ? 'bg-success/20 text-success'
                    : 'bg-accent-horizon/20 text-accent-horizon'
              }`}
            >
              {position.source === 'gps'
                ? 'GPS'
                : position.source === 'address'
                  ? 'Adresse'
                  : 'Carte'}
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
    </section>
  )
}
