# Prompt Cursor — 08H V1.5 Horizon 360 simplifié

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

Ajouter une première version simplifiée de l’horizon 360 autour du point d’observation. Cette fonctionnalité doit rester exploratoire, manuelle et non bloquante.

## Fonctionnalités attendues

### 1. Déclenchement manuel

Ajouter bouton `Calculer l’horizon 360 simplifié`. Ne pas lancer automatiquement.

### 2. Échantillonnage

Par défaut : pas d’azimut 15° soit environ 24 directions.

Optionnel selon mode : rapide 30°, équilibré 15°, précis 10° maximum. Ne pas descendre sous 10° en V1.5.

### 3. Calcul par azimut

Pour chaque azimut : profil terrain, angle horizon maximal, point bloquant, statut success/error. Continuer même si un azimut échoue.

### 4. Progression

Afficher `Calcul 8 / 24 directions…` et bouton annuler.

### 5. Annulation

Utiliser `AbortController` si applicable ou un flag de cancellation dans le hook.

### 6. Graphique

Afficher azimut en X, angle horizon en Y, mettre en évidence l’azimut du coucher actuel, tooltip avec angle/distance/statut.

### 7. Résultats partiels

Afficher les points réussis et un warning si certains azimuts échouent.

### 8. Cache et diagnostic

Réutiliser le cache terrain et prévoir si simple : hits, misses, erreurs.

## Architecture attendue

Créer :

```txt
src/features/horizon360/
  horizon360Types.ts
  horizon360Service.ts
  useHorizon360.ts
  Horizon360Panel.tsx
  Horizon360Chart.tsx
  horizon360Service.test.ts
```

## Contraintes spécifiques

- Ne pas intégrer LiDAR HD.
- Ne pas viser la précision maximale.
- Ne pas saturer l’API IGN.
- Ne pas bloquer l’interface.
- Ne pas lancer automatiquement.
- Ne pas dupliquer le calcul d’angle apparent.

## Tests attendus

Ajouter des tests pour : génération azimuts, calcul mock provider, résultats partiels, erreurs par azimut, annulation si testable, mise en évidence de l’azimut du coucher.

## Validation manuelle

1. Choisir un spot.
2. Lancer le calcul principal.
3. Lancer horizon 360.
4. Vérifier progression.
5. Annuler.
6. Relancer.
7. Vérifier graphique et azimut coucher.
8. Vérifier cache au deuxième lancement.
9. Tester mobile et desktop.

## Commandes finales

```bash
npm test
npm run build
```

