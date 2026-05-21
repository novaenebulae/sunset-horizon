# Prompt Cursor — 08G V1.5 Panneau diagnostic du calcul

Nouveau prompt V1.5.

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

Ajouter un panneau diagnostic repliable pour expliquer les détails techniques du dernier calcul sans surcharger l’interface principale.

## Fonctionnalités attendues

### 1. Modèle diagnostic

Créer :

```ts
export type CalculationDiagnostic = {
  computedAt: string
  durationMs: number | null
  precisionMode: PrecisionMode
  maxDistanceM: number
  sampleStepM: number
  timeStepSeconds: number
  refinementStepSeconds: number
  refractionEnabled: boolean
  terrainSampleCount: number | null
  azimuthDeg: number | null
  horizonAngleDeg: number | null
  blockingDistanceM: number | null
  blockingElevationM: number | null
  terrainSource: string | null
  cacheStatus: 'hit' | 'miss' | 'disabled' | 'error' | 'unknown'
  warnings: string[]
  errors: string[]
}
```

### 2. Collecte

Remonter les informations depuis solaire, terrain, horizon, cache et settings. Ne pas refaire les calculs uniquement pour le diagnostic.

### 3. Temps de calcul

Mesurer au minimum la durée totale.

### 4. UI

Panneau fermé par défaut : `Détails du calcul`.

Afficher mode, distance max, pas, nombre d’échantillons, azimut, angle horizon, point bloquant, source, cache, durée, warnings et erreurs.

### 5. États

Gérer aucun calcul, succès, partiel, erreur, cache indisponible.

## Architecture attendue

Créer :

```txt
src/features/diagnostics/
  diagnosticTypes.ts
  diagnosticUtils.ts
  CalculationDiagnosticPanel.tsx
  diagnosticUtils.test.ts
```

Compléter si nécessaire `results`, `terrain`, `horizon`, `cache`.

## Contraintes spécifiques

- Ne pas relancer un calcul pour produire le diagnostic.
- Ne pas afficher de stack trace.
- Ne pas bloquer le calcul si le diagnostic est incomplet.
- Prévoir “Non disponible” plutôt que crasher.

## Tests attendus

Ajouter des tests pour : formatage distance, angle, durée, diagnostic minimal, diagnostic complet, valeurs nulles.

## Validation manuelle

1. Lancer un calcul.
2. Ouvrir le diagnostic.
3. Vérifier settings, azimut, angle, point bloquant.
4. Relancer avec cache hit.
5. Provoquer une erreur terrain.
6. Tester mobile et desktop.

## Commandes finales

```bash
npm test
npm run build
```
