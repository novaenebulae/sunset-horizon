import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  geolocationErrorMessage,
  requestCurrentPosition,
} from './geolocationService'

describe('geolocationService', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('maps PERMISSION_DENIED to a user-facing message', () => {
    expect(geolocationErrorMessage('PERMISSION_DENIED')).toContain('Autorisation refusée')
  })

  it('resolves with coordinates on success', async () => {
    const mockPosition = {
      coords: {
        latitude: 48.8566,
        longitude: 2.3522,
        accuracy: 12,
      },
    }

    vi.stubGlobal('navigator', {
      geolocation: {
        getCurrentPosition: (
          success: PositionCallback,
        ) => success(mockPosition as GeolocationPosition),
      },
    })

    const result = await requestCurrentPosition()
    expect(result.lat).toBeCloseTo(48.8566)
    expect(result.lon).toBeCloseTo(2.3522)
    expect(result.accuracyM).toBe(12)
  })

  it('rejects with PERMISSION_DENIED on error', async () => {
    const error = {
      code: 1,
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
      message: 'denied',
    }

    vi.stubGlobal('navigator', {
      geolocation: {
        getCurrentPosition: (
          _success: PositionCallback,
          fail: PositionErrorCallback,
        ) => fail(error as GeolocationPositionError),
      },
    })

    await expect(requestCurrentPosition()).rejects.toMatchObject({
      code: 'PERMISSION_DENIED',
    })
  })

  it('rejects when geolocation is unsupported', async () => {
    vi.stubGlobal('navigator', {})

    await expect(requestCurrentPosition()).rejects.toMatchObject({
      code: 'UNSUPPORTED',
    })
  })
})
