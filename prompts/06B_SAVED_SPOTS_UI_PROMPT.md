# Prompt Cursor — Interface des spots sauvegardés

Lis avant de modifier le code :

- [AGENTS.md](http://AGENTS.md)

- [README.md](http://README.md)

- docs/01_FUNCTIONAL_[SPEC.md](http://SPEC.md)

- docs/05_UX_[UI.md](http://UI.md)

- docs/06_DESIGN_[SYSTEM.md](http://SYSTEM.md)

- prompts/06A_LOCAL_STORAGE_LAYER_[PROMPT.md](http://PROMPT.md)

- src/features/spots/

- src/features/location/

Objectif :

Ajouter l’interface permettant d’enregistrer, lister, recharger et supprimer des spots d’observation.

Fonctionnalités attendues :

1. Bouton “Enregistrer ce spot”.

2. Formulaire simple pour nommer le spot.

3. Liste des spots sauvegardés.

4. Action “Charger ce spot”.

5. Action “Supprimer”.

6. Affichage coordonnées du spot.

7. Affichage de la dernière date de calcul si disponible.

8. État vide si aucun spot n’est sauvegardé.

Architecture attendue :

Créer ou compléter :

src/features/spots/

  SavedSpotForm.tsx

  SavedSpotList.tsx

  SavedSpotCard.tsx

  useSavedSpots.ts

Contraintes :

- Utiliser la couche spotStorage créée en 06A.

- Ne pas accéder directement à localStorage depuis les composants.

- Ne pas ajouter Supabase.

- Ne pas ajouter d’authentification.

- Garder l’interface mobile-first.

- Respecter docs/05_UX_[UI.md](http://UI.md) et docs/06_DESIGN_[SYSTEM.md](http://SYSTEM.md).

Avant de coder :

1. Analyse l’état actuel.

2. Propose un plan court.

3. Liste les fichiers créés ou modifiés.

4. Attends validation.

Après implémentation :

- vérifier npm run build ;

- tester ajout / chargement / suppression d’un spot ;

- vérifier que le rechargement de page conserve les spots.