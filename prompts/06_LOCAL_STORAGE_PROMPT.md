# Prompt Cursor — Spots localStorage

Implémente la sauvegarde locale des spots.

Créer :

```txt
src/features/spots/
  spotTypes.ts
  spotStorage.ts
  SpotList.tsx
  SaveSpotDialog.tsx
```

Objectifs :

1. Sauvegarder un spot avec nom, coordonnées, altitude optionnelle, date de création.
2. Lister les spots sauvegardés.
3. Recharger un spot sur la carte.
4. Supprimer un spot.
5. Gérer migration simple de schéma localStorage.

Contraintes :

- Pas de Supabase.
- Pas de compte utilisateur.
- Pas de partage cloud.
