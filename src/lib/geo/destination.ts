import { degToRad, normalizeDegrees, radToDeg } from './angles'
import { EARTH_RADIUS_M, type LatLon } from './types'

export function destinationPoint(
  origin: LatLon,
  bearingDeg: number,
  distanceM: number,
): LatLon {
  const angularDistance = distanceM / EARTH_RADIUS_M
  const bearing = degToRad(normalizeDegrees(bearingDeg))
  const lat1 = degToRad(origin.lat)
  const lon1 = degToRad(origin.lon)

  const sinLat1 = Math.sin(lat1)
  const cosLat1 = Math.cos(lat1)
  const sinAd = Math.sin(angularDistance)
  const cosAd = Math.cos(angularDistance)

  const lat2 = Math.asin(
    sinLat1 * cosAd + cosLat1 * sinAd * Math.cos(bearing),
  )
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(bearing) * sinAd * cosLat1,
      cosAd - sinLat1 * Math.sin(lat2),
    )

  return {
    lat: radToDeg(lat2),
    lon: radToDeg(lon2),
  }
}

export function initialBearingDeg(from: LatLon, to: LatLon): number {
  const lat1 = degToRad(from.lat)
  const lat2 = degToRad(to.lat)
  const dLon = degToRad(to.lon - from.lon)

  const y = Math.sin(dLon) * Math.cos(lat2)
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon)

  return normalizeDegrees(radToDeg(Math.atan2(y, x)))
}
