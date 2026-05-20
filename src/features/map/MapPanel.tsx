import { useEffect } from 'react'
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import type { ObserverPosition } from './types'
import { observerIcon } from './leafletIcons'

const FRANCE_CENTER: [number, number] = [46.5, 2.5]
const DEFAULT_ZOOM = 6
const POSITION_ZOOM = 13

type MapPanelProps = {
  position: ObserverPosition | null
  onPositionChange: (lat: number, lon: number) => void
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

export function MapPanel({ position, onPositionChange }: MapPanelProps) {
  return (
    <section
      className="overflow-hidden rounded-xl border border-border"
      aria-label="Carte de sélection du point d'observation"
    >
      <MapContainer
        center={FRANCE_CENTER}
        zoom={DEFAULT_ZOOM}
        className="h-64 w-full z-0"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onPositionChange={onPositionChange} />
        <MapViewSync position={position} />
        {position && (
          <DraggableMarker
            position={position}
            onPositionChange={onPositionChange}
          />
        )}
      </MapContainer>
    </section>
  )
}
