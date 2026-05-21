// IGN altimetry REST API — elevationLine sampling: 2..5000, 5 req/s per IP.
// https://geoservices.ign.fr/node/1439

import type { LatLon } from '@/lib/geo'
import { TerrainError, terrainErrorMessage } from './terrainErrors'

export const IGN_ELEVATION_URL =
  'https://data.geopf.fr/altimetrie/1.0/calcul/alti/rest/elevation.json'

export const IGN_ELEVATION_LINE_URL =
  'https://data.geopf.fr/altimetrie/1.0/calcul/alti/rest/elevationLine.json'

export const DEFAULT_ALTI_RESOURCE = 'ign_rge_alti_wld'
export const IGN_DELIMITER = '|'
export const IGN_NO_DATA_Z = -99999

/** IGN may return -99999 or values such as -99998.99 for no-data cells. */
const IGN_NO_DATA_THRESHOLD_Z = -99990

/** IGN rate limit: 5 requests per second per IP (official doc). */
export const IGN_MAX_REQUESTS_PER_SECOND = 5
export const IGN_MIN_REQUEST_INTERVAL_MS = 1000 / IGN_MAX_REQUESTS_PER_SECOND

/**
 * Max sampling for elevationLine.json (official IGN altimetry REST API: 2–5000).
 * @see https://geoservices.ign.fr/documentation/services/services-departementaux/altimetrie.html
 */
export const IGN_MAX_SAMPLING_PER_REQUEST = 5000

const MIN_REQUEST_INTERVAL_MS = IGN_MIN_REQUEST_INTERVAL_MS

let lastRequestAt = 0

export type IgnElevationEntry = {
  lon: number
  lat: number
  z: number
}

type IgnElevationObject = {
  lon?: number
  lat?: number
  z: number
}

type IgnRawResponse = {
  elevations?: Array<number | IgnElevationObject>
}

export type ProfileMode = 'simple' | 'accurate'

export function isNoDataElevation(z: number): boolean {
  return z <= IGN_NO_DATA_THRESHOLD_Z
}

async function throttleRequests(): Promise<void> {
  const now = Date.now()
  const elapsed = now - lastRequestAt
  if (elapsed < MIN_REQUEST_INTERVAL_MS) {
    await new Promise((resolve) =>
      setTimeout(resolve, MIN_REQUEST_INTERVAL_MS - elapsed),
    )
  }
  lastRequestAt = Date.now()
}

function assertNoDataElevation(z: number): void {
  if (isNoDataElevation(z)) {
    throw new TerrainError('OUT_OF_COVERAGE', terrainErrorMessage('OUT_OF_COVERAGE'))
  }
}

function buildPointElevationParams(lons: number[], lats: number[]): URLSearchParams {
  if (lons.length !== lats.length || lons.length === 0) {
    throw new TerrainError('API_ERROR', 'Coordonnées invalides pour l’API IGN.')
  }

  return new URLSearchParams({
    lon: lons.map((v) => v.toFixed(6)).join(IGN_DELIMITER),
    lat: lats.map((v) => v.toFixed(6)).join(IGN_DELIMITER),
    resource: DEFAULT_ALTI_RESOURCE,
    delimiter: IGN_DELIMITER,
    indent: 'false',
    measures: 'false',
    zonly: 'true',
  })
}

function buildProfileLineParams(
  startLon: number,
  startLat: number,
  endLon: number,
  endLat: number,
  sampling: number,
  profileMode: ProfileMode,
): URLSearchParams {
  return new URLSearchParams({
    lon: `${startLon.toFixed(6)}${IGN_DELIMITER}${endLon.toFixed(6)}`,
    lat: `${startLat.toFixed(6)}${IGN_DELIMITER}${endLat.toFixed(6)}`,
    resource: DEFAULT_ALTI_RESOURCE,
    delimiter: IGN_DELIMITER,
    indent: 'false',
    measures: 'false',
    zonly: 'false',
    profile_mode: profileMode,
    sampling: String(sampling),
  })
}

function parsePointElevationResponse(
  data: IgnRawResponse,
  lons: number[],
  lats: number[],
): IgnElevationEntry[] {
  const elevations = data.elevations ?? []
  if (elevations.length === 0) {
    throw new TerrainError('EMPTY_RESPONSE', terrainErrorMessage('EMPTY_RESPONSE'))
  }

  if (elevations.length !== lons.length) {
    throw new TerrainError('API_ERROR', terrainErrorMessage('API_ERROR'))
  }

  return elevations.map((entry, index) => {
    if (typeof entry === 'number') {
      assertNoDataElevation(entry)
      return { lon: lons[index], lat: lats[index], z: entry }
    }

    if (typeof entry === 'object' && entry !== null && Number.isFinite(entry.z)) {
      assertNoDataElevation(entry.z)
      return {
        lon: entry.lon ?? lons[index],
        lat: entry.lat ?? lats[index],
        z: entry.z,
      }
    }

    throw new TerrainError('API_ERROR', terrainErrorMessage('API_ERROR'))
  })
}

