export function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180
}

export function radToDeg(radians: number): number {
  return (radians * 180) / Math.PI
}

/** Normalise an angle to [0, 360). */
export function normalizeDegrees(degrees: number): number {
  const normalized = degrees % 360
  return normalized < 0 ? normalized + 360 : normalized
}
