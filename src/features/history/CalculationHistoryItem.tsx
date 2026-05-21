import { formatLocalTime } from '@/lib/time'
import type { CalculationHistoryEntry } from './calculationHistoryTypes'

type CalculationHistoryItemProps = {
  entry: CalculationHistoryEntry
  onDelete: (entry: CalculationHistoryEntry) => void
}

const MODE_LABELS: Record<string, string> = {
  fast: 'Rapide',
  balanced: 'Normal',
  precise: 'Précis',
}

function formatDelta(delta: number | null): string | null {
  if (delta === null || !Number.isFinite(delta)) return null
  const sign = delta >= 0 ? '+' : ''
  return `${sign}${delta.toFixed(1)} min`
}

function formatObservationDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number)
  if (!y || !m || !d) return isoDate
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    dateStyle: 'medium',
  })
}

export function CalculationHistoryItem({
  entry,
  onDelete,
}: CalculationHistoryItemProps) {
  const official = new Date(entry.officialSunsetIso)
  const terrain = entry.terrainSunsetIso
    ? new Date(entry.terrainSunsetIso)
    : null
  const deltaLabel = formatDelta(entry.deltaMinutes)
  const modeLabel =
    MODE_LABELS[entry.settingsSnapshot.precisionMode] ??
    entry.settingsSnapshot.precisionMode

  return (
    <li className="rounded-lg border border-border/60 bg-bg/40 px-3 py-2.5 text-xs">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="space-y-1 text-text-secondary">
          <p className="font-medium text-text-primary">
            {formatObservationDate(entry.observationDate)}
          </p>
          <p>
            Officiel :{' '}
            <span className="text-text-primary">
              {formatLocalTime(official)}
            </span>
          </p>
          {terrain && (
            <p>
              Corrigé :{' '}
              <span className="text-accent-sun">{formatLocalTime(terrain)}</span>
            </p>
          )}
          {deltaLabel && (
            <p>
              Décalage :{' '}
              <span className="text-accent-sun">{deltaLabel}</span>
            </p>
          )}
          <p>Mode : {modeLabel}</p>
          {entry.warnings.length > 0 && (
            <p className="text-error/90">
              {entry.warnings.length} avertissement
              {entry.warnings.length > 1 ? 's' : ''}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => onDelete(entry)}
          className="shrink-0 rounded border border-error/40 px-2 py-1 text-xs font-medium text-error hover:bg-error/10"
        >
          Supprimer
        </button>
      </div>
    </li>
  )
}
