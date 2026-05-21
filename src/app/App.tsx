import { useState } from 'react'
import { AppShell } from '@/components/AppShell'
import { DateSelector } from '@/components/DateSelector'
import { Header } from '@/components/Header'
import {
  LocationControls,
  MapPanel,
  useObserverPosition,
} from '@/features/map'
import { OfficialSunsetCard } from '@/features/results'
import { useSolarData } from '@/features/solar'
import { TerrainDebugPanel } from '@/features/terrain'
import { todayAtLocalNoon } from '@/lib/time'

export function App() {
  const [observationDate, setObservationDate] = useState(todayAtLocalNoon)
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
        <OfficialSunsetCard solar={solar} hasPosition={position !== null} />
        <TerrainDebugPanel
          position={position}
          sunsetAzimuthDeg={solar.sunsetAzimuthDeg}
        />
      </main>
    </AppShell>
  )
}
