// TODO VERIFY IGN API CONTRACT — endpoints and query params per official doc:
// https://geoservices.ign.fr/node/1439

import { TerrainError, terrainErrorMessage } from './terrainErrors'

export const IGN_ELEVATION_URL =
  'https://data.geopf.fr/altimetrie/1.0/calcul/alti/rest/elevation.json'

export const IGN_ELEVATION_LINE_URL =
  'https://data.geopf.fr/altimetrie/1.0/calcul/alti/rest/elevationLine.json'

export const DEFAULT_ALTI_RESOURCE = 'ign_rge_alti_wld'
export const IGN_DELIMITER = '|'
export const IGN_NO_DATA_Z = -99999

const MIN_REQUEST_INTERVAL_MS = 250

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
  return z === IGN_NO_DATA_Z
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

    assertNoDataElevation(z)
    points.push({ lon, lat, z })
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

  const params = buildProfileLineParams(
    lons[0],
    lats[0],
    lons[1],
    lats[1],
    sampling ?? 2,
    profileMode,
  )

  const data = (await fetchIgnJson(
    IGN_ELEVATION_LINE_URL,
    params,
  )) as IgnRawResponse
  return parseProfileElevationResponse(data)
}

/** Reset throttle state — for tests only. */
export function resetIgnRequestThrottleForTests(): void {
  lastRequestAt = 0
}
