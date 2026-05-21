export type {
  CalculationHistoryEntry,
  CalculationHistoryStoragePayload,
  AddHistoryEntryInput,
  HistoryStorageErrorCode,
} from './calculationHistoryTypes'
export {
  CALCULATION_HISTORY_STORAGE_KEY,
  HistoryStorageError,
  MAX_HISTORY_ENTRIES_PER_SPOT,
} from './calculationHistoryTypes'
export { buildHistoryEntryFromResult } from './calculationHistoryFromResult'
export type { BuildHistoryEntryParams } from './calculationHistoryFromResult'
export {
  addHistoryEntry,
  addHistoryEntryFromResult,
  clearHistoryForSpot,
  clearOrphanEntries,
  getHistoryEntries,
  getHistoryForSpot,
  isHistoryStorageAvailable,
  migrateHistoryPayload,
  readHistoryPayload,
  removeHistoryEntry,
} from './calculationHistoryStorage'
export { CalculationHistoryItem } from './CalculationHistoryItem'
export { CalculationHistoryList } from './CalculationHistoryList'
export { useCalculationHistory } from './useCalculationHistory'
export type { SaveResultToSpotParams } from './useCalculationHistory'