function parseProfileElevationResponse(data: IgnRawResponse): IgnElevationEntry[] {
  const elevations = data.elevations ?? []
  if (elevations.length === 0) {
    throw new TerrainError('EMPTY_RESPONSE', terrainErrorMessage('EMPTY_RESPONSE'))
  }

  const points: IgnElevationEntry[] = []

  for (const entry of elevations) {
    if (typeof entry !== 'object' || entry === null) {
      throw new TerrainError('API_ERROR', terrainErrorMessage('API_ERROR'))
    }

    const lon = entry.lon
    const lat = entry.lat
    const z = entry.z
    if (
      lon === undefined ||
      lat === undefined ||
      !Number.isFinite(lon) ||
      !Number.isFinite(lat) ||
      !Number.isFinite(z)
    ) {
      throw new TerrainError('API_ERROR', terrainErrorMessage('API_ERROR'))
    }

    if (isNoDataElevation(z)) {
      break
    }
    points.push({ lon, lat, z })
  }

  if (points.length < 2) {
    throw new TerrainError('OUT_OF_COVERAGE', terrainErrorMessage('OUT_OF_COVERAGE'))
  }

  return points
}

async function fetchIgnJson(url: string, params: URLSearchParams): Promise<unknown> {
  await throttleRequests()

  let response: Response
  try {
    response = await fetch(`${url}?${params.toString()}`)
  } catch {
    throw new TerrainError('NETWORK', terrainErrorMessage('NETWORK'))
  }

  if (response.status === 429) {
    throw new TerrainError('RATE_LIMIT', terrainErrorMessage('RATE_LIMIT'))
  }

  if (!response.ok) {
    if (response.status === 404) {
      throw new TerrainError('OUT_OF_COVERAGE', terrainErrorMessage('OUT_OF_COVERAGE'))
    }
    throw new TerrainError(
      'API_ERROR',
      `${terrainErrorMessage('API_ERROR')} (${response.status})`,
    )
  }

  try {
    return await response.json()
  } catch {
    throw new TerrainError('API_ERROR', terrainErrorMessage('API_ERROR'))
  }
}

/** Altitude ponctuelle via elevation.json (zonly=true). */
export async function getPointElevation(
  lon: number,
  lat: number,
): Promise<number> {
  const entries = await fetchPointElevations([lon], [lat])
  return entries[0].z
}

export async function fetchPointElevations(
  lons: number[],
  lats: number[],
): Promise<IgnElevationEntry[]> {
  const params = buildPointElevationParams(lons, lats)
  const data = (await fetchIgnJson(IGN_ELEVATION_URL, params)) as IgnRawResponse
  return parsePointElevationResponse(data, lons, lats)
}

/** Profil terrain via elevationLine.json (zonly=false). */
export async function getElevationProfile(
  startLon: number,
  startLat: number,
  endLon: number,
  endLat: number,
  sampling: number,
  profileMode: ProfileMode = 'simple',
): Promise<IgnElevationEntry[]> {
  return fetchProfileAlongLine(
    [startLon, endLon],
    [startLat, endLat],
    sampling,
    profileMode,
  )
}

export async function fetchProfileAlongLine(
  lons: number[],
  lats: number[],
  sampling?: number,
  profileMode: ProfileMode = 'simple',
): Promise<IgnElevationEntry[]> {
  if (lons.length !== 2 || lats.length !== 2) {
    throw new TerrainError(
      'API_ERROR',
      'Un profil IGN requiert exactement un point de départ et un point d’arrivée.',
    )
  }

  const resolvedSampling = Math.min(
    IGN_MAX_SAMPLING_PER_REQUEST,
    Math.max(2, sampling ?? 2),
  )

  const params = buildProfileLineParams(
    lons[0],
    lats[0],
    lons[1],
    lats[1],
    resolvedSampling,
    profileMode,
  )

  const data = (await fetchIgnJson(
    IGN_ELEVATION_LINE_URL,
    params,
  )) as IgnRawResponse
  return parseProfileElevationResponse(data)
}

/**
 * Fetches an elevation profile along a pre-sampled line. Splits into consecutive
 * API segments when target point count exceeds IGN_MAX_SAMPLING_PER_REQUEST.
 */
export async function fetchProfileForSampledLine(
  line: LatLon[],
  profileMode: ProfileMode = 'simple',
): Promise<IgnElevationEntry[]> {
  if (line.length < 2) {
    throw new TerrainError(
      'API_ERROR',
      'Un profil IGN requiert au moins deux points.',
    )
  }

  const targetSampling = line.length

  if (targetSampling <= IGN_MAX_SAMPLING_PER_REQUEST) {
    return fetchProfileAlongLine(
      [line[0].lon, line[line.length - 1].lon],
      [line[0].lat, line[line.length - 1].lat],
      targetSampling,
      profileMode,
    )
  }

  const merged: IgnElevationEntry[] = []
  let startIdx = 0

  while (startIdx < line.length - 1) {
    const endIdx = Math.min(
      startIdx + IGN_MAX_SAMPLING_PER_REQUEST - 1,
      line.length - 1,
    )
    const chunkSampling = endIdx - startIdx + 1
    const chunk = await fetchProfileAlongLine(
      [line[startIdx].lon, line[endIdx].lon],
      [line[startIdx].lat, line[endIdx].lat],
      chunkSampling,
      profileMode,
    )

    if (chunk.length < 2) {
      throw new TerrainError(
        'OUT_OF_COVERAGE',
        terrainErrorMessage('OUT_OF_COVERAGE'),
      )
    }

    const slice =
      merged.length > 0 && chunk.length > 0 ? chunk.slice(1) : chunk
    merged.push(...slice)

    if (endIdx >= line.length - 1) {
      break
    }
    startIdx = endIdx
  }

  if (merged.length < 2) {
    throw new TerrainError('OUT_OF_COVERAGE', terrainErrorMessage('OUT_OF_COVERAGE'))
  }

  return merged
}

/** Reset throttle state — for tests only. */
export function resetIgnRequestThrottleForTests(): void {
  lastRequestAt = 0
}
