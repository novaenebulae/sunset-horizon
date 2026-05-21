import { WarningBanner } from '@/components/WarningBanner'
import type { CalculationSettings, PrecisionMode } from './calculationSettingsTypes'

type CalculationSettingsPanelProps = {
  settings: CalculationSettings
  storageAvailable: boolean
  error: string | null
  onPrecisionModeChange: (mode: PrecisionMode) => void
  onRefractionChange: (enabled: boolean) => void
  onTerrainDebugChange: (enabled: boolean) => void
  onReset: () => void
  onDismissError?: () => void
}

const MODE_LABELS: Record<PrecisionMode, string> = {
  fast: 'Rapide',
  balanced: 'Normal',
  precise: 'Précis',
}

function formatDistanceKm(distanceM: number): string {
  return `${(distanceM / 1000).toFixed(0)} km`
}

export function CalculationSettingsPanel({
  settings,
  storageAvailable,
  error,
  onPrecisionModeChange,
  onRefractionChange,
  onTerrainDebugChange,
  onReset,
  onDismissError,
}: CalculationSettingsPanelProps) {
  return (
    <details className="rounded-xl border border-border bg-surface">
      <summary className="cursor-pointer list-none px-6 py-4 marker:content-none [&::-webkit-details-marker]:hidden">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
          Réglages avancés
        </h2>
      </summary>

      <div className="space-y-4 border-t border-border px-6 pb-6 pt-4">
        {!storageAvailable && (
          <WarningBanner message="Le stockage local est indisponible. Les réglages ne seront pas conservés après rechargement." />
        )}

        {error && (
          <WarningBanner message={error} onDismiss={onDismissError} />
        )}

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-text-primary">
            Mode de précision
          </legend>
          <div className="flex flex-wrap gap-2">
            {(['fast', 'balanced', 'precise'] as PrecisionMode[]).map(
              (mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onPrecisionModeChange(mode)}
                  aria-pressed={settings.precisionMode === mode}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    settings.precisionMode === mode
                      ? 'border-accent-sun bg-accent-sun/15 text-accent-sun'
                      : 'border-border text-text-secondary hover:bg-bg'
                  }`}
                >
                  {MODE_LABELS[mode]}
                </button>
              ),
            )}
          </div>
        </fieldset>

        <dl className="grid gap-2 text-xs text-text-secondary sm:grid-cols-2">
          <div>
            <dt className="font-medium text-text-primary">Distance max</dt>
            <dd>{formatDistanceKm(settings.maxDistanceM)}</dd>
          </div>
          <div>
            <dt className="font-medium text-text-primary">Pas terrain</dt>
            <dd>{settings.sampleStepM} m</dd>
          </div>
          <div>
            <dt className="font-medium text-text-primary">Pas temporel</dt>
            <dd>{settings.timeStepSeconds} s</dd>
          </div>
          <div>
            <dt className="font-medium text-text-primary">Raffinement</dt>
            <dd>{settings.refinementStepSeconds} s</dd>
          </div>
        </dl>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-text-secondary">
          <input
            type="checkbox"
            checked={settings.refractionEnabled}
            onChange={(event) => onRefractionChange(event.target.checked)}
            className="h-4 w-4 rounded border-border accent-accent-sun"
          />
          Appliquer la correction de réfraction atmosphérique
        </label>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-text-secondary">
          <input
            type="checkbox"
            checked={settings.terrainDebugEnabled}
            onChange={(event) => onTerrainDebugChange(event.target.checked)}
            className="h-4 w-4 rounded border-border accent-accent-sun"
          />
          Afficher le diagnostic terrain (mode debug)
        </label>

        {settings.precisionMode === 'precise' && (
          <p className="text-xs text-text-secondary">
            Le mode précis sollicite davantage l&apos;API IGN (jusqu&apos;à 5&nbsp;000
            points par requête ; profils plus longs sont découpés automatiquement).
          </p>
        )}

        <button
          type="button"
          onClick={onReset}
          className="rounded-lg border border-border px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-bg"
        >
          Réinitialiser (normal)
        </button>
      </div>
    </details>
  )
}
