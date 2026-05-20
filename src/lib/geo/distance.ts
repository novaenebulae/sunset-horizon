import { degToRad } from './angles'
import { EARTH_RADIUS_M, type LatLon } from './types'

export function haversineDistanceM(a: LatLon, b: LatLon): number {
  const lat1 = degToRad(a.lat)
  const lat2 = degToRad(b.lat)
  const dLat = degToRad(b.lat - a.lat)
  const dLon = degToRad(b.lon - a.lon)

  const sinDLat = Math.sin(dLat / 2)
  const sinDLon = Math.sin(dLon / 2)
  const h =
    sinDLat * sinDLat +
    Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon

  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)))
}
