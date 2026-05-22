import { useCallback, useEffect, useState } from 'react'
import { getPresetSettings } from './defaultCalculationSettings'
import {
  isLocalStorageAvailable,
  loadCalculationSettings,
  saveCalculationSettings,
} from './calculationSettingsStorage'
import { validateCalculationSettings } from './calculationSettingsValidation'
import {
  SettingsStorageError,
  type CalculationSettings,
  type PrecisionMode,
} from './calculationSettingsTypes'

export function useCalculationSettings() {
  const [settings, setSettings] = useState<CalculationSettings>(() =>
    loadCalculationSettings(),
  )
  const [storageAvailable, setStorageAvailable] = useState(
    isLocalStorageAvailable(),
  )
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setStorageAvailable(isLocalStorageAvailable())
    setSettings(loadCalculationSettings())
  }, [])

  const persist = useCallback((next: CalculationSettings) => {
    const validated = validateCalculationSettings(next)
    setSettings(validated)
    if (!isLocalStorageAvailable()) {
      setError('Le stockage local du navigateur est indisponible.')
      return
    }
    try {
      saveCalculationSettings(validated)
      setError(null)
    } catch (err) {
      setError(
        err instanceof SettingsStorageError
          ? err.message
          : 'Impossible d\'enregistrer les réglages.',
      )
    }
  }, [])

  const setPrecisionMode = useCallback(
    (mode: PrecisionMode) => {
      persist(getPresetSettings(mode))
    },
    [persist],
  )

  const setRefractionEnabled = useCallback(
    (enabled: boolean) => {
      persist({ ...settings, refractionEnabled: enabled })
    },
    [persist, settings],
  )

  const setTerrainDebugEnabled = useCallback(
    (enabled: boolean) => {
      persist({ ...settings, terrainDebugEnabled: enabled })
    },
    [persist, settings],
  )

  const setTerrainCachePanelEnabled = useCallback(
    (enabled: boolean) => {
      persist({ ...settings, terrainCachePanelEnabled: enabled })
    },
    [persist, settings],
  )

  const resetSettings = useCallback(() => {
    persist(getPresetSettings('balanced'))
  }, [persist])

  const dismissError = useCallback(() => setError(null), [])

  return {
    settings,
    storageAvailable,
    error,
    setPrecisionMode,
    setRefractionEnabled,
    setTerrainDebugEnabled,
    setTerrainCachePanelEnabled,
    resetSettings,
    dismissError,
  }
}
