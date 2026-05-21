# Prompt Cursor — 06A — Couche localStorage pour les spots

## Contexte

Sunset Horizon reste une application statique sans backend, sans compte utilisateur et sans Supabase. Les spots doivent être sauvegardés uniquement dans le navigateur.

Cette étape crée uniquement la couche de persistance locale. Elle ne doit pas créer d'interface React, sauf si le projet nécessite un export minimal pour préparer l'étape suivante.

## À lire avant modification

- `AGENTS.md`
- `README.md`
- `docs/01_FUNCTIONAL_SPEC.md`
- `docs/02_ARCHITECTURE.md`
- `docs/05_UX_UI.md`
- `docs/06_DESIGN_SYSTEM.md`
- `docs/07_ROADMAP.md`
- `src/features/location/`
- `src/features/results/`

## Objectif

Créer une couche testable pour sauvegarder, charger, mettre à jour et supprimer des spots d'observation dans `localStorage`.

## Architecture attendue

Créer :

```txt
src/features/spots/
  spotTypes.ts
  spotStorage.ts
  spotStorage.test.ts
```

Optionnel si utile :

```txt
src/features/spots/index.ts
```

## Modèle de données recommandé

```ts
export type SavedSpot = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  elevationM?: number;
  createdAt: string;
  updatedAt: string;
  lastComputedAt?: string;
  lastComputedResult?: {
    officialSunsetIso?: string;
    terrainSunsetIso?: string | null;
    deltaMinutes?: number | null;
    sunsetAzimuthDeg?: number;
    horizonAngleDeg?: number;
    blockingDistanceM?: number;
    blockingElevationM?: number;
    uncertaintyMinutes?: number;
  };
};
```

Adapter les noms au code existant si des types équivalents existent déjà.

## Versionnement local

Stocker une enveloppe versionnée :

```ts
export type SavedSpotsStoragePayload = {
  schemaVersion: 1;
  spots: SavedSpot[];
};
```

Clé recommandée :

```txt
sunset-horizon:saved-spots:v1
```

## API de stockage attendue

Créer des fonctions pures ou facilement testables :

```ts
getSavedSpots(): SavedSpot[]
saveSpot(input): SavedSpot
updateSpot(id, patch): SavedSpot
removeSpot(id): void
clearSavedSpots(): void
```

Prévoir aussi si utile :

```ts
isLocalStorageAvailable(): boolean
readStoragePayload(): SavedSpotsStoragePayload
writeStoragePayload(payload): void
migrateStoragePayload(raw): SavedSpotsStoragePayload
```

## Comportements attendus

- Générer un `id` stable lors de la création.
- Normaliser le nom du spot : trim, nom par défaut si vide.
- Empêcher les coordonnées invalides : latitude hors `[-90, 90]`, longitude hors `[-180, 180]`.
- Préserver `createdAt` lors des mises à jour.
- Mettre à jour `updatedAt` lors d'une modification.
- Retourner une liste vide si aucune donnée n'existe.
- Retourner une liste vide ou restaurer un payload sain si le JSON est corrompu.
- Ne jamais faire planter l'application si `localStorage` est indisponible.
- Ne pas stocker de données sensibles.
- Ne pas envoyer les spots vers un service distant.

## Tests unitaires attendus

Tester au minimum :

- sauvegarde d'un spot ;
- lecture de plusieurs spots ;
- suppression ;
- mise à jour ;
- nom vide normalisé ;
- coordonnées invalides refusées ;
- JSON corrompu ;
- localStorage indisponible ou qui lève une exception ;
- migration d'un payload inconnu ou incomplet ;
- conservation de `createdAt` après update.

## Contraintes

- Pas de Supabase.
- Pas de compte utilisateur.
- Pas de synchronisation cloud.
- Pas d'IndexedDB dans cette étape.
- Pas de React dans la couche storage.
- Pas de dépendance externe si le navigateur fournit déjà ce qu'il faut.
- Fonctions typées strictement.
- Ne pas modifier le moteur solaire, terrain ou horizon.

## Critères d'acceptation

- La couche storage fonctionne sans composant React.
- Les tests couvrent les cas normaux et les erreurs.
- Une corruption de localStorage ne casse pas l'application.
- Le code est prêt pour l'interface de l'étape 06B.
- `npm run build` passe.
- `npm run test` passe si disponible.

## Avant de coder

1. Analyse l'état actuel.
2. Vérifie si `src/features/spots/` existe déjà.
3. Vérifie les types de position et de résultat existants pour éviter les doublons inutiles.
4. Propose un plan court.
5. Liste les fichiers créés ou modifiés.
6. Attends validation si le workflow du projet le demande.

## Après implémentation

- Résume l'API créée.
- Liste les tests ajoutés.
- Indique les commandes lancées.
- Fais une revue de code mentale : edge cases localStorage, typage, migration, données invalides.
