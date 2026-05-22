import { WarningBanner } from '@/components/WarningBanner'
import type { TerrainProfileFetchSource } from '@/features/terrain/terrainTypes'
import { useTerrainProfileCacheStats } from './useTerrainProfileCacheStats'

function formatApproximateSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} o`
  }
  const kb = bytes / 1024
  if (kb < 1024) {
    return `${kb.toFixed(1)} Ko`
  }
  return `${(kb / 1024).toFixed(2)} Mo`
}

function formatFetchSourceLabel(
  source: TerrainProfileFetchSource | null,
  horizonLoading: boolean,
): string {
  if (horizonLoading) {
    return 'Calcul en cours…'
  }
  if (source === null) {
    return '—'
  }
  if (source === 'cache') {
    return 'Cache local (IndexedDB)'
  }
  if (source === 'ign-geoplateforme') {
    return 'API IGN Géoplateforme'
  }
  return 'Mock (debug)'
}

type CacheSettingsPanelProps = {
  profileFetchSource: TerrainProfileFetchSource | null
  horizonLoading?: boolean
}

export function CacheSettingsPanel({
  profileFetchSource,
  horizonLoading = false,
}: CacheSettingsPanelProps) {
  const { stats, loading, clearError, clearCache, dismissClearError } =
    useTerrainProfileCacheStats()

  return (
    <section
      className="rounded-xl border border-border bg-surface px-6 py-4 lg:px-8"
      aria-label="Cache terrain"
    >
      <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
        Cache terrain
      </h3>

      <dl className="mt-3 grid gap-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-text-secondary">Dernier profil (calcul)</dt>
          <dd className="text-right font-medium text-text-primary">
            {formatFetchSourceLabel(profileFetchSource, horizonLoading)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-text-secondary">IndexedDB</dt>
          <dd className="font-mono text-text-primary">
            {stats.available ? 'Disponible' : 'Indisponible'}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-text-secondary">Entrées</dt>
          <dd className="font-mono text-text-primary">
            {loading ? '…' : stats.entryCount}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-text-secondary">Taille approx.</dt>
          <dd className="font-mono text-text-primary">
            {loading ? '…' : formatApproximateSize(stats.approximateBytes)}
          </dd>
        </div>
      </dl>

      {clearError && (
        <div className="mt-3">
          <WarningBanner message={clearError} onDismiss={dismissClearError} />
        </div>
      )}

      <button
        type="button"
        disabled={!stats.available || loading}
        onClick={() => void clearCache()}
        className="mt-4 w-full rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-bg disabled:cursor-not-allowed disabled:opacity-50 lg:w-auto"
      >
        Vider le cache terrain
      </button>
    </section>
  )
}
