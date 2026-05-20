# Prompt Cursor — Module géographique

Implémente uniquement le module géographique.

Créer :

```txt
src/lib/geo/
  angles.ts
  distance.ts
  destination.ts
  types.ts
```

Fonctions attendues :

- `degToRad`
- `radToDeg`
- `normalizeDegrees`
- `haversineDistanceM`
- `destinationPoint`
- `initialBearingDeg` si utile

Ajouter tests Vitest.

Contraintes :

- Fonctions pures.
- Pas de React.
- Pas d'appel réseau.
- Types explicites.
- Tests sur cas simples.

Ne modifie pas l'interface sauf si nécessaire pour corriger une erreur de build.
