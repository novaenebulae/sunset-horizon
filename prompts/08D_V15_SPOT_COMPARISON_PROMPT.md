# Prompt Cursor — 08D V1.5 Comparaison de spots

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

Permettre à l’utilisateur de comparer plusieurs spots sauvegardés pour une même date et d’identifier celui où le soleil reste visible le plus tard.

## Fonctionnalités attendues

### 1. Sélection

Afficher les spots sauvegardés, permettre sélection multiple, désélection, état vide.

### 2. Date commune

Utiliser la date courante de l’application ou un sélecteur dédié.

### 3. Réglages utilisés

Utiliser les réglages avancés courants et afficher le mode utilisé.

### 4. Calculs par spot

Chaque spot doit avoir son état : `idle`, `loading`, `success`, `error`.

### 5. Concurrence limitée

Limiter à 2 calculs simultanés ou utiliser un calcul séquentiel.

### 6. Affichage comparatif

Afficher : nom, coordonnées, coucher officiel, coucher corrigé, delta, azimut, distance du relief bloquant, angle horizon, source terrain, statut, warnings.

Sur mobile, privilégier des cartes plutôt qu’un tableau large.

### 7. Meilleur spot

Mettre en avant le spot avec `terrainSunset` le plus tardif. Gérer égalité et résultats nuls.

### 8. Tri

Ajouter tri par nom, heure corrigée, delta, statut.

### 9. Historique

Option : bouton “Enregistrer les résultats réussis dans l’historique”.

## Architecture attendue

Créer :

```txt
src/features/comparison/
  comparisonTypes.ts
  comparisonService.ts
  useSpotComparison.ts
  SpotComparisonPanel.tsx
  SpotComparisonTable.tsx
  SpotComparisonCard.tsx
  SpotComparisonSummary.tsx
  comparisonService.test.ts
```

## Contraintes spécifiques

- Ne pas dupliquer la logique horizon.
- Ne pas dupliquer la logique solaire.
- Ne pas contourner settings/cache.
- Ne pas appeler IGN directement depuis les composants.
- Une erreur sur un spot ne bloque pas les autres.

## Tests attendus

Ajouter des tests pour : meilleur spot, tri, gestion erreur par spot, liste vide, résultats réussis conservés, concurrence limitée si testable.

## Validation manuelle

1. Créer au moins deux spots.
2. Sélectionner deux spots.
3. Lancer la comparaison.
4. Vérifier le meilleur spot.
5. Changer la date et relancer.
6. Simuler une erreur sur un spot.
7. Tester mobile et desktop.

## Commandes finales

```bash
npm test
npm run build
```

