import { useEffect, useState } from 'react'
import { WarningBanner } from '@/components/WarningBanner'
import type { ObserverPosition } from '@/features/map/types'
import type { CalculationSettings, PrecisionMode } from '@/features/settings/calculationSettingsTypes'
import type { TerrainProviderId } from '@/features/terrain/terrainTypes'
import { Horizon360Chart } from './Horizon360Chart'
import { useHorizon360 } from './useHorizon360'

type Horizon360PanelProps = {
  position: ObserverPosition | null
  calculationSettings: CalculationSettings
  terrainProvider: TerrainProviderId
  sunsetAzimuthDeg?: number | null
}

const MODE_LABELS: Record<PrecisionMode, string> = {
  fast: 'Rapide',
  balanced: 'Normal',
  precise: 'Précis',
}

export function Horizon360Panel({
  position,
  calculationSettings,
  terrainProvider,
  sunsetAzimuthDeg = null,
}: Horizon360PanelProps) {
  const [sectionOpen, setSectionOpen] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)')
    const syncOpen = () => setSectionOpen(media.matches)
    syncOpen()
    media.addEventListener('change', syncOpen)
    return () => media.removeEventListener('change', syncOpen)
  }, [])

  const {
    state,
    samples,
    progress,
    cacheStats,
    warnings,
    error,
    azimuthStepDeg,
    isRunning,
    run,
    cancel,
    dismissError,
  } = useHorizon360({
    position,
    calculationSettings,
    terrainProvider,
  })

  const hasResults = samples.length > 0 && state !== 'running'
  const modeLabel = MODE_LABELS[calculationSettings.precisionMode]

  return (
    <details
      className="rounded-xl border border-border bg-surface"
      open={sectionOpen}
      onToggle={(event) => setSectionOpen(event.currentTarget.open)}
    >
      <summary className="cursor-pointer list-none px-6 py-4 marker:content-none [&::-webkit-details-marker]:hidden">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
          Horizon 360 simplifié
        </h2>
      </summary>

      <div className="space-y-4 border-t border-border px-6 pb-6 pt-4">
        <p className="text-xs text-text-secondary">
          Exploration manuelle de l&apos;horizon par direction (pas {azimuthStepDeg}°
          en mode {modeLabel}). Les profils terrain passent par le cache local lorsque
          possible.
        </p>

        {!position && (
          <p className="text-sm text-text-secondary">
            Choisissez un point d&apos;observation pour lancer le calcul.
          </p>
        )}

        {error && (
          <WarningBanner message={error} onDismiss={dismissError} />
        )}

        {warnings.map((warning) => (
          <WarningBanner key={warning} message={warning} />
        ))}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!position || isRunning}
            onClick={() => void run()}
            className="rounded-lg bg-accent-horizon px-4 py-2 text-sm font-medium text-background disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRunning
              ? 'Calcul en cours…'
              : 'Calculer l\'horizon 360 simplifié'}
          </button>
          {isRunning && (
            <button
              type="button"
              onClick={cancel}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-primary hover:bg-bg"
            >
              Annuler
            </button>
          )}
        </div>

        {isRunning && progress.total > 0 && (
          <p className="text-sm text-text-secondary" role="status">
            Calcul {progress.current} / {progress.total} directions…
          </p>
        )}

        {hasResults && (
          <>
            <Horizon360Chart
              samples={samples}
              sunsetAzimuthDeg={sunsetAzimuthDeg}
            />
            <p className="text-xs text-text-secondary">
              Cache : {cacheStats.cacheHits} hit(s), {cacheStats.cacheMisses}{' '}
              miss(es)
              {cacheStats.errors > 0 && ` · ${cacheStats.errors} erreur(s)`}
            </p>
          </>
        )}
      </div>
    </details>
  )
}
