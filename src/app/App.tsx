import { useCallback, useEffect, useState } from 'react'
import { AppShell } from '@/components/AppShell'
import { DateSelector } from '@/components/DateSelector'
import { Header } from '@/components/Header'
import type { AddressSearchResult } from '@/features/geocoding'
import {
  LocationControls,
  LocationToolbar,
  MapPanel,
  useObserverPosition,
} from '@/features/map'
import { SunsetResultCard, HorizonProfileChart } from '@/features/results'
import { useHorizonSunset } from '@/features/horizon'
import { useSolarData } from '@/features/solar'
import { TerrainDebugPanel } from '@/features/terrain'
import type { TerrainProfileResult, TerrainProviderId } from '@/features/terrain'
import { todayAtLocalNoon } from '@/lib/time'

export function App() {
  const [observationDate, setObservationDate] = useState(todayAtLocalNoon)
  const [terrainProvider, setTerrainProvider] =
    useState<TerrainProviderId>('mock')
  const [profileOverride, setProfileOverride] =
    useState<TerrainProfileResult | null>(null)

  const {
    state,
    position,
    requestGps,
    setManualPosition,
    setAddressPosition,
    clearError,
    isLoading,
  } = useObserverPosition()

  const solar = useSolarData({
    position,
    observationDate,
    applyRefraction: true,
  })

  useEffect(() => {
    setProfileOverride(null)
  }, [
    position?.lat,
    position?.lon,
    observationDate.getTime(),
    solar.sunsetAzimuthDeg,
    terrainProvider,
  ])

  const handleProfileLoaded = useCallback((profile: TerrainProfileResult) => {
    setProfileOverride(profile)
  }, [])

  const handleAddressSelect = useCallback(
    (result: AddressSearchResult) => {
      setAddressPosition(result.lat, result.lon)
    },
    [setAddressPosition],
  )

  const horizon = useHorizonSunset({
    position,
    observationDate,
    sunsetAzimuthDeg: solar.sunsetAzimuthDeg,
    applyRefraction: true,
    provider: terrainProvider,
    profileOverride,
  })

  const horizonProfile = horizon.result?.horizonProfile ?? null
  const blockingSample = horizonProfile?.blockingSample ?? null
  const profileSamples = horizonProfile?.samples ?? []

  return (
    <AppShell>
      <Header />
      <main className="flex flex-1 flex-col gap-6">
        <LocationToolbar
          state={state}
          hasPosition={position !== null}
          isLoading={isLoading}
          onRequestGps={requestGps}
          onClearError={clearError}
          onAddressSelect={handleAddressSelect}
        />

        <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
          <div className="flex min-w-0 flex-col gap-4">
            <MapPanel
              position={position}
              onPositionChange={setManualPosition}
              sunsetAzimuthDeg={solar.sunsetAzimuthDeg}
              profileSamples={profileSamples}
              blockingSample={blockingSample}
            />
            <HorizonProfileChart
              horizonProfile={horizonProfile}
              state={horizon.state}
            />
            <LocationControls position={position} />
          </div>

          <div className="flex min-w-0 flex-col gap-4">
            <DateSelector
              value={observationDate}
              onChange={setObservationDate}
            />
            <SunsetResultCard
              state={horizon.state}
              result={horizon.result}
              error={horizon.error}
              hasPosition={position !== null}
              solarError={solar.error}
            />
            <TerrainDebugPanel
              position={position}
              sunsetAzimuthDeg={solar.sunsetAzimuthDeg}
              provider={terrainProvider}
              onProviderChange={setTerrainProvider}
              onProfileLoaded={handleProfileLoaded}
            />
          </div>
        </div>
      </main>
    </AppShell>
  )
}
