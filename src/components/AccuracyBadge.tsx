type AccuracyBadgeProps = {
  label: string
  variant?: 'mock' | 'ign' | 'neutral'
}

export function AccuracyBadge({ label, variant = 'neutral' }: AccuracyBadgeProps) {
  const styles =
    variant === 'mock'
      ? 'bg-accent-horizon/20 text-accent-horizon'
      : variant === 'ign'
        ? 'bg-success/20 text-success'
        : 'bg-surface-secondary text-text-secondary'

  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${styles}`}
    >
      {label}
    </span>
  )
}
