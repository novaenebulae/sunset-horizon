# Architecture technique

## Principe général

L'application doit rester entièrement statique : tout le calcul est fait dans le navigateur.

```txt
Navigateur
  ├─ React UI
  ├─ Moteur solaire
  ├─ Moteur géographique
  ├─ Client IGN Altimétrie
  ├─ Moteur horizon
  ├─ Stockage local
  └─ Visualisations

GitHub Pages
  └─ sert les fichiers statiques générés par Vite
```

## Modules

### `features/solar`

Responsabilités :

- calcul des heures solaires ;
- position du soleil pour une date/heure ;
- interpolation autour du coucher ;
- correction de réfraction.

### `features/terrain`

Responsabilités :

- génération de points le long d'un azimut ;
- appel API IGN ;
- normalisation des profils altimétriques ;
- fallback en cas d'échec.

### `features/horizon`

Responsabilités :

- calcul des angles apparents du relief ;
- identification du point bloquant ;
- croisement soleil/horizon ;
- calcul de la marge d'erreur.

### `features/map`

Responsabilités :

- affichage carte ;
- marqueur observateur ;
- ligne d'azimut ;
- point bloquant ;
- sélection manuelle.

### `features/results`

Responsabilités :

- cartes de résultats ;
- badges de précision ;
- messages d'alerte.

### `features/spots`

Responsabilités :

- sauvegarde locale ;
- chargement ;
- suppression ;
- comparaison locale.

## Types principaux

```ts
export type GeoPoint = {
  lat: number;
  lon: number;
  elevation?: number;
};

export type TerrainSample = {
  point: GeoPoint;
  distanceM: number;
  elevationM: number;
  apparentAngleDeg: number;
};

export type HorizonProfile = {
  observer: GeoPoint;
  azimuthDeg: number;
  samples: TerrainSample[];
  blockingSample: TerrainSample | null;
  horizonAngleDeg: number;
  source: 'ign-geoplateforme' | 'mock' | 'fallback';
};

export type SunsetResult = {
  officialSunset: Date;
  terrainSunset: Date | null;
  deltaMinutes: number | null;
  sunsetAzimuthDeg: number;
  horizonProfile: HorizonProfile;
  uncertaintyMinutes: number;
  warnings: string[];
};
```

## Déploiement GitHub Pages

- Build Vite.
- Dossier de sortie : `dist/`.
- GitHub Actions pour publier sur Pages.
- Variable `base` dans `vite.config.ts` si le site est servi sous `/nom-du-repo/`.
