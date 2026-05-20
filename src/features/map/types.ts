export type PositionSource = 'gps' | 'manual'

export type GeolocationErrorCode =
  | 'PERMISSION_DENIED'
  | 'POSITION_UNAVAILABLE'
  | 'TIMEOUT'
  | 'UNSUPPORTED'

export type ObserverPosition = {
  lat: number
  lon: number
  accuracyM: number | null
  source: PositionSource
  updatedAt: Date
}

export type ObserverState =
  | { status: 'idle' }
  | { status: 'loading'; source: 'gps' }
  | { status: 'ready'; position: ObserverPosition }
  | { status: 'error'; code: GeolocationErrorCode; message: string }
