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
import { SpotComparisonPanel } from '@/features/comparison'
import { Horizon360Panel } from '@/features/horizon360'
import { ImportExportPanel } from '@/features/importExport'
import { SavedSpotsSection } from '@/features/spots'
import { CacheSettingsPanel } from '@/features/cache'
import {
  CalculationSettingsPanel,
  useCalculationSettings,
} from '@/features/settings'
import { TerrainDebugPanel } from '@/features/terrain'
import type { TerrainProfileResult, TerrainProviderId } from '@/features/terrain'
import { todayAtLocalNoon } from '@/lib/time'

export function App() {
  const [observationDate, setObservationDate] = useState(todayAtLocalNoon)
  const [terrainProvider, setTerrainProvider] =
    useState<TerrainProviderId>('ign')
  const [profileOverride, setProfileOverride] =
    useState<TerrainProfileResult | null>(null)
  const [lastAddressLabel, setLastAddressLabel] = useState<string | null>(null)
  const {
    settings: calculationSettings,
    storageAvailable: settingsStorageAvailable,
    error: settingsError,
    setPrecisionMode,
    setRefractionEnabled,
    setTerrainDebugEnabled,
    setTerrainCachePanelEnabled,
    resetSettings,
    dismissError: dismissSettingsError,
  } = useCalculationSettings()

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
    applyRefraction: calculationSettings.refractionEnabled,
  })

  useEffect(() => {
    setProfileOverride(null)
  }, [
    position?.lat,
    position?.lon,
    observationDate.getTime(),
    solar.sunsetAzimuthDeg,
    terrainProvider,
    calculationSettings.precisionMode,
    calculationSettings.maxDistanceM,
    calculationSettings.sampleStepM,
    calculationSettings.timeStepSeconds,
    calculationSettings.refinementStepSeconds,
    calculationSettings.refractionEnabled,
  ])

  useEffect(() => {
    if (!calculationSettings.terrainDebugEnabled && terrainProvider !== 'ign') {
      setTerrainProvider('ign')
    }
  }, [calculationSettings.terrainDebugEnabled, terrainProvider])

  const effectiveTerrainProvider: TerrainProviderId =
    calculationSettings.terrainDebugEnabled ? terrainProvider : 'ign'

  const handleProfileLoaded = useCallback((profile: TerrainProfileResult) => {
    setProfileOverride(profile)
  }, [])

  const handleAddressSelect = useCallback(
    (result: AddressSearchResult) => {
      setLastAddressLabel(result.label)
      setAddressPosition(result.lat, result.lon)
    },
    [setAddressPosition],
  )

  const handleLoadSavedSpot = useCallback(
    (lat: number, lon: number) => {
      setManualPosition(lat, lon)
    },
    [setManualPosition],
  )

  const horizon = useHorizonSunset({
    position,
    observationDate,
    sunsetAzimuthDeg: solar.sunsetAzimuthDeg,
    calculationSettings,
    provider: effectiveTerrainProvider,
    profileOverride,
  })

  const horizonProfile = horizon.result?.horizonProfile ?? null
  const blockingSample = horizonProfile?.blockingSample ?? null
  const profileSamples = horizonProfile?.samples ?? []

  return (
    <AppShell>
      <Header />
      <main className="flex flex-1 flex-col gap-6">
        {/* Desktop : localisation + date sur une ligne */}
        <div className="hidden min-w-0 items-end gap-8 lg:flex">
          <div className="min-w-0 flex-1">
            <LocationToolbar
              state={state}
              hasPosition={position !== null}
              isLoading={isLoading}
              onRequestGps={requestGps}
              onClearError={clearError}
              onAddressSelect={handleAddressSelect}
            />
          </div>
          <div className="shrink-0 border-l border-border pl-8">
            <DateSelector
              variant="toolbar"
              value={observationDate}
              onChange={setObservationDate}
            />
          </div>
        </div>

        {/* Mobile : barre de localisation seule */}
        <div className="lg:hidden">
          <LocationToolbar
            state={state}
            hasPosition={position !== null}
            isLoading={isLoading}
            onRequestGps={requestGps}
            onClearError={clearError}
            onAddressSelect={handleAddressSelect}
          />
        </div>

        <div className="flex min-w-0 flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)] lg:items-start lg:gap-x-6 lg:gap-y-4">
          {/* Colonne droite desktop : position → résultats → réglages (gap serré) */}
          <div className="max-lg:contents lg:col-start-2 lg:row-span-2 lg:flex lg:flex-col lg:gap-4 lg:self-start">
            <div className="order-1">
              <LocationControls position={position} />
            </div>

            <div className="order-4">
              <SunsetResultCard
                state={horizon.state}
                result={horizon.result}
                error={horizon.error}
                hasPosition={position !== null}
                solarError={solar.error}
              />
            </div>

            <div className="order-8 flex flex-col gap-4">
              <CalculationSettingsPanel
                settings={calculationSettings}
                storageAvailable={settingsStorageAvailable}
                error={settingsError}
                onPrecisionModeChange={setPrecisionMode}
                onRefractionChange={setRefractionEnabled}
                onTerrainDebugChange={setTerrainDebugEnabled}
                onTerrainCachePanelChange={setTerrainCachePanelEnabled}
                onReset={resetSettings}
                onDismissError={dismissSettingsError}
              />
              <ImportExportPanel />
              {calculationSettings.terrainCachePanelEnabled && (
                <CacheSettingsPanel
                  profileFetchSource={horizon.profileFetchSource}
                  horizonLoading={horizon.state === 'loading'}
                />
              )}
              {calculationSettings.terrainDebugEnabled && (
                <TerrainDebugPanel
                  position={position}
                  sunsetAzimuthDeg={solar.sunsetAzimuthDeg}
                  provider={terrainProvider}
                  calculationSettings={calculationSettings}
                  onProviderChange={setTerrainProvider}
                  onProfileLoaded={handleProfileLoaded}
                />
              )}
            </div>
          </div>

          <div className="order-2 min-w-0 lg:col-start-1 lg:row-start-1">
            <MapPanel
              position={position}
              onPositionChange={setManualPosition}
              sunsetAzimuthDeg={solar.sunsetAzimuthDeg}
              profileSamples={profileSamples}
              blockingSample={blockingSample}
            />
          </div>

          <div className="order-3 lg:hidden">
            <DateSelector
              value={observationDate}
              onChange={setObservationDate}
            />
          </div>

          <div className="order-5 min-w-0 lg:col-start-1 lg:row-start-2">
            <HorizonProfileChart
              horizonProfile={horizonProfile}
              state={horizon.state}
            />
          </div>

          <div className="order-6 min-w-0 lg:col-span-2 lg:row-start-3">
            <Horizon360Panel
              position={position}
              calculationSettings={calculationSettings}
              terrainProvider={effectiveTerrainProvider}
              sunsetAzimuthDeg={solar.sunsetAzimuthDeg}
            />
          </div>

          <div className="order-7 min-w-0 lg:col-span-2 lg:row-start-4">
            <SavedSpotsSection
              position={position}
              observationDate={observationDate}
              calculationSettings={calculationSettings}
              horizonState={horizon.state}
              horizonResult={horizon.result}
              lastAddressLabel={lastAddressLabel}
              onLoadSpot={handleLoadSavedSpot}
            />
          </div>

          <div className="order-8 min-w-0 lg:col-span-2 lg:row-start-5">
            <SpotComparisonPanel
              observationDate={observationDate}
              calculationSettings={calculationSettings}
              terrainProvider={effectiveTerrainProvider}
            />
          </div>
        </div>
      </main>
    </AppShell>
  )
}
