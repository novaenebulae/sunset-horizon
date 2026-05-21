import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  fetchPointElevations,
  fetchProfileAlongLine,
  getPointElevation,
  IGN_NO_DATA_Z,
  resetIgnRequestThrottleForTests,
} from './ignAltimetryClient'
import { TerrainError } from './terrainErrors'

const PROFILE_FIXTURE = {
  elevations: [
    { lon: 1.48, lat: 43.54, z: 164.34, acc: 'test' },
    { lon: 1.49, lat: 43.55, z: 141.33, acc: 'test' },
  ],
}

describe('ignAltimetryClient', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    resetIgnRequestThrottleForTests()
  })

  it('parses elevation.json zonly response with numeric elevations', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ elevations: [231.06] }),
      }),
    )

    const result = await fetchPointElevations([6.189897], [48.643098])
    expect(result).toHaveLength(1)
    expect(result[0].z).toBeCloseTo(231.06)
    expect(result[0].lon).toBeCloseTo(6.189897)
    expect(result[0].lat).toBeCloseTo(48.643098)
  })

  it('parses elevation.json response with object elevations', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ elevations: [{ z: 231.06 }] }),
      }),
    )

    const result = await getPointElevation(6.19, 48.64)
    expect(result).toBeCloseTo(231.06)
  })

  it('parses elevationLine.json profile with lon/lat/z objects', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => PROFILE_FIXTURE,
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await fetchProfileAlongLine([2.35, 2.4], [48.85, 48.9], 8)
    expect(result).toHaveLength(2)
    expect(result[0].z).toBeCloseTo(164.34)

    const url = fetchMock.mock.calls[0][0] as string
    expect(url).toContain('elevationLine.json')
    expect(url).toContain('zonly=false')
    expect(url).toContain('profile_mode=simple')
    expect(url).toContain('sampling=8')
  })

  it('throws EMPTY_RESPONSE when elevations array is empty', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ elevations: [] }),
      }),
    )

    await expect(fetchPointElevations([2.35], [48.85])).rejects.toMatchObject({
      code: 'EMPTY_RESPONSE',
    })
  })

  it('throws OUT_OF_COVERAGE for zonly numeric -99999', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ elevations: [IGN_NO_DATA_Z] }),
      }),
    )

    await expect(fetchPointElevations([2.35], [48.85])).rejects.toMatchObject({
      code: 'OUT_OF_COVERAGE',
    })
  })

  it('throws OUT_OF_COVERAGE when profile has only no-data points', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          elevations: [{ lon: 1, lat: 43, z: IGN_NO_DATA_Z }],
        }),
      }),
    )

    await expect(
      fetchProfileAlongLine([1, 2], [43, 44], 4),
    ).rejects.toMatchObject({
      code: 'OUT_OF_COVERAGE',
    })
  })

  it('truncates profile at first no-data point (coastal line into ocean)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          elevations: [
            { lon: -4.59668, lat: 48.063764, z: 79.76 },
            { lon: -4.60247, lat: 48.066204, z: 74.94 },
            { lon: -4.60827, lat: 48.068645, z: 71.01 },
            { lon: -4.61406, lat: 48.071085, z: 25.94 },
            { lon: -4.61986, lat: 48.073525, z: -99998.99 },
            { lon: -4.62565, lat: 48.075965, z: -99998.99 },
          ],
        }),
      }),
    )

    const result = await fetchProfileAlongLine([-4.6, -4.63], [48.06, 48.08], 6)
    expect(result).toHaveLength(4)
    expect(result.at(-1)?.z).toBeCloseTo(25.94)
    expect(result.every((p) => p.z > IGN_NO_DATA_Z)).toBe(true)
  })

  it('treats -99998.99 as no-data for point elevation', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ elevations: [-99998.99] }),
      }),
    )

    await expect(fetchPointElevations([2.35], [48.85])).rejects.toMatchObject({
      code: 'OUT_OF_COVERAGE',
    })
  })

  it('throws API_ERROR for invalid elevation response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({}),
      }),
    )

    await expect(fetchPointElevations([2.35], [48.85])).rejects.toMatchObject({
      code: 'EMPTY_RESPONSE',
    })
  })

  it('throws NETWORK on fetch failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))

    await expect(fetchPointElevations([2.35], [48.85])).rejects.toMatchObject({
      code: 'NETWORK',
    } satisfies Partial<TerrainError>)
  })

  it('rejects profile request with more than two endpoints', async () => {
    await expect(
      fetchProfileAlongLine([1, 2, 3], [43, 44, 45], 4),
    ).rejects.toMatchObject({
      code: 'API_ERROR',
    })
  })
})
