import { describe, expect, it, vi, afterEach } from 'vitest'
import {
  parseGeocodeResponse,
  searchAddresses,
  MIN_QUERY_LENGTH,
} from './geocodingClient'
import { GeocodingError } from './geocodingTypes'

const SAMPLE_RESPONSE = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [2.347, 48.859] },
      properties: {
        label: 'Paris',
        score: 0.97,
        city: 'Paris',
        postcode: '75001',
        type: 'municipality',
        id: '75056',
      },
    },
  ],
}

describe('geocodingClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('parses FeatureCollection into AddressSearchResult', () => {
    const results = parseGeocodeResponse(SAMPLE_RESPONSE)
    expect(results).toHaveLength(1)
    expect(results[0].label).toBe('Paris')
    expect(results[0].lat).toBe(48.859)
    expect(results[0].lon).toBe(2.347)
    expect(results[0].postcode).toBe('75001')
  })

  it('rejects query shorter than minimum length', async () => {
    await expect(searchAddresses('pa')).rejects.toMatchObject({
      code: 'EMPTY_QUERY',
    })
    expect(MIN_QUERY_LENGTH).toBe(3)
  })

  it('searchAddresses calls geoplateforme search endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => SAMPLE_RESPONSE,
    })
    vi.stubGlobal('fetch', fetchMock)

    const results = await searchAddresses('paris', { limit: 5 })
    expect(results[0].city).toBe('Paris')
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('data.geopf.fr/geocodage/search'),
    )
    expect(fetchMock.mock.calls[0][0]).toContain('q=paris')
    expect(fetchMock.mock.calls[0][0]).toContain('limit=5')
  })

  it('throws NO_RESULTS when features are empty', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ type: 'FeatureCollection', features: [] }),
      }),
    )

    await expect(searchAddresses('xyzunknown')).rejects.toMatchObject({
      code: 'NO_RESULTS',
    })
  })

  it('throws INVALID_RESPONSE for malformed payload', () => {
    expect(() => parseGeocodeResponse({ foo: 'bar' })).toThrow(GeocodingError)
  })
})
