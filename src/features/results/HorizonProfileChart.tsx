import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { HorizonSunsetState } from '@/features/horizon/hooks/useHorizonSunset'
import type { HorizonProfile } from '@/features/horizon/horizonTypes'

type HorizonProfileChartProps = {
  horizonProfile: HorizonProfile | null
  state: HorizonSunsetState
}

type ChartPoint = {
  distanceKm: number
  elevationM: number
  apparentAngleDeg: number
  isBlocking: boolean
}

function buildChartData(profile: HorizonProfile): ChartPoint[] {
  const blocking = profile.blockingSample
  return profile.samples.map((sample) => ({
    distanceKm: sample.distanceM / 1000,
    elevationM: sample.elevationM,
    apparentAngleDeg: sample.apparentAngleDeg,
    isBlocking:
      blocking !== null &&
      sample.distanceM === blocking.distanceM &&
      sample.elevationM === blocking.elevationM,
  }))
}

function formatDistanceKm(distanceM: number): string {
  return `${(distanceM / 1000).toFixed(2)} km`
}

type TooltipPayload = {
  payload?: ChartPoint
}

function ProfileTooltip({
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
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-lg">
      <p className="font-mono text-text">
        {point.distanceKm.toFixed(2)} km
      </p>
      <p className="font-mono text-text-secondary">
        {Math.round(point.elevationM)} m
      </p>
      <p className="font-mono text-accent-horizon">
        {point.apparentAngleDeg.toFixed(2)}°
      </p>
    </div>
  )
}

export function HorizonProfileChart({
  horizonProfile,
  state,
}: HorizonProfileChartProps) {
  if (state === 'loading') {
    return (
      <section
        className="mt-4 min-h-[240px] rounded-xl border border-border bg-surface p-6"
        aria-label="Profil altimétrique"
      >
        <p className="text-sm text-text-secondary">
          Analyse du relief dans la direction du soleil…
        </p>
      </section>
    )
  }

  if (!horizonProfile || horizonProfile.samples.length < 2) {
    return (
      <section
        className="mt-4 min-h-[240px] rounded-xl border border-border bg-surface p-6"
        aria-label="Profil altimétrique"
      >
        <p className="text-sm text-text-secondary">
          Le profil altimétrique s&apos;affichera après le calcul du coucher
          corrigé.
        </p>
      </section>
    )
  }

  const data = buildChartData(horizonProfile)
  const blocking = horizonProfile.blockingSample

  return (
    <section
      className="mt-4 rounded-xl border border-border bg-surface p-4 sm:p-6"
      aria-label="Profil altimétrique"
    >
      <h2 className="text-sm font-medium text-text">Profil altimétrique</h2>

      <div className="mt-4 min-h-[240px] w-full">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart
            data={data}
            margin={{ top: 8, right: 12, left: 0, bottom: 8 }}
          >
            <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
            <XAxis
              dataKey="distanceKm"
              type="number"
              tick={{ fill: '#9CA3AF', fontSize: 11 }}
              tickFormatter={(v) => `${v}`}
              label={{
                value: 'Distance (km)',
                position: 'insideBottom',
                offset: -4,
                fill: '#9CA3AF',
                fontSize: 11,
              }}
            />
            <YAxis
              tick={{ fill: '#9CA3AF', fontSize: 11 }}
              label={{
                value: 'Altitude (m)',
                angle: -90,
                position: 'insideLeft',
                fill: '#9CA3AF',
                fontSize: 11,
              }}
            />
            <Tooltip content={<ProfileTooltip />} />
            <Line
              type="monotone"
              dataKey="elevationM"
              stroke="#38BDF8"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#38BDF8' }}
            />
            {blocking && (
              <ReferenceDot
                x={blocking.distanceM / 1000}
                y={blocking.elevationM}
                r={7}
                fill="#F97316"
                stroke="#0B1020"
                strokeWidth={2}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <dl className="mt-4 grid gap-2 font-mono text-xs sm:grid-cols-3">
        <div>
          <dt className="text-text-secondary">Horizon effectif</dt>
          <dd className="text-accent-horizon">
            {horizonProfile.horizonAngleDeg.toFixed(2)}°
          </dd>
        </div>
        {blocking && (
          <>
            <div>
              <dt className="text-text-secondary">Point bloquant</dt>
              <dd className="text-text">
                {formatDistanceKm(blocking.distanceM)}
              </dd>
            </div>
            <div>
              <dt className="text-text-secondary">Altitude bloquante</dt>
              <dd className="text-text">
                {Math.round(blocking.elevationM)} m
              </dd>
            </div>
          </>
        )}
      </dl>
    </section>
  )
}
