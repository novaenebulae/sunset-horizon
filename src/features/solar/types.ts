export type SunPosition = {
  altitudeDeg: number
  azimuthDeg: number
}

export type OfficialSunsetResult = {
  at: Date
}

export type SunsetSample = {
  at: Date
  altitudeDeg: number
  azimuthDeg: number
}

export type SolarServiceOptions = {
  applyRefraction?: boolean
}

export type SolarWindowOptions = SolarServiceOptions & {
  stepMs?: number
  windowBeforeMs?: number
  windowAfterMs?: number
}
