import { AppShell } from '@/components/AppShell'
import { Header } from '@/components/Header'
import {
  LocationControls,
  MapPanel,
  useObserverPosition,
} from '@/features/map'

export function App() {
  const {
    state,
    position,
    requestGps,
    setManualPosition,
    clearError,
    isLoading,
  } = useObserverPosition()

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
      </main>
    </AppShell>
  )
}
