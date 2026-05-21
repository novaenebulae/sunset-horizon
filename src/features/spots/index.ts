export type {
  SavedSpot,
  SavedSpotComputedResult,
  SavedSpotsStoragePayload,
  SaveSpotInput,
  UpdateSpotPatch,
  SpotStorageErrorCode,
} from './spotTypes'
export { SpotStorageError } from './spotTypes'
export { spotComputedSnapshotFromResult } from './spotComputedSnapshot'
export {
  buildDefaultSpotName,
  clearSavedSpots,
  getSavedSpots,
  isLocalStorageAvailable,
  migrateStoragePayload,
  readStoragePayload,
  removeSpot,
  saveSpot,
  updateSpot,
  writeStoragePayload,
} from './spotStorage'
export { SavedSpotsSection } from './SavedSpotsSection'
export { useSavedSpots } from './hooks/useSavedSpots'
