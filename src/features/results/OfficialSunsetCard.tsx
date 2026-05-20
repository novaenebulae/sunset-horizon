import { formatLocalTime } from '@/lib/time'
import type { SolarDataResult } from '@/features/solar/hooks/useSolarData'

type OfficialSunsetCardProps = {
  solar: SolarDataResult
  hasPosition: boolean
}

export function OfficialSunsetCard({ solar, hasPosition }: OfficialSunsetCardProps) {
  if (!hasPosition) {
    return (
      <section
        className="mt-4 rounded-xl border border-border bg-surface p-6"
        aria-label="Coucher officiel"
      >
        <p className="text-sm text-text-secondary">
          Sélectionne un point pour voir le coucher officiel.
        </p>
      </section>
    )
  }

  if (solar.error) {
    return (
      <section
        className="mt-4 rounded-xl border border-border bg-surface p-6"
        aria-label="Coucher officiel"
      >
        <p className="text-sm text-error">{solar.error}</p>
      </section>
    )
  }

  if (!solar.isReady || !solar.officialSunset) {
    return null
  }

  return (
    <section
      className="mt-4 rounded-xl border border-border bg-surface p-6"
      aria-label="Coucher officiel"
    >
      <p className="text-xs font-medium tracking-wide text-text-secondary uppercase">
        Horizon théorique
      </p>
      <p className="mt-2 font-mono text-4xl font-semibold text-accent-sun">
        {formatLocalTime(solar.officialSunset.at)}
      </p>
      <p className="mt-1 text-sm text-text-secondary">
        Coucher officiel (soleil sous l&apos;horizon plat)
      </p>

      {solar.sunsetAzimuthDeg !== null && (
        <dl className="mt-4 space-y-2 border-t border-border pt-4 font-mono text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-text-secondary">Azimut au coucher</dt>
            <dd className="text-text">
              {solar.sunsetAzimuthDeg.toFixed(1)}°
            </dd>
          </div>
        </dl>
      )}
    </section>
  )
}
