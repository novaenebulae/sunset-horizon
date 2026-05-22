import { formatLocalTime } from '@/lib/time'
import type { SpotComparisonRow } from './comparisonTypes'

type SpotComparisonTableProps = {
  rows: SpotComparisonRow[]
}

function formatDeltaMinutes(delta: number | null | undefined): string {
  if (delta === null || delta === undefined || !Number.isFinite(delta)) {
    return '—'
  }
  const sign = delta >= 0 ? '+' : ''
  return `${sign}${delta.toFixed(1)}`
}

function statusLabel(status: SpotComparisonRow['status']): string {
  switch (status) {
    case 'loading':
      return '…'
    case 'success':
      return 'OK'
    case 'insufficient':
      return 'Insuffisant'
    case 'error':
      return 'Erreur'
    default:
      return '—'
  }
}

export function SpotComparisonTable({ rows }: SpotComparisonTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-elevated text-xs uppercase tracking-wide text-text-secondary">
            <th className="px-4 py-3 font-medium">Spot</th>
            <th className="px-4 py-3 font-medium">Statut</th>
            <th className="px-4 py-3 font-medium">Corrigé</th>
            <th className="px-4 py-3 font-medium">Officiel</th>
            <th className="px-4 py-3 font-medium">Δ (min)</th>
            <th className="px-4 py-3 font-medium">Azimut</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.spotId}
              className={`border-b border-border last:border-b-0 ${
                row.isBest ? 'bg-accent-horizon/10' : 'bg-surface'
              }`}
            >
              <td className="px-4 py-3">
                <span className="font-medium text-text-primary">{row.name}</span>
                {row.isBest && (
                  <span className="ml-2 text-xs text-accent-horizon">
                    Meilleur
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-text-secondary">
                {row.status === 'error' ? (
                  <span className="text-error" title={row.error}>
                    {statusLabel(row.status)}
                  </span>
                ) : (
                  statusLabel(row.status)
                )}
              </td>
              <td className="px-4 py-3 font-mono text-accent-sun">
                {row.terrainSunset
                  ? formatLocalTime(row.terrainSunset)
                  : '—'}
              </td>
              <td className="px-4 py-3 font-mono text-text-secondary">
                {row.officialSunset
                  ? formatLocalTime(row.officialSunset)
                  : '—'}
              </td>
              <td className="px-4 py-3">{formatDeltaMinutes(row.deltaMinutes)}</td>
              <td className="px-4 py-3 text-text-secondary">
                {row.sunsetAzimuthDeg != null
                  ? `${row.sunsetAzimuthDeg.toFixed(1)}°`
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
