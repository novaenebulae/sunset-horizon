# Prompt Cursor — Moteur horizon

Implémente le moteur horizon.

Créer :

```txt
src/features/horizon/
  horizonEngine.ts
  crossing.ts
  horizonTypes.ts
  horizonEngine.test.ts
  crossing.test.ts
```

Objectifs :

1. Calculer l'angle apparent de chaque point terrain depuis l'observateur.
2. Identifier le point bloquant.
3. Calculer l'angle d'horizon effectif.
4. Trouver l'heure où le soleil croise cet horizon.
5. Ajouter une recherche par balayage puis dichotomie.

Contraintes :

- Tests unitaires obligatoires sur profils synthétiques.
- Pas d'appel API dans les tests.
- Pas de logique React dans ce module.

À intégrer ensuite dans l'UI :

- heure corrigée ;
- différence avec coucher officiel ;
- distance du point bloquant ;
- angle horizon.
