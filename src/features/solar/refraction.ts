/**
 * Approximate atmospheric refraction correction (degrees).
 * Not a meteorological model — suitable for sunset horizon comparisons.
 * At the geometric horizon (~0°), correction is about 0.57°.
 */
const HORIZON_REFRACTION_DEG = 0.57

/**
 * Returns the refraction correction in degrees to add to geometric altitude.
 * Attenuates below the horizon to avoid unrealistic values.
 */
export function refractionCorrectionDeg(altitudeDeg: number): number {
  if (altitudeDeg < -2) {
    return 0
  }
  if (altitudeDeg > 15) {
    return 0.02
  }

  const horizonFactor = Math.max(0, 1 - altitudeDeg / 15)
  return HORIZON_REFRACTION_DEG * horizonFactor
}

export function applyRefraction(
  altitudeDeg: number,
  enabled: boolean,
): number {
  if (!enabled) {
    return altitudeDeg
  }
  return altitudeDeg + refractionCorrectionDeg(altitudeDeg)
}
