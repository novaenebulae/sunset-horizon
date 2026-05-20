# Prompt Cursor — Client IGN Géoplateforme

Implémente le client de données altimétriques IGN.

Créer :

```txt
src/features/terrain/
  ignAltimetryClient.ts
  terrainProfile.ts
  terrainTypes.ts
  terrainErrors.ts
```

Objectifs :

1. Isoler tous les appels IGN dans `ignAltimetryClient.ts`.
2. Prévoir une fonction pour récupérer l'altitude observateur.
3. Prévoir une fonction pour récupérer un profil altimétrique le long d'une ligne.
4. Gérer erreurs réseau, limites API, réponse vide.
5. Ajouter un mode mock pour développer sans consommer l'API.

Important :

- Ne pas inventer définitivement les paramètres IGN si incertains.
- Mettre les endpoints et paramètres dans des constantes documentées.
- Laisser un commentaire `TODO VERIFY IGN API CONTRACT` si nécessaire.
- Garder une interface interne stable : le reste de l'application ne doit pas dépendre du format brut IGN.

Ne pas implémenter encore le moteur horizon.
