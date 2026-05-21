# Prompt Cursor — 08C V1.5 Cache local IndexedDB des profils terrain

Lis avant de modifier le code :

- AGENTS.md
- README.md
- docs/01_FUNCTIONAL_SPEC.md
- docs/02_ARCHITECTURE.md
- docs/03_ALGORITHM.md
- docs/04_DATA_SOURCES.md
- docs/05_UX_UI.md
- docs/06_DESIGN_SYSTEM.md
- docs/07_ROADMAP.md
- docs/08_TEST_PLAN.md
- docs/09_CURSOR_WORKFLOW.md

Règles générales :

- Ne pas ajouter de backend.
- Ne pas ajouter Supabase.
- Ne pas ajouter d’authentification.
- Ne pas ajouter de synchronisation cloud.
- Préserver le fonctionnement complet du MVP existant.
- Garder une architecture par feature.
- Garder les tests proches des fichiers testés.
- Ne pas déplacer les fichiers existants sauf nécessité justifiée.
- Ne pas dupliquer la logique métier existante.
- Ne pas faire de calcul lourd directement dans les composants React.
- Utiliser TypeScript strictement.
- Garder l’UI mobile-first, puis responsive desktop.
- Avant de coder : analyser l’existant, proposer un plan court, lister les fichiers créés/modifiés, attendre validation.
- Après implémentation : lancer `npm test` si disponible, lancer `npm run build`, résumer les modifications et les risques restants.

## Objectif

Ajouter un cache local IndexedDB pour éviter de récupérer ou recalculer inutilement les mêmes profils terrain. Le cache doit être transparent et non bloquant.

## Fonctionnalités attendues

### 1. Cache IndexedDB

Stocker les profils terrain normalisés avec : observateur, azimut, distance max, pas, source, samples, date de création, version cache, version algorithme.

### 2. Clé de cache stable

Créer :

```ts
buildTerrainProfileCacheKey(input: TerrainProfileCacheKeyInput): string
```

La clé doit inclure : latitude/longitude arrondies, azimut arrondi, distance max, pas, provider, version d’algorithme.

Exemple :

```txt
terrain:v1:ign:lat=48.64310:lon=6.18990:az=246.0:max=30000:step=100
```

### 3. TTL

Prévoir une validité longue, par exemple 30 jours.

### 4. API

Créer :

```ts
getCachedTerrainProfile(key)
setCachedTerrainProfile(key, profile)
deleteCachedTerrainProfile(key)
clearTerrainProfileCache()
getTerrainProfileCacheStats()
```

### 5. Intégration terrain

Le terrain provider tente cache → API IGN/provider → stockage cache. Si le cache échoue, le calcul continue.

### 6. UI minimale

Ajouter un bouton “Vider le cache terrain” et afficher nombre d’entrées / taille approximative si possible.

## Architecture attendue

Créer :

```txt
src/features/cache/
  cacheTypes.ts
  cacheKey.ts
  terrainProfileCache.ts
  cacheSettings.ts
  useTerrainProfileCacheStats.ts
  CacheSettingsPanel.tsx
  terrainProfileCache.test.ts
  cacheKey.test.ts
```

## Contraintes spécifiques

- IndexedDB uniquement pour les profils terrain.
- Le cache n’est pas une source de vérité.
- Ne jamais empêcher le calcul si le cache échoue.
- Ne pas exporter le cache JSON en V1.5.
- Ne pas accéder à IndexedDB directement depuis les composants.

## Tests attendus

Ajouter des tests pour : clé identique si paramètres identiques, clé différente si azimut/distance/pas changent, cache miss, cache hit, clear cache, erreur IndexedDB simulée si possible.

## Validation manuelle

1. Lancer un calcul.
2. Relancer le même calcul et vérifier le cache hit si visible.
3. Changer le mode de précision et vérifier une nouvelle clé.
4. Vider le cache.
5. Vérifier que l’application fonctionne sans IndexedDB.

## Commandes finales

```bash
npm test
npm run build
```

