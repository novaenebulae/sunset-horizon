import { DEFAULT_MAX_DISTANCE_M, DEFAULT_STEP_M } from '@/features/terrain/terrainTypes'
import type { HorizonEngineOptions } from '@/features/horizon/horizonTypes'
import type { CalculationSettings, PrecisionMode } from './calculationSettingsTypes'

/** MVP defaults: aligned with terrain/solar/horizon constants. */
export const CALCULATION_SETTINGS_PRESETS: Record<
  PrecisionMode,
  CalculationSettings
> = {
  fast: {
    precisionMode: 'fast',
    maxDistanceM: 15_000,
    sampleStepM: 300,
    timeStepSeconds: 30,
    refinementStepSeconds: 30,
    refractionEnabled: true,
  },
  balanced: {
    precisionMode: 'balanced',
    maxDistanceM: DEFAULT_MAX_DISTANCE_M,
    sampleStepM: DEFAULT_STEP_M,
    timeStepSeconds: 15,
    refinementStepSeconds: 15,
    refractionEnabled: true,
  },
  precise: {
    precisionMode: 'precise',
    maxDistanceM: DEFAULT_MAX_DISTANCE_M,
    sampleStepM: 50,
    timeStepSeconds: 1,
    refinementStepSeconds: 5,
    refractionEnabled: true,
  },
}

export const DEFAULT_CALCULATION_SETTINGS: CalculationSettings =
  CALCULATION_SETTINGS_PRESETS.balanced

export function getPresetSettings(mode: PrecisionMode): CalculationSettings {
  return { ...CALCULATION_SETTINGS_PRESETS[mode] }
}

export function settingsToHorizonOptions(
  settings: CalculationSettings,
): HorizonEngineOptions {
  return {
    applyRefraction: settings.refractionEnabled,
    stepMs: settings.timeStepSeconds * 1000,
    refineStepMs: settings.refinementStepSeconds * 1000,
  }
}

export function settingsToTerrainParams(settings: CalculationSettings): {
  maxDistanceM: number
  stepM: number
} {
  return {
    maxDistanceM: settings.maxDistanceM,
    stepM: settings.sampleStepM,
  }
}
