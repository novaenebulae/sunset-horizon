import { AccuracyBadge } from '@/components/AccuracyBadge'
import { formatLocalTime } from '@/lib/time'
import type { SpotComparisonRow } from './comparisonTypes'

type SpotComparisonCardProps = {
  row: SpotComparisonRow
}

function formatDeltaMinutes(delta: number | null | undefined): string | null {
  if (delta === null || delta === undefined || !Number.isFinite(delta)) {
    return null
  }
  const sign = delta >= 0 ? '+' : ''
  return `${sign}${delta.toFixed(1)} min`
}

function formatCoord(value: number): string {
  return value.toFixed(4)
}

function formatDistanceKm(distanceM: number | null | undefined): string | null {
  if (distanceM == null || !Number.isFinite(distanceM)) return null
  return `${(distanceM / 1000).toFixed(2)} km`
}

function statusLabel(status: SpotComparisonRow['status']): string {
  switch (status) {
    case 'loading':
      return 'Calcul en cours…'
    case 'success':
      return 'OK'
    case 'insufficient':
      return 'Données insuffisantes'
    case 'error':
      return 'Erreur'
    default:
      return '—'
  }
}

function sourceBadge(row: SpotComparisonRow) {
  const source = row.terrainSource
  if (source === 'mock' || source === 'fallback') {
    return { label: 'Estimation (mock)', variant: 'mock' as const }
  }
  if (source === 'ign-geoplateforme' || source === 'ign') {
    return { label: 'IGN Géoplateforme', variant: 'ign' as const }
  }
  return null
}

export function SpotComparisonCard({ row }: SpotComparisonCardProps) {
  const deltaLabel = formatDeltaMinutes(row.deltaMinutes)
  const badge = sourceBadge(row)
  const isBest = row.isBest === true

  return (
    <article
      className={`rounded-xl border bg-surface p-4 ${
        isBest ? 'border-accent-horizon' : 'border-border'
      }`}
      aria-label={`Résultat pour ${row.name}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-medium text-text-primary">{row.name}</h3>
          <p className="text-xs text-text-secondary">
            {formatCoord(row.latitude)}, {formatCoord(row.longitude)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isBest && (
            <span className="rounded-full bg-accent-horizon/20 px-2 py-0.5 text-xs font-medium text-accent-horizon">
              Meilleur spot
            </span>
          )}
          {badge && (
            <AccuracyBadge label={badge.label} variant={badge.variant} />
          )}
        </div>
      </div>

      {row.status === 'loading' && (
        <p className="mt-3 text-sm text-text-secondary">{statusLabel(row.status)}</p>
      )}

      {row.status === 'error' && (
        <p className="mt-3 text-sm text-error">{row.error ?? statusLabel(row.status)}</p>
      )}

      {row.status === 'insufficient' && (
        <p className="mt-3 text-sm text-warning">
          {row.error ?? statusLabel(row.status)}
        </p>
      )}

      {row.status === 'success' && row.terrainSunset && (
        <div className="mt-3 space-y-2">
          <p className="font-mono text-2xl font-semibold text-accent-sun">
            {formatLocalTime(row.terrainSunset)}
          </p>
          {row.officialSunset && (
            <p className="text-sm text-text-secondary">
              Officiel : {formatLocalTime(row.officialSunset)}
              {deltaLabel && (
                <span className="ml-2 text-text-primary">({deltaLabel})</span>
              )}
            </p>
          )}
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-text-secondary">
            {row.sunsetAzimuthDeg != null && (
              <>
                <dt>Azimut coucher</dt>
                <dd className="text-text-primary">
                  {row.sunsetAzimuthDeg.toFixed(1)}°
                </dd>
              </>
            )}
            {row.horizonAngleDeg != null && (
              <>
                <dt>Angle horizon</dt>
                <dd className="text-text-primary">
                  {row.horizonAngleDeg.toFixed(2)}°
                </dd>
              </>
            )}
            {formatDistanceKm(row.blockingDistanceM) && (
              <>
                <dt>Obstacle</dt>
                <dd className="text-text-primary">
                  {formatDistanceKm(row.blockingDistanceM)}
                  {row.blockingElevationM != null &&
                    ` · ${Math.round(row.blockingElevationM)} m`}
                </dd>
              </>
            )}
            {row.uncertaintyMinutes != null && (
              <>
                <dt>Incertitude</dt>
                <dd className="text-text-primary">±{row.uncertaintyMinutes} min</dd>
              </>
            )}
          </dl>
          {row.warnings && row.warnings.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs text-warning">
              {row.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </article>
  )
}
