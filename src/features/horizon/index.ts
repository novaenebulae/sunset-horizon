export type {
  ComputeCorrectedSunsetParams,
  CrossingBracket,
  GeoPoint,
  HorizonEngineOptions,
  HorizonProfile,
  SunsetResult,
  TerrainSample,
} from './horizonTypes'
export { DEFAULT_REFINE_STEP_MS } from './horizonTypes'
export { MIN_BLOCKING_DISTANCE_M } from './horizonTypes'
export {
  buildHorizonProfile,
  buildTerrainSamples,
  computeApparentAngleDeg,
  estimateUncertaintyMinutes,
  findBlockingSample,
  hasBlockingCandidates,
} from './horizonEngine'
export {
  computeCorrectedSunset,
  computeDeltaMinutes,
  findCrossingBracket,
  findTerrainSunsetCrossing,
  refineCrossingByBisection,
} from './crossing'
export { useHorizonSunset } from './hooks/useHorizonSunset'
export type { HorizonSunsetState, UseHorizonSunsetResult } from './hooks/useHorizonSunset'
