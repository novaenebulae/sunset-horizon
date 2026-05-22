import {
  DEFAULT_CALCULATION_SETTINGS,
  getPresetSettings,
} from './defaultCalculationSettings'
import type {
  CalculationSettings,
  PrecisionMode,
} from './calculationSettingsTypes'

const MIN_MAX_DISTANCE_M = 1_000
const MAX_MAX_DISTANCE_M = 80_000
const MIN_SAMPLE_STEP_M = 25
const MAX_SAMPLE_STEP_M = 1_000
const MIN_TIME_STEP_SECONDS = 10
const MAX_TIME_STEP_SECONDS = 300
const MIN_REFINEMENT_STEP_SECONDS = 5
const MAX_REFINEMENT_STEP_SECONDS = 120

const PRECISION_MODES: PrecisionMode[] = ['fast', 'balanced', 'precise']

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function isPrecisionMode(value: unknown): value is PrecisionMode {
  return (
    typeof value === 'string' &&
    PRECISION_MODES.includes(value as PrecisionMode)
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function parseNumber(
  value: unknown,
  min: number,
  max: number,
  fallback: number,
): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback
  }
  return clamp(value, min, max)
}

function parseBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === 'boolean') {
    return value
  }
  return fallback
}

export function validateCalculationSettings(
  input: unknown,
): CalculationSettings {
  if (!isRecord(input)) {
    return { ...DEFAULT_CALCULATION_SETTINGS }
  }

  const mode = isPrecisionMode(input.precisionMode)
    ? input.precisionMode
    : DEFAULT_CALCULATION_SETTINGS.precisionMode

  const preset = getPresetSettings(mode)

  let maxDistanceM = parseNumber(
    input.maxDistanceM,
    MIN_MAX_DISTANCE_M,
    MAX_MAX_DISTANCE_M,
    preset.maxDistanceM,
  )
  let sampleStepM = parseNumber(
    input.sampleStepM,
    MIN_SAMPLE_STEP_M,
    MAX_SAMPLE_STEP_M,
    preset.sampleStepM,
  )
  let timeStepSeconds = parseNumber(
    input.timeStepSeconds,
    MIN_TIME_STEP_SECONDS,
    MAX_TIME_STEP_SECONDS,
    preset.timeStepSeconds,
  )
  let refinementStepSeconds = parseNumber(
    input.refinementStepSeconds,
    MIN_REFINEMENT_STEP_SECONDS,
    MAX_REFINEMENT_STEP_SECONDS,
    preset.refinementStepSeconds,
  )

  if (refinementStepSeconds > timeStepSeconds) {
    refinementStepSeconds = Math.min(
      refinementStepSeconds,
      timeStepSeconds,
    )
  }

  const refractionEnabled = parseBoolean(
    input.refractionEnabled,
    preset.refractionEnabled,
  )
  const terrainDebugEnabled = parseBoolean(
    input.terrainDebugEnabled,
    false,
  )
  const terrainCachePanelEnabled = parseBoolean(
    input.terrainCachePanelEnabled,
    false,
  )

  return {
    precisionMode: mode,
    maxDistanceM,
    sampleStepM,
    timeStepSeconds,
    refinementStepSeconds,
    refractionEnabled,
    terrainDebugEnabled,
    terrainCachePanelEnabled,
  }
}
