import {
  GeocodingError,
  type AddressSearchResult,
  type SearchAddressesOptions,
} from './geocodingTypes'

export const GEOCODING_SEARCH_URL =
  'https://data.geopf.fr/geocodage/search'

export const MIN_QUERY_LENGTH = 3
export const DEFAULT_RESULT_LIMIT = 5

type RawFeature = {
  type?: string
  geometry?: {
    type?: string
    coordinates?: [number, number]
  }
  properties?: {
    label?: string
    score?: number
    city?: string
    postcode?: string
    type?: string
    id?: string
    banId?: string
  }
}

type RawGeocodeResponse = {
  type?: string
  features?: RawFeature[]
}

function featureId(feature: RawFeature, index: number): string {
  return (
    feature.properties?.id ??
    feature.properties?.banId ??
    `feature-${index}`
  )
}

function parseFeature(
  feature: RawFeature,
  index: number,
): AddressSearchResult | null {
  const coords = feature.geometry?.coordinates
  if (!coords || coords.length < 2) {
    return null
  }

  const [lon, lat] = coords
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return null
  }

  const label = feature.properties?.label?.trim()
  if (!label) {
    return null
  }

  return {
    id: featureId(feature, index),
    label,
    lat,
    lon,
    city: feature.properties?.city ?? null,
    postcode: feature.properties?.postcode ?? null,
    score: feature.properties?.score ?? null,
    type: feature.properties?.type ?? null,
  }
}

export function parseGeocodeResponse(data: unknown): AddressSearchResult[] {
  if (!data || typeof data !== 'object') {
    throw new GeocodingError(
      'INVALID_RESPONSE',
      'Réponse de géocodage invalide.',
    )
  }

  const payload = data as RawGeocodeResponse
  if (payload.type !== 'FeatureCollection' || !Array.isArray(payload.features)) {
    throw new GeocodingError(
      'INVALID_RESPONSE',
      'Réponse de géocodage invalide.',
    )
  }

  const results: AddressSearchResult[] = []
  for (let i = 0; i < payload.features.length; i++) {
    const parsed = parseFeature(payload.features[i], i)
    if (parsed) {
      results.push(parsed)
    }
  }

  return results
}

export async function searchAddresses(
  query: string,
  options: SearchAddressesOptions = {},
): Promise<AddressSearchResult[]> {
  const trimmed = query.trim()
  if (trimmed.length < MIN_QUERY_LENGTH) {
    throw new GeocodingError(
      'EMPTY_QUERY',
      'Saisissez au moins 3 caractères pour rechercher.',
    )
  }

  const limit = options.limit ?? DEFAULT_RESULT_LIMIT
  const params = new URLSearchParams({
    q: trimmed,
    limit: String(limit),
  })

  let response: Response
  try {
    response = await fetch(`${GEOCODING_SEARCH_URL}?${params.toString()}`)
  } catch {
    throw new GeocodingError(
      'NETWORK',
      'Impossible de contacter le service de géocodage.',
    )
  }

  if (!response.ok) {
    throw new GeocodingError(
      'NETWORK',
      `Erreur du service de géocodage (${response.status}).`,
    )
  }

  let data: unknown
  try {
    data = await response.json()
  } catch {
    throw new GeocodingError(
      'INVALID_RESPONSE',
      'Réponse de géocodage illisible.',
    )
  }

  const results = parseGeocodeResponse(data)
  if (results.length === 0) {
    throw new GeocodingError('NO_RESULTS', 'Aucune adresse trouvée.')
  }

  return results
}
