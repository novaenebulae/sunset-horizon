/** IndexedDB database for terrain profile cache only. */
export const TERRAIN_PROFILE_CACHE_DB_NAME = 'sunset-horizon-terrain-cache'
export const TERRAIN_PROFILE_CACHE_STORE_NAME = 'terrainProfiles'

/** 30 days — long TTL per V1.5 spec. */
export const TERRAIN_PROFILE_CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000

export const CACHE_KEY_PREFIX = 'terrain:v1'

/**
 * Target reuse distance (~50 m) between observer positions for map clicks.
 * Internal snap period is 4× this (200 m lattice) so round() reaches ~50 m, not ~30 m.
 */
export const CACHE_KEY_POSITION_GRID_M = 50

/** WGS84 approximate meters per degree of latitude. */
export const CACHE_KEY_METERS_PER_DEGREE_LAT = 111_320

/** 0.1° precision for sunset azimuth. */
export const CACHE_KEY_AZIMUTH_DECIMALS = 1
