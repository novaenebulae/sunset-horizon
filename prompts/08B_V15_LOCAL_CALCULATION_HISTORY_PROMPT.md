# Prompt Cursor — 08B V1.5 Historique local des calculs

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

Ajouter un historique local des calculs afin de conserver les derniers résultats obtenus pour chaque spot sauvegardé. L’historique doit préparer les futures analyses sans ajouter de backend.

## Fonctionnalités attendues

### 1. Modèle de données

Créer un type :

```ts
export type CalculationHistoryEntry = {
  id: string
  spotId: string
  observationDate: string
  computedAt: string
  officialSunsetIso: string
  terrainSunsetIso: string | null
  deltaMinutes: number | null
  sunsetAzimuthDeg: number
  horizonAngleDeg: number | null
  blockingDistanceM: number | null
  blockingElevationM: number | null
  terrainSource: string
  uncertaintyMinutes: number | null
  warnings: string[]
  settingsSnapshot: CalculationSettings
}
```

Adapter les champs aux types existants.

### 2. Stockage

Stocker les historiques dans une clé séparée recommandée :

```txt
sunset-horizon:calculation-history:v1
```

### 3. Sauvegarde

Ajouter une action : `Enregistrer ce résultat dans l’historique du spot`.

### 4. Limitation

Limiter à 20 entrées par spot par défaut.

### 5. Affichage

Afficher les dernières entrées : date, heure officielle, heure corrigée, delta, mode utilisé, warnings.

### 6. Suppression

Permettre de supprimer une entrée ou tout l’historique d’un spot sans supprimer le spot.

## Architecture attendue

Créer ou compléter :

```txt
src/features/history/
  calculationHistoryTypes.ts
  calculationHistoryStorage.ts
  useCalculationHistory.ts
  CalculationHistoryList.tsx
  CalculationHistoryItem.tsx
  calculationHistory.test.ts
```

Si le projet préfère `src/features/spots/`, conserver une séparation claire.

## Contraintes spécifiques

- localStorage uniquement pour cette étape.
- Ne pas stocker les profils terrain complets dans l’historique.
- Ne pas stocker les données de cache.
- Ne pas recalculer automatiquement l’historique.
- Les données invalides ne doivent pas casser l’application.
- Enregistrer le snapshot des réglages utilisés.

## Tests attendus

Ajouter des tests pour : ajout, récupération par spot, limitation à 20 entrées, suppression d’une entrée, suppression de l’historique d’un spot, localStorage corrompu, localStorage indisponible.

## Validation manuelle

1. Créer ou charger un spot.
2. Lancer un calcul.
3. Enregistrer le résultat dans l’historique.
4. Recharger la page.
5. Vérifier que l’historique existe toujours.
6. Lancer un calcul pour une autre date.
7. Supprimer une entrée.
8. Supprimer l’historique du spot.

## Commandes finales

```bash
npm test
npm run build
```
