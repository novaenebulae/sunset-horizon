import { AccuracyBadge } from '@/components/AccuracyBadge'
import { formatLocalTime } from '@/lib/time'
import type { HorizonSunsetState } from '@/features/horizon/hooks/useHorizonSunset'
import type { SunsetResult } from '@/features/horizon/horizonTypes'
import { ResultMetric } from './ResultMetric'
import { ResultStatus } from './ResultStatus'

type SunsetResultCardProps = {
  state: HorizonSunsetState
  result: SunsetResult | null
  error: string | null
  hasPosition: boolean
  solarError?: string | null
}

function formatDeltaMinutes(delta: number): string {
  const sign = delta >= 0 ? '+' : ''
  return `${sign}${delta.toFixed(1)} min`
}

function formatDistanceKm(distanceM: number): string {
  return `${(distanceM / 1000).toFixed(2)} km`
}

function sourceBadge(source: SunsetResult['horizonProfile']['source']) {
  if (source === 'mock' || source === 'fallback') {
    return { label: 'Estimation (mock)', variant: 'mock' as const }
  }
  return { label: 'IGN Géoplateforme', variant: 'ign' as const }
}

export function SunsetResultCard({
  state,
  result,
  error,
  hasPosition,
  solarError,
}: SunsetResultCardProps) {
  if (!hasPosition) {
    return (
      <section
        className="mt-4 rounded-xl border border-border bg-surface p-6"
        aria-label="Coucher corrigé"
      >
        <ResultStatus state="idle" />
      </section>
    )
  }

  if (solarError) {
    return (
      <section
        className="mt-4 rounded-xl border border-border bg-surface p-6"
        aria-label="Coucher corrigé"
      >
        <p className="text-sm text-error">{solarError}</p>
      </section>
    )
  }

  const badge = result ? sourceBadge(result.horizonProfile.source) : null
  const blocking = result?.horizonProfile.blockingSample

  return (
    <section
      className="mt-4 rounded-xl border border-border bg-surface p-6"
      aria-label="Coucher corrigé"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium tracking-wide text-text-secondary uppercase">
          Coucher derrière le relief
        </p>
        {badge && (
          <AccuracyBadge label={badge.label} variant={badge.variant} />
        )}
      </div>

      {state === 'success' && result?.terrainSunset ? (
        <>
          <p className="mt-2 font-mono text-4xl font-semibold text-accent-sun">
            {formatLocalTime(result.terrainSunset)}
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            Estimation — soleil masqué par le relief visible
          </p>

          {result.deltaMinutes !== null && (
            <p className="mt-3 font-mono text-xl text-accent-horizon">
              {formatDeltaMinutes(result.deltaMinutes)}
              <span className="ml-2 text-sm font-sans text-text-secondary">
                vs coucher officiel
              </span>
            </p>
          )}

          <dl className="mt-4 space-y-2 border-t border-border pt-4 font-mono text-sm">
            <ResultMetric
              label="Angle horizon effectif"
              value={`${result.horizonProfile.horizonAngleDeg.toFixed(2)}°`}
            />
            {blocking && (
              <>
                <ResultMetric
                  label="Point bloquant (distance)"
                  value={formatDistanceKm(blocking.distanceM)}
                />
                <ResultMetric
                  label="Point bloquant (altitude)"
                  value={`${Math.round(blocking.elevationM)} m`}
                />
              </>
            )}
            <ResultMetric
              label="Azimut profil"
              value={`${result.sunsetAzimuthDeg.toFixed(1)}°`}
            />
            <ResultMetric
              label="Incertitude indicative"
              value={`±${result.uncertaintyMinutes} min`}
            />
          </dl>

          <div className="mt-4 border-t border-border pt-4">
            <p className="text-xs font-medium tracking-wide text-text-secondary uppercase">
              Horizon théorique
            </p>
            <p className="mt-1 font-mono text-lg text-text-secondary">
              {formatLocalTime(result.officialSunset)}
            </p>
          </div>
        </>
      ) : (
        <div className="mt-4">
          <ResultStatus state={state} error={error} />
        </div>
      )}
    </section>
  )
}
