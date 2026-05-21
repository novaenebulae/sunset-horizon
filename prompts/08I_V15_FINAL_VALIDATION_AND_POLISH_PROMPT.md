# Prompt Cursor — 08I V1.5 Validation finale et polish

Nouveau prompt final pour terminer la V1.5.

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

Auditer, corriger et finaliser la version 1.5 sans ajouter de nouvelle fonctionnalité majeure.

## Règle principale

Ne pas ajouter de nouvelles fonctionnalités. Corriger uniquement bugs, incohérences UI, erreurs TypeScript, tests manquants importants, documentation obsolète, problèmes responsive, erreurs de persistance locale et problèmes de build.

## Parcours à vérifier

### Parcours MVP

- [ ] Géolocalisation navigateur.
- [ ] Recherche d’adresse.
- [ ] Clic carte.
- [ ] Sélection date.
- [ ] Calcul coucher officiel.
- [ ] Calcul coucher corrigé.
- [ ] Affichage point bloquant.
- [ ] Affichage ligne azimut.
- [ ] Affichage profil altimétrique.
- [ ] Enregistrement / chargement / suppression d’un spot.

### V1.5

- [ ] Réglages avancés.
- [ ] Historique local.
- [ ] Cache IndexedDB.
- [ ] Comparaison de spots.
- [ ] URL partageable.
- [ ] Export/import JSON.
- [ ] Diagnostic.
- [ ] Horizon 360 simplifié.

## Responsive

Tester au minimum :

```txt
375px mobile
768px tablette
1024px laptop
1440px desktop large
```

Vérifier : pas de scroll horizontal, carte lisible, graphiques lisibles, tableaux transformés en cartes si nécessaire, diagnostic non envahissant, comparaison utilisable sur mobile.

## Documentation à mettre à jour

Mettre à jour si nécessaire :

```txt
README.md
docs/01_FUNCTIONAL_SPEC.md
docs/02_ARCHITECTURE.md
docs/05_UX_UI.md
docs/07_ROADMAP.md
docs/08_TEST_PLAN.md
V15_BACKLOG.md
```

Ajouter : version 1.5, limites connues, données stockées localement, export/import, cache local, URL partageable, horizon 360 simplifié.

## Qualité code

Vérifier : pas de logique lourde dans composants, pas d’accès direct à localStorage/IndexedDB hors services, pas de duplication horizon/solaire, types propres, tests colocated, pas d’imports morts, pas de `any` inutile, erreurs utilisateur lisibles.

## Commandes finales

```bash
npm test
npm run build
npm run lint
```

Lancer `npm run lint` uniquement si disponible.

## Rapport final attendu

Produire :

```txt
Résumé V1.5
- Fonctionnalités vérifiées
- Bugs corrigés
- Fichiers modifiés
- Tests lancés
- Build lancé
- Risques restants
- Points à reporter en V2
```
