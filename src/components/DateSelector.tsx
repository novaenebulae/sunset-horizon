import { toDateInputValue } from '@/lib/time'

type DateSelectorProps = {
  value: Date
  onChange: (date: Date) => void
}

export function DateSelector({ value, onChange }: DateSelectorProps) {
  return (
    <div className="mt-4">
      <label
        htmlFor="observation-date"
        className="mb-2 block text-sm font-medium text-text"
      >
        Date d&apos;observation
      </label>
      <input
        id="observation-date"
        type="date"
        value={toDateInputValue(value)}
        onChange={(event) => {
          const [year, month, day] = event.target.value.split('-').map(Number)
          onChange(new Date(year, month - 1, day, 12, 0, 0, 0))
        }}
        className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text focus:border-accent-sun focus:outline-none focus:ring-1 focus:ring-accent-sun"
      />
    </div>
  )
}
