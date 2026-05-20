export type GeoPoint = {
  lat: number
  lon: number
  elevation?: number
}

export type TerrainSample = {
  point: GeoPoint
  distanceM: number
  elevationM: number
  apparentAngleDeg: number
}

export type HorizonProfile = {
  observer: GeoPoint
  azimuthDeg: number
  samples: TerrainSample[]
  blockingSample: TerrainSample | null
  horizonAngleDeg: number
  source: 'ign-geoplateforme' | 'mock' | 'fallback'
}

export type SunsetResult = {
  officialSunset: Date
  terrainSunset: Date | null
  deltaMinutes: number | null
  sunsetAzimuthDeg: number
  horizonProfile: HorizonProfile
  uncertaintyMinutes: number
  warnings: string[]
}
