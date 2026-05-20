export {
  getOfficialSunset,
  getSunPosition,
  getSunsetAzimuthDeg,
  sampleAroundOfficialSunset,
  SUNSET_WINDOW_AFTER_MS,
  SUNSET_WINDOW_BEFORE_MS,
  DEFAULT_SAMPLE_STEP_MS,
} from './solarService'
export { applyRefraction, refractionCorrectionDeg } from './refraction'
export { useSolarData } from './hooks/useSolarData'
export type { SolarDataResult } from './hooks/useSolarData'
export type {
  OfficialSunsetResult,
  SolarServiceOptions,
  SolarWindowOptions,
  SunPosition,
  SunsetSample,
} from './types'
