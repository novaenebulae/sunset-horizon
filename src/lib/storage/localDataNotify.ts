type LocalDataChangeListener = (source: string) => void

const listeners = new Set<LocalDataChangeListener>()

export function subscribeLocalDataChanges(
  listener: LocalDataChangeListener,
): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function notifyLocalDataChanged(source: string): void {
  for (const listener of listeners) {
    listener(source)
  }
}
