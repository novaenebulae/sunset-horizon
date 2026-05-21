import { useCallback, useEffect, useState } from 'react'
import { AppShell } from '@/components/AppShell'
import { DateSelector } from '@/components/DateSelector'
import { Header } from '@/components/Header'
import {
  LocationControls,
  MapPanel,
  useObserverPosition,
} from '@/features/map'
import { SunsetResultCard } from '@/features/results'
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

  const horizon = useHorizonSunset({
    position,
    observationDate,
    sunsetAzimuthDeg: solar.sunsetAzimuthDeg,
    applyRefraction: true,
    provider: terrainProvider,
    profileOverride,
  })

  return (
    <AppShell>
      <Header />
      <main className="flex flex-1 flex-col">
        <MapPanel position={position} onPositionChange={setManualPosition} />
        <LocationControls
          state={state}
          position={position}
          isLoading={isLoading}
          onRequestGps={requestGps}
          onClearError={clearError}
        />
        <DateSelector value={observationDate} onChange={setObservationDate} />
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
      </main>
    </AppShell>
  )
}
