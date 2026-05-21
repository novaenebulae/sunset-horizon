export type TerrainErrorCode =
  | 'NETWORK'
  | 'RATE_LIMIT'
  | 'EMPTY_RESPONSE'
  | 'API_ERROR'
  | 'OUT_OF_COVERAGE'

export class TerrainError extends Error {
  readonly code: TerrainErrorCode

  constructor(code: TerrainErrorCode, message: string) {
    super(message)
    this.name = 'TerrainError'
    this.code = code
  }
}

export function terrainErrorMessage(code: TerrainErrorCode): string {
  switch (code) {
    case 'NETWORK':
      return 'Impossible de joindre le service altimétrique IGN. Vérifie ta connexion ou utilise le mode mock.'
    case 'RATE_LIMIT':
      return 'Trop de requêtes vers l’API IGN. Réessaie dans quelques secondes.'
    case 'EMPTY_RESPONSE':
      return 'Réponse altimétrique vide pour ce point ou ce profil.'
    case 'OUT_OF_COVERAGE':
      return 'Point hors couverture des données IGN pour cette ressource.'
    case 'API_ERROR':
    default:
      return 'Erreur du service altimétrique IGN.'
  }
}

export function toTerrainError(error: unknown): TerrainError {
  if (error instanceof TerrainError) {
    return error
  }
  if (error instanceof Error) {
    return new TerrainError('API_ERROR', error.message)
  }
  return new TerrainError('API_ERROR', terrainErrorMessage('API_ERROR'))
}
