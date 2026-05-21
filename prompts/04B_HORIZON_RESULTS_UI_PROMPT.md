# Prompt Cursor — Interface des résultats horizon

Lis avant de modifier le code :

- [AGENTS.md](http://AGENTS.md)

- [README.md](http://README.md)

- docs/01_FUNCTIONAL_[SPEC.md](http://SPEC.md)

- docs/03_[ALGORITHM.md](http://ALGORITHM.md)

- docs/05_UX_[UI.md](http://UI.md)

- docs/06_DESIGN_[SYSTEM.md](http://SYSTEM.md)

- prompts/04_HORIZON_ENGINE_[PROMPT.md](http://PROMPT.md)

- src/features/horizon/

- src/features/solar/

- src/features/terrain/

- src/features/location/

Objectif :

Intégrer les résultats du moteur horizon dans l’interface utilisateur.

Fonctionnalités attendues :

1. Afficher l’heure officielle du coucher.

2. Afficher l’heure corrigée derrière le relief.

3. Afficher le décalage en minutes.

4. Afficher l’angle d’horizon effectif.

5. Afficher la distance du point bloquant.

6. Afficher l’altitude du point bloquant.

7. Afficher l’azimut utilisé.

8. Afficher une marge d’incertitude simple si disponible.

9. Afficher les états :

   - prêt à calculer ;

   - calcul en cours ;

   - résultat disponible ;

   - erreur ;

   - données insuffisantes.

Architecture attendue :

Créer ou compléter :

src/features/results/

  SunsetResultCard.tsx

  ResultMetric.tsx

  ResultStatus.tsx

Contraintes :

- Ne pas déplacer la logique de calcul dans les composants React.

- Les composants reçoivent des données déjà calculées.

- Ne pas refaire le client IGN.

- Ne pas refaire le module solaire.

- Ne pas refaire le moteur horizon.

- Respecter le design system.

- Garder une hiérarchie visuelle claire :

  1. heure corrigée ;

  2. décalage ;

  3. détails techniques.

Avant de coder :

1. Analyse l’état actuel.

2. Propose un plan court.

3. Liste les fichiers créés ou modifiés.

4. Attends validation.

Après implémentation :

- vérifier npm run build ;

- tester avec données mockées ;

- vérifier que l’UI reste lisible sur mobile.