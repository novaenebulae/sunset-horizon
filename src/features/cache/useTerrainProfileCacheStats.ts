import { useCallback, useEffect, useState } from 'react'
import {
  clearTerrainProfileCache,
  getTerrainProfileCacheStats,
  isTerrainProfileCacheAvailable,
} from './terrainProfileCache'
import { subscribeTerrainProfileCacheChanges } from './terrainProfileCacheNotify'
import type { TerrainProfileCacheStats } from './cacheTypes'

const EMPTY_STATS: TerrainProfileCacheStats = {
  available: false,
  entryCount: 0,
  approximateBytes: 0,
}

export function useTerrainProfileCacheStats() {
  const [stats, setStats] = useState<TerrainProfileCacheStats>(EMPTY_STATS)
  const [loading, setLoading] = useState(true)
  const [clearError, setClearError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setClearError(null)
    try {
      if (!isTerrainProfileCacheAvailable()) {
        setStats(EMPTY_STATS)
        return
      }
      const next = await getTerrainProfileCacheStats()
      setStats(next)
    } catch {
      setStats(EMPTY_STATS)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
    return subscribeTerrainProfileCacheChanges(() => {
      void refresh()
    })
  }, [refresh])

  const clearCache = useCallback(async () => {
    setClearError(null)
    try {
      await clearTerrainProfileCache()
      await refresh()
    } catch {
      setClearError('Impossible de vider le cache terrain.')
    }
  }, [refresh])

  const dismissClearError = useCallback(() => {
    setClearError(null)
  }, [])

  return {
    stats,
    loading,
    clearError,
    refresh,
    clearCache,
    dismissClearError,
  }
}
