export {
  buildSampledLine,
  fetchTerrainProfile,
  getObserverElevation,
} from './terrainProfile'
export {
  fetchPointElevations,
  fetchProfileAlongLine,
  getPointElevation,
  getElevationProfile,
  isNoDataElevation,
  IGN_NO_DATA_Z,
  DEFAULT_ALTI_RESOURCE,
  IGN_ELEVATION_LINE_URL,
  IGN_ELEVATION_URL,
} from './ignAltimetryClient'
export { TerrainError, terrainErrorMessage, toTerrainError } from './terrainErrors'
export type { TerrainErrorCode } from './terrainErrors'
export { useTerrainDebug } from './hooks/useTerrainDebug'
export { TerrainDebugPanel } from './TerrainDebugPanel'
export type {
  ElevationPoint,
  FetchTerrainProfileParams,
  ObserverElevationResult,
  TerrainDataSource,
  TerrainProfileResult,
  TerrainProviderId,
} from './terrainTypes'
export {
  DEFAULT_MAX_DISTANCE_M,
  DEFAULT_STEP_M,
  MAX_PROFILE_POINTS,
} from './terrainTypes'
