# Prompt Cursor — Couche localStorage pour les spots

Lis avant de modifier le code :

- [AGENTS.md](http://AGENTS.md)

- [README.md](http://README.md)

- docs/01_FUNCTIONAL_[SPEC.md](http://SPEC.md)

- docs/02_[ARCHITECTURE.md](http://ARCHITECTURE.md)

- docs/07_[ROADMAP.md](http://ROADMAP.md)

- src/features/location/

- src/features/results/

Objectif :

Créer une couche de persistance locale pour sauvegarder les spots d’observation dans le navigateur.

Fonctionnalités attendues :

1. Sauvegarder un spot d’observation.

2. Charger la liste des spots.

3. Supprimer un spot.

4. Mettre à jour un spot.

5. Prévoir une version de schéma locale.

6. Gérer les erreurs de parsing localStorage.

7. Gérer le cas où localStorage est indisponible.

Données minimales d’un spot :

- id ;

- name ;

- latitude ;

- longitude ;

- elevation optionnelle ;

- createdAt ;

- updatedAt ;

- lastComputedResult optionnel.

Architecture attendue :

Créer :

src/features/spots/

  spotTypes.ts

  spotStorage.ts

  spotStorage.test.ts

Contraintes :

- Pas de Supabase.

- Pas de compte utilisateur.

- Pas de synchronisation cloud.

- Pas d’IndexedDB pour cette étape.

- Fonctions testables.

- Pas de React dans la couche storage.

- Prévoir une migration simple si la structure évolue.

Avant de coder :

1. Analyse l’état actuel.

2. Propose un plan court.

3. Liste les fichiers créés ou modifiés.

4. Attends validation.

Après implémentation :

- ajouter des tests unitaires ;

- vérifier npm run build ;

- vérifier npm run test si disponible.