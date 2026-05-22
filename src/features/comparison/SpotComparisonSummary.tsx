import { formatLocalDate } from '@/lib/time'
import type { SpotComparisonRow } from './comparisonTypes'

type SpotComparisonSummaryProps = {
  observationDate: Date
  precisionLabel: string
  refractionEnabled: boolean
  maxDistanceM: number
  sampleStepM: number
  rows: SpotComparisonRow[]
  successfulCount: number
  errorCount: number
  insufficientCount: number
}

export function SpotComparisonSummary({
  observationDate,
  precisionLabel,
  refractionEnabled,
  maxDistanceM,
  sampleStepM,
  rows,
  successfulCount,
  errorCount,
  insufficientCount,
}: SpotComparisonSummaryProps) {
  const bestRows = rows.filter((r) => r.isBest)
  const bestName =
    bestRows.length === 1
      ? bestRows[0].name
      : bestRows.length > 1
        ? bestRows.map((r) => r.name).join(', ')
        : null

  return (
    <div className="space-y-3 rounded-lg border border-border bg-surface-elevated/50 p-4 text-sm">
      <p className="text-text-secondary">
        Date :{' '}
        <span className="text-text-primary">
          {formatLocalDate(observationDate)}
        </span>
        {' · '}
        Mode {precisionLabel}
        {refractionEnabled ? ' · réfraction' : ' · sans réfraction'}
        {' · '}
        {(maxDistanceM / 1000).toFixed(0)} km / pas {(sampleStepM).toFixed(0)} m
      </p>

      {rows.length > 0 && (
        <p className="text-text-secondary">
          {successfulCount} réussi{successfulCount !== 1 ? 's' : ''}
          {errorCount > 0 && ` · ${errorCount} erreur${errorCount !== 1 ? 's' : ''}`}
          {insufficientCount > 0 &&
            ` · ${insufficientCount} insuffisant${insufficientCount !== 1 ? 's' : ''}`}
        </p>
      )}

      {bestName && (
        <p className="rounded-md border border-accent-horizon/40 bg-accent-horizon/10 px-3 py-2 text-text-primary">
          <span className="font-medium text-accent-horizon">Meilleur coucher : </span>
          {bestName}
        </p>
      )}
    </div>
  )
}
