type WarningBannerProps = {
  message: string
  onDismiss?: () => void
}

export function WarningBanner({ message, onDismiss }: WarningBannerProps) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-error/40 bg-error/10 px-4 py-3 text-sm text-error"
    >
      <p>{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="mt-2 text-xs font-medium underline hover:no-underline"
        >
          Fermer
        </button>
      )}
    </div>
  )
}
