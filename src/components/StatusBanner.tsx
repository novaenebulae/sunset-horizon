type StatusBannerProps = {
  message: string
  onDismiss?: () => void
}

export function StatusBanner({ message, onDismiss }: StatusBannerProps) {
  return (
    <div
      role="status"
      className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-lg border border-accent-horizon/30 bg-accent-horizon/10 px-4 py-3 text-sm text-accent-horizon"
    >
      <p className="min-w-0 flex-1">{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 text-xs font-medium underline hover:no-underline"
        >
          Fermer
        </button>
      )}
    </div>
  )
}
