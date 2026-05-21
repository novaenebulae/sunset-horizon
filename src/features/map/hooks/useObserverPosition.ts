import { useCallback, useState } from 'react'
import {
  requestCurrentPosition,
  type GeolocationFailure,
} from '../geolocationService'
import type { ObserverPosition, ObserverState } from '../types'

export function useObserverPosition() {
  const [state, setState] = useState<ObserverState>({ status: 'idle' })

  const requestGps = useCallback(async () => {
    setState({ status: 'loading', source: 'gps' })

    try {
      const result = await requestCurrentPosition()
      const position: ObserverPosition = {
        lat: result.lat,
        lon: result.lon,
        accuracyM: result.accuracyM,
        source: 'gps',
        updatedAt: new Date(),
      }
      setState({ status: 'ready', position })
    } catch (error) {
      const failure = error as GeolocationFailure
      setState({
        status: 'error',
        code: failure.code,
        message: failure.message,
      })
    }
  }, [])

  const setManualPosition = useCallback((lat: number, lon: number) => {
    const position: ObserverPosition = {
      lat,
      lon,
      accuracyM: null,
      source: 'manual',
      updatedAt: new Date(),
    }
    setState({ status: 'ready', position })
  }, [])

  const setAddressPosition = useCallback((lat: number, lon: number) => {
    const position: ObserverPosition = {
      lat,
      lon,
      accuracyM: null,
      source: 'address',
      updatedAt: new Date(),
    }
    setState({ status: 'ready', position })
  }, [])

  const clearError = useCallback(() => {
    setState((current) =>
      current.status === 'error' ? { status: 'idle' } : current,
    )
  }, [])

  const position =
    state.status === 'ready' ? state.position : null

  return {
    state,
    position,
    requestGps,
    setManualPosition,
    setAddressPosition,
    clearError,
    isLoading: state.status === 'loading',
  }
}
