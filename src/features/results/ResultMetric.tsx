type ResultMetricProps = {
  label: string
  value: string
}

export function ResultMetric({ label, value }: ResultMetricProps) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-text-secondary">{label}</dt>
      <dd className="text-right text-text">{value}</dd>
    </div>
  )
}
