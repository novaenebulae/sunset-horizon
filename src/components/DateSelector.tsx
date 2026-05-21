import { toDateInputValue } from '@/lib/time'

type DateSelectorProps = {
  value: Date
  onChange: (date: Date) => void
  variant?: 'stacked' | 'toolbar'
}

export function DateSelector({
  value,
  onChange,
  variant = 'stacked',
}: DateSelectorProps) {
  const input = (
    <input
      id="observation-date"
      type="date"
      value={toDateInputValue(value)}
      onChange={(event) => {
        const [year, month, day] = event.target.value.split('-').map(Number)
        onChange(new Date(year, month - 1, day, 12, 0, 0, 0))
      }}
      className={
        variant === 'toolbar'
          ? 'w-full min-w-[10.5rem] rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text focus:border-accent-sun focus:outline-none focus:ring-1 focus:ring-accent-sun'
          : 'w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text focus:border-accent-sun focus:outline-none focus:ring-1 focus:ring-accent-sun'
      }
    />
  )

  if (variant === 'toolbar') {
    return (
      <div className="shrink-0">
        <label
          htmlFor="observation-date"
          className="mb-1.5 block text-xs font-medium text-text-secondary"
        >
          Date d&apos;observation
        </label>
        {input}
      </div>
    )
  }

  return (
    <section aria-label="Date d'observation">
      <label
        htmlFor="observation-date"
        className="mb-2 block text-sm font-medium text-text"
      >
        Date d&apos;observation
      </label>
      {input}
    </section>
  )
}
