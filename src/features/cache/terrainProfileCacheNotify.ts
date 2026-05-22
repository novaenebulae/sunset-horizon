type CacheChangeListener = () => void

const listeners = new Set<CacheChangeListener>()

export function subscribeTerrainProfileCacheChanges(
  listener: CacheChangeListener,
): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function notifyTerrainProfileCacheChanged(): void {
  for (const listener of listeners) {
    listener()
  }
}
