import { useMemo } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  azimuthDeltaFromCenter,
  azimuthFromCenterDelta,
  computeCenteredAzimuthDomain,
  findNearestAzimuthIndex,
  normalizeAzimuthDeg,
} from './horizon360Service'
import type { Horizon360Sample } from './horizon360Types'

type Horizon360ChartProps = {
  samples: Horizon360Sample[]
  sunsetAzimuthDeg?: number | null
}

type ChartPoint = {
  azimuthDeg: number
  deltaAzimuthDeg: number
  horizonAngleDeg: number
  blockingDistanceM: number | null
  status: Horizon360Sample['status']
  isSunset: boolean
}

function resolveChartCenterAzimuth(
  samples: Horizon360Sample[],
  sunsetAzimuthDeg: number | null | undefined,
): number | null {
  if (sunsetAzimuthDeg != null) {
    return normalizeAzimuthDeg(sunsetAzimuthDeg)
  }
  const firstSuccess = samples.find(
    (s) => s.status === 'success' && s.horizonAngleDeg != null,
  )
  return firstSuccess ? firstSuccess.azimuthDeg : null
}

function buildChartData(
  samples: Horizon360Sample[],
  centerAzimuthDeg: number,
): ChartPoint[] {
  const azimuths = samples.map((s) => s.azimuthDeg)
  const sunsetIndex = findNearestAzimuthIndex(azimuths, centerAzimuthDeg)

  const points: ChartPoint[] = []
  for (let index = 0; index < samples.length; index++) {
    const sample = samples[index]
    if (sample.status !== 'success' || sample.horizonAngleDeg == null) {
      continue
    }
    points.push({
      azimuthDeg: sample.azimuthDeg,
      deltaAzimuthDeg: azimuthDeltaFromCenter(sample.azimuthDeg, centerAzimuthDeg),
      horizonAngleDeg: sample.horizonAngleDeg,
      blockingDistanceM: sample.blockingDistanceM ?? null,
      status: sample.status,
      isSunset: sunsetIndex === index,
    })
  }

  return points.sort((a, b) => a.deltaAzimuthDeg - b.deltaAzimuthDeg)
}

function formatAzimuthTick(
  deltaDeg: number,
  centerAzimuthDeg: number,
): string {
  const az = Math.round(azimuthFromCenterDelta(centerAzimuthDeg, deltaDeg))
  return `${az}°`
}

function formatDistanceKm(distanceM: number | null): string {
  if (distanceM == null || !Number.isFinite(distanceM)) return '—'
  return `${(distanceM / 1000).toFixed(2)} km`
}

type TooltipPayload = {
  payload?: ChartPoint
}

function Horizon360Tooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: TooltipPayload[]
}) {
  if (!active || !payload?.[0]?.payload) {
    return null
  }

  const point = payload[0].payload
  const deltaLabel =
    point.deltaAzimuthDeg >= 0
      ? `+${point.deltaAzimuthDeg.toFixed(0)}°`
      : `${point.deltaAzimuthDeg.toFixed(0)}°`

  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-lg">
      <p className="font-mono text-text">
        Azimut {Math.round(point.azimuthDeg)}°
      </p>
      <p className="text-text-secondary">
        Δ coucher {deltaLabel}
      </p>
      <p className="font-mono text-accent-horizon">
        {point.horizonAngleDeg.toFixed(2)}°
      </p>
      <p className="font-mono text-text-secondary">
        Obstacle {formatDistanceKm(point.blockingDistanceM)}
      </p>
    </div>
  )
}

export function Horizon360Chart({
  samples,
  sunsetAzimuthDeg = null,
}: Horizon360ChartProps) {
  const centerAzimuthDeg = resolveChartCenterAzimuth(samples, sunsetAzimuthDeg)

  const { data, xDomain, sunsetPoint } = useMemo(() => {
    if (centerAzimuthDeg == null) {
      return { data: [], xDomain: [-90, 90] as [number, number], sunsetPoint: undefined }
    }

    const chartData = buildChartData(samples, centerAzimuthDeg)
    const domain = computeCenteredAzimuthDomain(
      chartData.map((p) => p.deltaAzimuthDeg),
    )
    const sunset = chartData.find((p) => p.isSunset)

    return {
      data: chartData,
      xDomain: domain,
      sunsetPoint: sunset,
    }
  }, [samples, centerAzimuthDeg])

  if (data.length === 0 || centerAzimuthDeg == null) {
    return (
      <p className="text-sm text-text-secondary">
        Aucun point valide à afficher sur le graphique.
      </p>
    )
  }

  return (
    <div className="w-full min-w-0">
      <p className="mb-1 text-xs text-text-secondary lg:hidden">
        Angle horizon (°) · 0° = azimut du coucher
      </p>
      <p className="mb-2 hidden text-xs text-text-secondary lg:block">
        Abscisse centrée sur le coucher (0°) · ordonnée : angle horizon (°)
      </p>

      <div className="h-56 w-full min-w-0 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 12, right: 8, left: 2, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="deltaAzimuthDeg"
              type="number"
              domain={xDomain}
              tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }}
              tickFormatter={(value) =>
                formatAzimuthTick(Number(value), centerAzimuthDeg)
              }
              label={{
                value: 'Azimut (°)',
                position: 'insideBottom',
                offset: -4,
                fontSize: 11,
                fill: 'var(--color-text-secondary)',
              }}
            />
            <YAxis
              width={32}
              tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }}
              tickFormatter={(value) =>
                `${typeof value === 'number' ? value.toFixed(0) : value}°`
              }
            />
            <Tooltip content={<Horizon360Tooltip />} />
            <Line
              type="monotone"
              dataKey="horizonAngleDeg"
              stroke="var(--color-accent-horizon)"
              strokeWidth={2}
              dot={{ r: 3, fill: 'var(--color-accent-horizon)' }}
              activeDot={{ r: 5 }}
            />
            <ReferenceLine
              x={0}
              stroke="var(--color-accent-sun)"
              strokeDasharray="4 4"
              label={{
                value: 'Coucher',
                position: 'top',
                fill: 'var(--color-accent-sun)',
                fontSize: 11,
              }}
            />
            {sunsetPoint && (
              <ReferenceDot
                x={0}
                y={sunsetPoint.horizonAngleDeg}
                r={6}
                fill="var(--color-accent-sun)"
                stroke="var(--color-background)"
                strokeWidth={2}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
