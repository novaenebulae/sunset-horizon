import type { GeolocationErrorCode } from './types'

export type GeolocationSuccess = {
  lat: number
  lon: number
  accuracyM: number | null
}

export type GeolocationFailure = {
  code: GeolocationErrorCode
  message: string
}

const DEFAULT_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 15_000,
  maximumAge: 0,
}

export function geolocationErrorMessage(code: GeolocationErrorCode): string {
  switch (code) {
    case 'PERMISSION_DENIED':
      return 'Autorisation refusée. Clique sur la carte pour choisir un point.'
    case 'POSITION_UNAVAILABLE':
      return 'Position indisponible. Clique sur la carte pour choisir un point.'
    case 'TIMEOUT':
      return 'Délai dépassé. Clique sur la carte pour choisir un point.'
    case 'UNSUPPORTED':
      return 'Géolocalisation indisponible. Clique sur la carte ou saisis des coordonnées.'
    default:
      return 'Géolocalisation indisponible. Clique sur la carte ou saisis des coordonnées.'
  }
}

function mapErrorCode(error: GeolocationPositionError): GeolocationErrorCode {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'PERMISSION_DENIED'
    case error.POSITION_UNAVAILABLE:
      return 'POSITION_UNAVAILABLE'
    case error.TIMEOUT:
      return 'TIMEOUT'
    default:
      return 'POSITION_UNAVAILABLE'
  }
}

export function requestCurrentPosition(
  options: PositionOptions = DEFAULT_OPTIONS,
): Promise<GeolocationSuccess> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        code: 'UNSUPPORTED' satisfies GeolocationErrorCode,
        message: geolocationErrorMessage('UNSUPPORTED'),
      } satisfies GeolocationFailure)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          accuracyM: position.coords.accuracy ?? null,
        })
      },
      (error) => {
        const code = mapErrorCode(error)
        reject({
          code,
          message: geolocationErrorMessage(code),
        } satisfies GeolocationFailure)
      },
      options,
    )
  })
}
