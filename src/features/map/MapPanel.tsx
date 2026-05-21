import { useEffect, useMemo } from 'react'
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import type { TerrainSample } from '@/features/horizon/horizonTypes'
import {
  azimuthLineEnd,
  blockingPointCoords,
} from './mapOverlays'
import type { ObserverPosition } from './types'
import { blockingIcon, observerIcon } from './leafletIcons'

const FRANCE_CENTER: [number, number] = [46.5, 2.5]
const DEFAULT_ZOOM = 6
const POSITION_ZOOM = 13

const AZIMUTH_COLOR = '#F97316'
const BLOCKING_LINE_COLOR = '#38BDF8'

type MapPanelProps = {
  position: ObserverPosition | null
  onPositionChange: (lat: number, lon: number) => void
  sunsetAzimuthDeg?: number | null
  profileSamples?: TerrainSample[]
  blockingSample?: TerrainSample | null
}

function MapClickHandler({
  onPositionChange,
}: {
  onPositionChange: (lat: number, lon: number) => void
}) {
  useMapEvents({
    click(event) {
      onPositionChange(event.latlng.lat, event.latlng.lng)
    },
  })
  return null
}

function MapViewSync({ position }: { position: ObserverPosition | null }) {
  const map = useMap()

  useEffect(() => {
    if (!position) return
    map.flyTo([position.lat, position.lon], POSITION_ZOOM, { duration: 0.8 })
  }, [map, position?.lat, position?.lon, position?.source])

  return null
}

function DraggableMarker({
  position,
  onPositionChange,
}: {
  position: ObserverPosition
  onPositionChange: (lat: number, lon: number) => void
}) {
  return (
    <Marker
      position={[position.lat, position.lon]}
      icon={observerIcon}
      draggable
      eventHandlers={{
        dragend(event) {
          const { lat, lng } = event.target.getLatLng()
          onPositionChange(lat, lng)
        },
      }}
    />
  )
}

function MapOverlays({
  position,
  sunsetAzimuthDeg,
  profileSamples = [],
  blockingSample,
}: {
  position: ObserverPosition
  sunsetAzimuthDeg: number | null | undefined
  profileSamples?: TerrainSample[]
  blockingSample?: TerrainSample | null
}) {
  const observer = { lat: position.lat, lon: position.lon }

  const azimuthLine = useMemo(() => {
    if (sunsetAzimuthDeg === null || sunsetAzimuthDeg === undefined) {
      return null
    }
    const end = azimuthLineEnd(observer, sunsetAzimuthDeg, profileSamples)
    return [
      [position.lat, position.lon],
      [end.lat, end.lon],
    ] as [number, number][]
  }, [observer, position, profileSamples, sunsetAzimuthDeg])

  const blockingLine = useMemo(() => {
    if (!blockingSample) return null
    const [lat, lon] = blockingPointCoords(blockingSample)
    return [
      [position.lat, position.lon],
      [lat, lon],
    ] as [number, number][]
  }, [blockingSample, position])

  return (
    <>
      {azimuthLine && (
        <Polyline
          positions={azimuthLine}
          pathOptions={{
            color: AZIMUTH_COLOR,
            weight: 3,
            opacity: 0.9,
          }}
        />
      )}
      {blockingLine && (
        <Polyline
          positions={blockingLine}
          pathOptions={{
            color: BLOCKING_LINE_COLOR,
            weight: 2,
            opacity: 0.7,
            dashArray: '6 4',
          }}
        />
      )}
      {blockingSample && (
        <Marker
          position={blockingPointCoords(blockingSample)}
          icon={blockingIcon}
        />
      )}
    </>
  )
}

export function MapPanel({
  position,
  onPositionChange,
  sunsetAzimuthDeg = null,
  profileSamples = [],
  blockingSample = null,
}: MapPanelProps) {
  return (
    <section
      className="overflow-hidden rounded-xl border border-border"
      aria-label="Carte de sélection du point d'observation"
    >
      <MapContainer
        center={FRANCE_CENTER}
        zoom={DEFAULT_ZOOM}
        className="z-0 h-64 w-full lg:h-80"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onPositionChange={onPositionChange} />
        <MapViewSync position={position} />
        {position && (
          <>
            <DraggableMarker
              position={position}
              onPositionChange={onPositionChange}
            />
            <MapOverlays
              position={position}
              sunsetAzimuthDeg={sunsetAzimuthDeg}
              profileSamples={profileSamples}
              blockingSample={blockingSample}
            />
          </>
        )}
      </MapContainer>
    </section>
  )
}
