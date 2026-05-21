export type GeocodingErrorCode =
  | 'NETWORK'
  | 'INVALID_RESPONSE'
  | 'NO_RESULTS'
  | 'EMPTY_QUERY'

export class GeocodingError extends Error {
  readonly code: GeocodingErrorCode

  constructor(code: GeocodingErrorCode, message: string) {
    super(message)
    this.name = 'GeocodingError'
    this.code = code
  }
}

export type AddressSearchResult = {
  id: string
  label: string
  lat: number
  lon: number
  city: string | null
  postcode: string | null
  score: number | null
  type: string | null
}

export type SearchAddressesOptions = {
  limit?: number
}
