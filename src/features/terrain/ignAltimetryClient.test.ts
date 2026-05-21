import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  fetchPointElevations,
  fetchProfileAlongLine,
  fetchProfileForSampledLine,
  getPointElevation,
  IGN_MAX_SAMPLING_PER_REQUEST,
  IGN_NO_DATA_SEA_LEVEL_Z,
  IGN_INVALID_ELEVATION_THRESHOLD_Z,
  IGN_NO_DATA_Z,
  isNoDataElevation,
  resolveProfileElevationEntries,
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

  it('maps no-data to sea level when valid elevations follow (coast–sea–coast)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          elevations: [
            { lon: -4.408159, lat: 48.37577, z: 23.29 },
            { lon: -4.409874675, lat: 48.376494365, z: 7.16 },
            { lon: -4.420168725, lat: 48.380840555, z: IGN_NO_DATA_Z },
            { lon: -4.4218844, lat: 48.38156492, z: IGN_NO_DATA_Z },
            { lon: -4.423600075, lat: 48.382289285, z: IGN_NO_DATA_Z },
            { lon: -4.44590385, lat: 48.39170603, z: 7 },
            { lon: -4.447619525, lat: 48.392430395, z: 6.99 },
          ],
        }),
      }),
    )

    const result = await fetchProfileAlongLine([-4.41, -4.45], [48.38, 48.39], 7)
    expect(result).toHaveLength(7)
    expect(result[0].z).toBeCloseTo(23.29)
    expect(result[2].z).toBe(IGN_NO_DATA_SEA_LEVEL_Z)
    expect(result[3].z).toBe(IGN_NO_DATA_SEA_LEVEL_Z)
    expect(result[4].z).toBe(IGN_NO_DATA_SEA_LEVEL_Z)
    expect(result[5].z).toBeCloseTo(7)
    expect(result[6].z).toBeCloseTo(6.99)
  })

  it('treats IGN pseudo-invalid elevations below -300 m as no-data', () => {
    expect(isNoDataElevation(IGN_NO_DATA_Z)).toBe(true)
    expect(isNoDataElevation(-99998.99)).toBe(true)
    expect(isNoDataElevation(-9952)).toBe(true)
    expect(isNoDataElevation(-6503)).toBe(true)
    expect(isNoDataElevation(-300)).toBe(true)
    expect(isNoDataElevation(-299)).toBe(false)
    expect(isNoDataElevation(-50)).toBe(false)
    expect(isNoDataElevation(100)).toBe(false)
  })

  it('maps pseudo-invalid mid-profile values to sea level', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          elevations: [
            { lon: 1, lat: 48, z: 15 },
            { lon: 2, lat: 48, z: -9952 },
            { lon: 3, lat: 48, z: -6503 },
            { lon: 4, lat: 48, z: 12 },
          ],
        }),
      }),
    )

    const result = await fetchProfileAlongLine([1, 4], [48, 48], 4)
    expect(result).toHaveLength(4)
    expect(result[1].z).toBe(IGN_NO_DATA_SEA_LEVEL_Z)
    expect(result[2].z).toBe(IGN_NO_DATA_SEA_LEVEL_Z)
    expect(result[3].z).toBeCloseTo(12)
  })

  it('throws OUT_OF_COVERAGE for point elevation below threshold', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ elevations: [-6503] }),
      }),
    )

    await expect(fetchPointElevations([2.35], [48.85])).rejects.toMatchObject({
      code: 'OUT_OF_COVERAGE',
    })
  })

  it('resolveProfileElevationEntries maps mid-profile gaps to 0 m', () => {
    const resolved = resolveProfileElevationEntries([
      { lon: 1, lat: 48, z: 10 },
      { lon: 2, lat: 48, z: IGN_NO_DATA_Z },
      { lon: 3, lat: 48, z: 20 },
    ])
    expect(resolved).toHaveLength(3)
    expect(resolved[1].z).toBe(0)
  })

  it('resolveProfileElevationEntries truncates trailing no-data only', () => {
    const resolved = resolveProfileElevationEntries([
      { lon: 1, lat: 48, z: 10 },
      { lon: 2, lat: 48, z: IGN_NO_DATA_Z },
      { lon: 3, lat: 48, z: IGN_NO_DATA_Z },
    ])
    expect(resolved).toHaveLength(1)
    expect(resolved[0].z).toBe(10)
  })

  it('truncates profile at first trailing no-data (coastal line into ocean)', async () => {
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
    expect(
      result.every((p) => p.z > IGN_INVALID_ELEVATION_THRESHOLD_Z),
    ).toBe(true)
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

  it('caps single-request sampling at IGN maximum (5000)', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => PROFILE_FIXTURE,
    })
    vi.stubGlobal('fetch', fetchMock)

    await fetchProfileAlongLine([2.35, 2.4], [48.85, 48.9], 9000)

    const url = fetchMock.mock.calls[0][0] as string
    expect(url).toContain(`sampling=${IGN_MAX_SAMPLING_PER_REQUEST}`)
  })

  it('splits long sampled lines into multiple API requests', async () => {
    let callIndex = 0
    const fetchMock = vi.fn().mockImplementation(async () => {
      callIndex += 1
      const count = callIndex === 1 ? 5000 : 500
      const elevations = Array.from({ length: count }, (_, i) => ({
        lon: 2.35 + i * 0.0001,
        lat: 48.85 + i * 0.0001,
        z: 100 + i,
      }))
      return {
        ok: true,
        status: 200,
        json: async () => ({ elevations }),
      }
    })
    vi.stubGlobal('fetch', fetchMock)

    const line = Array.from({ length: 5500 }, (_, i) => ({
      lat: 48.85 + i * 0.00001,
      lon: 2.35 + i * 0.00001,
    }))

    const result = await fetchProfileForSampledLine(line)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(result.length).toBeGreaterThan(5000)
  })
})
