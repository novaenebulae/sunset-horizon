import { AccuracyBadge } from '@/components/AccuracyBadge'
import { WarningBanner } from '@/components/WarningBanner'
import type { ObserverPosition } from '@/features/map/types'
import { useTerrainDebug } from './hooks/useTerrainDebug'
import type { TerrainProviderId } from './terrainTypes'

type TerrainDebugPanelProps = {
  position: ObserverPosition | null
  sunsetAzimuthDeg: number | null
}

function formatDistanceKm(distanceM: number): string {
  return (distanceM / 1000).toFixed(2)
}

function formatCoord(value: number): string {
  return value.toFixed(5)
}

export function TerrainDebugPanel({
  position,
  sunsetAzimuthDeg,
}: TerrainDebugPanelProps) {
  const {
    provider,
    setProvider,
    observerElevation,
    profile,
    azimuthDeg,
    isLoadingElevation,
    isLoadingProfile,
    error,
    clearError,
    loadProfile,
    hasPosition,
  } = useTerrainDebug({ position, sunsetAzimuthDeg })

  const sourceBadge =
    provider === 'mock'
      ? { label: 'Mode mock', variant: 'mock' as const }
      : { label: 'IGN Géoplateforme', variant: 'ign' as const }

  return (
    <details className="mt-6 rounded-xl border border-border bg-surface-secondary">
      <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-text">
        Diagnostic terrain (IGN)
      </summary>

      <div className="space-y-4 border-t border-border px-4 py-4">
        <p className="text-xs text-text-secondary">
          Panneau temporaire pour valider les données altimétriques avant le
          moteur horizon.
        </p>

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-text">
            Source de données
          </legend>
          <div className="flex gap-4">
            {(['mock', 'ign'] as TerrainProviderId[]).map((value) => (
              <label
                key={value}
                className="flex cursor-pointer items-center gap-2 text-sm text-text-secondary"
              >
                <input
                  type="radio"
                  name="terrain-provider"
                  value={value}
                  checked={provider === value}
                  onChange={() => setProvider(value)}
                  className="accent-accent-sun"
                />
                {value === 'mock' ? 'Mock' : 'IGN réel'}
              </label>
            ))}
          </div>
        </fieldset>

        {error && (
          <WarningBanner message={error} onDismiss={clearError} />
        )}

        {!hasPosition ? (
          <p className="text-sm text-text-secondary">
            Sélectionne un point d&apos;observation pour charger l&apos;altitude.
          </p>
        ) : (
          <>
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-medium text-text">
                Altitude observateur
              </h3>
              <AccuracyBadge
                label={sourceBadge.label}
                variant={sourceBadge.variant}
              />
            </div>

            {isLoadingElevation ? (
              <p className="text-sm text-text-secondary">Chargement…</p>
            ) : observerElevation ? (
              <p className="font-mono text-2xl font-semibold text-accent-horizon">
                {Math.round(observerElevation.elevationM)} m
              </p>
            ) : (
              <p className="text-sm text-text-secondary">Non disponible</p>
            )}

            <div className="text-xs text-text-secondary">
              Azimut profil :{' '}
              <span className="font-mono text-text">
                {azimuthDeg.toFixed(1)}°
              </span>
              {sunsetAzimuthDeg === null && ' (défaut, coucher non calculé)'}
            </div>

            <button
              type="button"
              onClick={() => void loadProfile()}
              disabled={isLoadingProfile}
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm font-medium text-text transition-colors hover:border-accent-horizon disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoadingProfile
                ? 'Chargement du profil…'
                : provider === 'mock'
                  ? 'Charger profil terrain (mock)'
                  : 'Charger profil terrain (IGN)'}
            </button>

            {profile && profile.points.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-medium text-text">
                  Points du profil ({profile.points.length})
                </h3>
                <div className="max-h-48 overflow-auto rounded-lg border border-border">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-surface-secondary text-text-secondary">
                      <tr>
                        <th className="px-2 py-2 font-medium">Dist. (km)</th>
                        <th className="px-2 py-2 font-medium">Lat</th>
                        <th className="px-2 py-2 font-medium">Lon</th>
                        <th className="px-2 py-2 font-medium">Alt. (m)</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono text-text">
                      {profile.points.map((point, index) => (
                        <tr
                          key={`${point.distanceM}-${index}`}
                          className="border-t border-border/60"
                        >
                          <td className="px-2 py-1.5">
                            {formatDistanceKm(point.distanceM)}
                          </td>
                          <td className="px-2 py-1.5">
                            {formatCoord(point.lat)}
                          </td>
                          <td className="px-2 py-1.5">
                            {formatCoord(point.lon)}
                          </td>
                          <td className="px-2 py-1.5">
                            {Math.round(point.elevationM)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </details>
  )
}
